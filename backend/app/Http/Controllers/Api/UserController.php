<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $current = $this->authenticate($request);
        if (!$current) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $users = User::orderBy('created_at', 'desc')->get()->map(fn (User $user) => $this->transformUser($user));

        return response()->json(['users' => $users]);
    }

    public function store(Request $request)
    {
        // FIX: pakai pengecekan manual, bukan abort() dengan response object
        $current = $this->authenticate($request);
        if (!$current) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }
        if ($current->role !== 'super_admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string', 'min:6', 'max:72'],
            'name'     => ['required', 'string', 'max:80'],
            'role'     => ['required', 'in:super_admin,admin,client'],
            'clientId' => ['nullable', 'string', 'max:60'],
        ]);

        $user = new User();
        $user->id       = (string) Str::uuid();
        $user->email    = $validated['email'];
        $user->password = Hash::make($validated['password']);
        $user->name     = $validated['name'];
        $user->role     = $validated['role'];
        $user->client_id = $validated['role'] === 'client' ? $validated['clientId'] ?? null : null;
        $user->status   = 'active';
        $user->color    = $this->pickColor();
        $user->initials = $this->initialsOf($validated['name']);
        $user->save();

        return response()->json(['id' => $user->id]);
    }

    public function update(Request $request, string $id)
    {
        // FIX: pakai pengecekan manual, bukan abort() dengan response object
        $current = $this->authenticate($request);
        if (!$current) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }
        if ($current->role !== 'super_admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'email'    => ['sometimes', 'email'],
            'password' => ['sometimes', 'string', 'min:6', 'max:72'],
            'name'     => ['sometimes', 'string', 'max:80'],
            'role'     => ['sometimes', 'in:super_admin,admin,client'],
            'clientId' => ['nullable', 'string', 'max:60'],
            'status'   => ['sometimes', 'in:active,inactive'],
        ]);

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }

        if (isset($validated['password']) && $validated['password'] !== '') {
            $user->password = Hash::make($validated['password']);
        }

        if (isset($validated['name'])) {
            $user->name     = $validated['name'];
            $user->initials = $this->initialsOf($validated['name']);
        }

        if (isset($validated['status'])) {
            $user->status = $validated['status'];
        }

        if (isset($validated['role'])) {
            $user->role      = $validated['role'];
            $user->client_id = $validated['role'] === 'client' ? $validated['clientId'] ?? null : null;
        } elseif (array_key_exists('clientId', $validated)) {
            $user->client_id = $validated['clientId'];
        }

        $user->save();

        return response()->json(['ok' => true]);
    }

    public function destroy(Request $request, string $id)
    {
        // FIX: pakai pengecekan manual, bukan abort() dengan response object
        $current = $this->authenticate($request);
        if (!$current) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }
        if ($current->role !== 'super_admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($current->id === $id) {
            return response()->json(['message' => 'Tidak bisa menghapus akun sendiri.'], 400);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        $user->delete();

        return response()->json(['ok' => true]);
    }

    private function authenticate(Request $request): ?User
    {
        $token = $request->bearerToken();
        if (!$token) {
            return null;
        }

        return User::where('api_token', hash('sha256', $token))->first();
    }

    private function transformUser(User $user): array
    {
        return [
            'id'        => (string) $user->id,
            'email'     => $user->email,
            'name'      => $user->name,
            'role'      => $user->role,
            'clientId'  => $user->client_id,
            'status'    => $user->status,
            'initials'  => $user->initials,
            'color'     => $user->color,
            'createdAt' => $user->created_at?->toDateString() ?? '',
            'password'  => '',
        ];
    }

    private function initialsOf(string $name): string
    {
        return collect(explode(' ', $name))->filter()->take(2)->map(fn ($part) => strtoupper(substr($part, 0, 1)))->join('') ?: 'US';
    }

    private function pickColor(): string
    {
        $palette = [
            'oklch(0.58 0.18 255)',
            'oklch(0.65 0.16 155)',
            'oklch(0.78 0.15 75)',
            'oklch(0.65 0.2 320)',
            'oklch(0.7 0.15 200)',
            'oklch(0.7 0.13 200)',
        ];

        return $palette[array_rand($palette)];
    }
}