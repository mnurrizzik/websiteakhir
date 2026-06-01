<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WorkspaceSetting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /* ── GET /api/settings ─────────────────────────── */
    public function index(Request $request)
    {
        $current = $this->authenticate($request);
        if (!$current) return response()->json(['message' => 'Unauthorized.'], 401);
        if ($current->role !== 'super_admin') return response()->json(['message' => 'Forbidden.'], 403);

        return response()->json([
            'workspace' => [
                'name'        => WorkspaceSetting::get('workspace_name', 'ProjectFlow'),
                'domain'      => WorkspaceSetting::get('workspace_domain', 'projectflow.app'),
                'description' => WorkspaceSetting::get('workspace_description', 'Platform manajemen project internal.'),
            ],
            'notifications' => WorkspaceSetting::get('notifications', [
                'email_system'    => true,
                'email_summary'   => true,
                'email_security'  => true,
                'email_tips'      => false,
                'app_realtime'    => true,
                'app_deadline'    => true,
                'app_status'      => false,
            ]),
            'appearance' => WorkspaceSetting::get('appearance', [
                'theme'      => 'Ikuti sistem',
                'language'   => 'Bahasa Indonesia',
                'text_size'  => 'Sedang (default)',
                'accent'     => 'Indigo (default)',
                'compact'    => false,
                'animations' => true,
            ]),
            'security' => WorkspaceSetting::get('security', [
                'two_factor'          => true,
                'login_notifications' => true,
            ]),
        ]);
    }

    /* ── PATCH /api/settings/workspace ─────────────── */
    public function updateWorkspace(Request $request)
    {
        $current = $this->authenticate($request);
        if (!$current) return response()->json(['message' => 'Unauthorized.'], 401);
        if ($current->role !== 'super_admin') return response()->json(['message' => 'Forbidden.'], 403);

        $validated = $request->validate([
            'name'        => ['sometimes', 'string', 'max:80'],
            'domain'      => ['sometimes', 'string', 'max:100'],
            'description' => ['sometimes', 'string', 'max:255'],
        ]);

        if (isset($validated['name']))        WorkspaceSetting::set('workspace_name', $validated['name']);
        if (isset($validated['domain']))      WorkspaceSetting::set('workspace_domain', $validated['domain']);
        if (isset($validated['description'])) WorkspaceSetting::set('workspace_description', $validated['description']);

        return response()->json(['ok' => true]);
    }

    /* ── PATCH /api/settings/notifications ─────────── */
    public function updateNotifications(Request $request)
    {
        $current = $this->authenticate($request);
        if (!$current) return response()->json(['message' => 'Unauthorized.'], 401);
        if ($current->role !== 'super_admin') return response()->json(['message' => 'Forbidden.'], 403);

        $validated = $request->validate([
            'email_system'    => ['sometimes', 'boolean'],
            'email_summary'   => ['sometimes', 'boolean'],
            'email_security'  => ['sometimes', 'boolean'],
            'email_tips'      => ['sometimes', 'boolean'],
            'app_realtime'    => ['sometimes', 'boolean'],
            'app_deadline'    => ['sometimes', 'boolean'],
            'app_status'      => ['sometimes', 'boolean'],
        ]);

        $current_notif = WorkspaceSetting::get('notifications', []);
        WorkspaceSetting::set('notifications', array_merge((array)$current_notif, $validated));

        return response()->json(['ok' => true]);
    }

    /* ── PATCH /api/settings/appearance ────────────── */
    public function updateAppearance(Request $request)
    {
        $current = $this->authenticate($request);
        if (!$current) return response()->json(['message' => 'Unauthorized.'], 401);
        if ($current->role !== 'super_admin') return response()->json(['message' => 'Forbidden.'], 403);

        $validated = $request->validate([
            'theme'      => ['sometimes', 'string'],
            'language'   => ['sometimes', 'string'],
            'text_size'  => ['sometimes', 'string'],
            'accent'     => ['sometimes', 'string'],
            'compact'    => ['sometimes', 'boolean'],
            'animations' => ['sometimes', 'boolean'],
        ]);

        $current_app = WorkspaceSetting::get('appearance', []);
        WorkspaceSetting::set('appearance', array_merge((array)$current_app, $validated));

        return response()->json(['ok' => true]);
    }

    /* ── PATCH /api/settings/security ──────────────── */
    public function updateSecurity(Request $request)
    {
        $current = $this->authenticate($request);
        if (!$current) return response()->json(['message' => 'Unauthorized.'], 401);
        if ($current->role !== 'super_admin') return response()->json(['message' => 'Forbidden.'], 403);

        $validated = $request->validate([
            'two_factor'          => ['sometimes', 'boolean'],
            'login_notifications' => ['sometimes', 'boolean'],
            'new_password'        => ['sometimes', 'string', 'min:6', 'max:72'],
        ]);

        // Update security toggles
        $sec = WorkspaceSetting::get('security', []);
        $toSave = array_merge((array)$sec, array_filter($validated, fn($k) => $k !== 'new_password', ARRAY_FILTER_USE_KEY));
        WorkspaceSetting::set('security', $toSave);

        // Update password if provided
        if (!empty($validated['new_password'])) {
            $current->password = bcrypt($validated['new_password']);
            $current->save();
        }

        return response()->json(['ok' => true]);
    }

    private function authenticate(Request $request): ?User
    {
        $token = $request->bearerToken();
        if (!$token) return null;
        return User::where('api_token', hash('sha256', $token))->first();
    }
}