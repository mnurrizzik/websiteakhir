<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\File;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileController extends Controller
{
    public function index(Request $request)
    {
        $user = $this->authenticate($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $query = File::query()->orderBy('created_at', 'desc');

        // Client hanya lihat file project miliknya
        if ($user->role === 'client') {
            $query->whereHas('project', function ($q) use ($user) {
                $q->where('client_id', $user->client_id);
            });
        } elseif ($user->role === 'admin') {
            // Admin hanya lihat file project yang di-assign ke dia
            $query->where(function ($q) use ($user) {
                $q->whereNull('project_id')
                  ->orWhereHas('project', function ($q2) use ($user) {
                      $q2->where('admin_id', $user->id);
                  });
            });
        }

        $files = $query->get()->map(fn (File $f) => $this->transformFile($f));

        return response()->json(['files' => $files]);
    }

    public function store(Request $request)
    {
        $user = $this->authenticate($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $request->validate([
            'file'       => ['required', 'file', 'max:51200'], // max 50MB
            'project_id' => ['nullable', 'string'],
        ]);

        $uploaded = $request->file('file');
        $originalName = $uploaded->getClientOriginalName();
        $mime = $uploaded->getMimeType();
        $size = $uploaded->getSize();
        $ext = strtolower($uploaded->getClientOriginalExtension());

        // Tentukan type label
        $type = match(true) {
            in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']) => 'Image',
            in_array($ext, ['zip', 'rar', '7z', 'tar', 'gz'])            => 'ZIP',
            in_array($ext, ['pdf'])                                        => 'PDF',
            in_array($ext, ['doc', 'docx'])                               => 'DOC',
            in_array($ext, ['xls', 'xlsx'])                               => 'XLS',
            in_array($ext, ['fig', 'sketch', 'xd'])                       => 'Design',
            default                                                        => 'File',
        };

        $path = $uploaded->store('files', 'public');

        $file = new File();
        $file->id            = (string) Str::uuid();
        $file->name          = $originalName;
        $file->original_name = $originalName;
        $file->mime_type     = $mime;
        $file->type          = $type;
        $file->size          = $size;
        $file->path          = $path;
        $file->project_id    = $request->input('project_id') ?? null;
        $file->uploaded_by   = $user->id;
        $file->save();

        return response()->json(['file' => $this->transformFile($file)], 201);
    }

    public function destroy(Request $request, string $id)
    {
        $user = $this->authenticate($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $file = File::find($id);
        if (!$file) {
            return response()->json(['message' => 'File tidak ditemukan.'], 404);
        }

        // Hanya super_admin atau yang upload bisa hapus
        if ($user->role !== 'super_admin' && $file->uploaded_by !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        Storage::disk('public')->delete($file->path);
        $file->delete();

        return response()->json(['ok' => true]);
    }

    public function download(Request $request, string $id)
    {
        $user = $this->authenticate($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $file = File::find($id);
        if (!$file) {
            return response()->json(['message' => 'File tidak ditemukan.'], 404);
        }

        $fullPath = Storage::disk('public')->path($file->path);
        if (!file_exists($fullPath)) {
            return response()->json(['message' => 'File tidak ditemukan di storage.'], 404);
        }

        return response()->download($fullPath, $file->original_name);
    }

    private function authenticate(Request $request): ?User
    {
        $token = $request->bearerToken();
        if (!$token) return null;
        return User::where('api_token', hash('sha256', $token))->first();
    }

    private function transformFile(File $f): array
    {
        return [
            'id'          => $f->id,
            'name'        => $f->name,
            'type'        => $f->type,
            'size'        => $this->formatSize($f->size),
            'sizeBytes'   => $f->size,
            'projectId'   => $f->project_id,
            'uploadedBy'  => $f->uploaded_by,
            'date'        => $f->created_at?->format('d M Y') ?? '',
            'url'         => $f->path ? asset('storage/' . $f->path) : null,
        ];
    }

    private function formatSize(int $bytes): string
    {
        if ($bytes >= 1073741824) return round($bytes / 1073741824, 1) . ' GB';
        if ($bytes >= 1048576)    return round($bytes / 1048576, 1) . ' MB';
        if ($bytes >= 1024)       return round($bytes / 1024, 1) . ' KB';
        return $bytes . ' B';
    }
}