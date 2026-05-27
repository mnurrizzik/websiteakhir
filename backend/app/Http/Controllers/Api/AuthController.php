<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();
        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Email atau password salah.'], 403);
        }

        $token = Str::random(60);
        $user->api_token = hash('sha256', $token);
        $user->save();

        return response()->json([
            'token' => $token,
            'user' => $this->transformUser($user),
        ]);
    }

    public function logout(Request $request)
    {
        $user = $this->authenticate($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $user->api_token = null;
        $user->save();

        return response()->json(['ok' => true]);
    }

    public function me(Request $request)
    {
        $user = $this->authenticate($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        return response()->json(['user' => $this->transformUser($user)]);
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
            'id' => (string) $user->id,
            'email' => $user->email,
            'name' => $user->name,
            'role' => $user->role,
            'clientId' => $user->client_id,
            'status' => $user->status,
            'initials' => $user->initials,
            'color' => $user->color,
            'createdAt' => $user->created_at?->toDateString() ?? '',
            'password' => '',
        ];
    }
}
