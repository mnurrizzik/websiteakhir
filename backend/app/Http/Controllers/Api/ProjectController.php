<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $user = $this->authenticate($request);

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 401);
        }

        $query = Project::query();

        if ($user->role === 'client') {

            $query->where(function ($q) use ($user) {

                $q->where('client_id', $user->id);

                if ($user->client_id) {
                    $q->orWhere('client_id', $user->client_id);
                }
            });

        } elseif ($user->role === 'admin') {

            $query->where('admin_id', $user->id);
        }

        $projects = $query
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn(Project $project) => $this->transformProject($project));

        return response()->json([
            'projects' => $projects
        ]);
    }

    public function show(Request $request, string $id)
    {
        $user = $this->authenticate($request);

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 401);
        }

        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'message' => 'Project tidak ditemukan.'
            ], 404);
        }

        if ($user->role === 'client') {

            $isOwner =
                $project->client_id === $user->id ||
                ($user->client_id &&
                    $project->client_id === $user->client_id);

            if (!$isOwner) {
                return response()->json([
                    'message' => 'Forbidden.'
                ], 403);
            }
        }

        if (
            $user->role === 'admin' &&
            $project->admin_id !== $user->id
        ) {
            return response()->json([
                'message' => 'Forbidden.'
            ], 403);
        }

        return response()->json(
            $this->transformProject($project)
        );
    }

    public function store(Request $request)
    {
        $user = $this->authenticate($request);

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 401);
        }

        if ($user->role !== 'super_admin') {
            return response()->json([
                'message' => 'Forbidden.'
            ], 403);
        }

        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'category'    => ['required', 'string', 'max:255'],
            'clientId'    => ['required', 'string', 'max:60'],
            'client'      => ['required', 'string', 'max:255'],
            'adminId'     => ['nullable', 'string'],
            'deadline'    => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
        ]);

        $clientUser = User::where(function ($q) use ($validated) {

                $q->where('id', $validated['clientId'])
                  ->orWhere('client_id', $validated['clientId']);

            })
            ->where('role', 'client')
            ->first();

        if (!$clientUser) {

            return response()->json([
                'message' => 'Client tidak ditemukan.'
            ], 422);
        }

        DB::beginTransaction();

        try {

            $project = new Project();

            $project->id          = (string) Str::uuid();
            $project->name        = $validated['name'];
            $project->category    = $validated['category'];
            $project->client      = $clientUser->name;
            $project->client_id   = $clientUser->id;
            $project->admin_id    = $validated['adminId'] ?? null;
            $project->status      = 'pending';
            $project->progress    = 0;
            $project->deadline    = $validated['deadline'] ?? null;
            $project->description = $validated['description'] ?? '';

            $project->save();

            DB::commit();

            return response()->json([
                'id' => $project->id
            ], 201);

        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Gagal membuat project.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, string $id)
    {
        $user = $this->authenticate($request);

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 401);
        }

        if (
            $user->role !== 'admin' &&
            $user->role !== 'super_admin'
        ) {
            return response()->json([
                'message' => 'Forbidden.'
            ], 403);
        }

        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'message' => 'Project tidak ditemukan.'
            ], 404);
        }

        if (
            $user->role === 'admin' &&
            $project->admin_id !== $user->id
        ) {
            return response()->json([
                'message' => 'Forbidden.'
            ], 403);
        }

        $validated = $request->validate([
            'status'      => ['sometimes', 'in:pending,in-progress,review,completed,on-hold'],
            'progress'    => ['sometimes', 'integer', 'min:0', 'max:100'],
            'deadline'    => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
            'adminId'     => ['nullable', 'string'],
            'clientId'    => ['nullable', 'string'],
            'client'      => ['nullable', 'string'],
        ]);

        DB::beginTransaction();

        try {

            if (array_key_exists('status', $validated)) {

                $project->status = $validated['status'];

                if ($validated['status'] === 'completed') {
                    $project->progress = 100;
                }
            }

            if (array_key_exists('progress', $validated)) {
                $project->progress = $validated['progress'];
            }

            if (array_key_exists('deadline', $validated)) {
                $project->deadline = $validated['deadline'] ?? null;
            }

            if (array_key_exists('description', $validated)) {
                $project->description = $validated['description'] ?? '';
            }

            if (array_key_exists('adminId', $validated)) {
                $project->admin_id = $validated['adminId'] ?? null;
            }

            if (
                array_key_exists('clientId', $validated) &&
                $validated['clientId']
            ) {

                $clientUser = User::where(function ($q) use ($validated) {

                        $q->where('id', $validated['clientId'])
                          ->orWhere('client_id', $validated['clientId']);

                    })
                    ->where('role', 'client')
                    ->first();

                if ($clientUser) {

                    $project->client_id = $clientUser->id;
                    $project->client    = $clientUser->name;
                }
            }

            $project->save();

            DB::commit();

            return response()->json([
                'ok' => true
            ]);

        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Gagal update project.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, string $id)
    {
        $user = $this->authenticate($request);

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 401);
        }

        if ($user->role !== 'super_admin') {
            return response()->json([
                'message' => 'Forbidden.'
            ], 403);
        }

        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'message' => 'Project tidak ditemukan.'
            ], 404);
        }

        DB::beginTransaction();

        try {

            $project->delete();

            DB::commit();

            return response()->json([
                'ok' => true
            ]);

        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Gagal menghapus project.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    private function authenticate(Request $request): ?User
    {
        $token = $request->bearerToken();

        if (!$token) {
            return null;
        }

        return User::where(
            'api_token',
            hash('sha256', $token)
        )->first();
    }

    private function transformProject(Project $project): array
    {
        $deadline = '';

        if ($project->deadline) {

            $deadline =
                $project->deadline instanceof \Carbon\Carbon
                    ? $project->deadline->format('Y-m-d')
                    : \Carbon\Carbon::parse(
                        $project->deadline
                    )->format('Y-m-d');
        }

        return [
            'id'          => $project->id,
            'name'        => $project->name,
            'category'    => $project->category,
            'client'      => $project->client,
            'clientId'    => $project->client_id,
            'adminId'     => $project->admin_id,
            'status'      => $project->status,
            'progress'    => $project->progress,
            'deadline'    => $deadline,
            'description' => $project->description ?? '',
            'team'        => [],
        ];
    }
}