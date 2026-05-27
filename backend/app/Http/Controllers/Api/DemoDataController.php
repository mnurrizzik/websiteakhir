<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoDataController extends Controller
{
    public function seed(Request $request)
    {
        $superAdmin = User::firstWhere('email', 'super@corestone.id');
        if ($superAdmin) {
            return response()->json(['seeded' => false]);
        }

        $seedUsers = [
            ['email' => 'super@corestone.id', 'password' => 'password123', 'name' => 'Super Admin', 'role' => 'super_admin', 'clientId' => null, 'initials' => 'SA', 'color' => 'oklch(0.58 0.18 255)'],
            ['email' => 'admin@corestone.id', 'password' => 'password123', 'name' => 'Admin Utama', 'role' => 'admin', 'clientId' => null, 'initials' => 'AD', 'color' => 'oklch(0.65 0.16 155)'],
            ['email' => 'acme@corestone.id', 'password' => 'password123', 'name' => 'Acme Corp', 'role' => 'client', 'clientId' => 'c-001', 'initials' => 'AC', 'color' => 'oklch(0.7 0.15 200)'],
            ['email' => 'shopnow@corestone.id', 'password' => 'password123', 'name' => 'ShopNow', 'role' => 'client', 'clientId' => 'c-002', 'initials' => 'SN', 'color' => 'oklch(0.78 0.15 75)'],
            ['email' => 'dataflow@corestone.id', 'password' => 'password123', 'name' => 'DataFlow', 'role' => 'client', 'clientId' => 'c-003', 'initials' => 'DF', 'color' => 'oklch(0.65 0.2 320)'],
        ];

        $emailToId = [];
        foreach ($seedUsers as $userData) {
            $user = User::firstWhere('email', $userData['email']);
            if (!$user) {
                $user = User::create([
                    'id' => (string) Str::uuid(),
                    'email' => $userData['email'],
                    'password' => Hash::make($userData['password']),
                    'name' => $userData['name'],
                    'role' => $userData['role'],
                    'client_id' => $userData['clientId'],
                    'status' => 'active',
                    'color' => $userData['color'],
                    'initials' => $userData['initials'],
                ]);
            }
            $emailToId[$userData['email']] = $user->id;
        }

        $adminId = $emailToId['admin@corestone.id'];

        $existingProjects = Project::count();
        if ($existingProjects === 0) {
            Project::create([
                'id' => (string) Str::uuid(),
                'name' => 'Redesign Landing Page Acme',
                'category' => 'UI/UX Design',
                'client' => 'Acme Corp',
                'client_id' => 'c-001',
                'admin_id' => $adminId,
                'status' => 'in-progress',
                'progress' => 68,
                'deadline' => '2026-06-12',
                'description' => 'Redesign halaman utama dengan style modern dan konversi tinggi.',
            ]);
            Project::create([
                'id' => (string) Str::uuid(),
                'name' => 'Mobile App E-commerce',
                'category' => 'Mobile Development',
                'client' => 'ShopNow',
                'client_id' => 'c-002',
                'admin_id' => $adminId,
                'status' => 'review',
                'progress' => 92,
                'deadline' => '2026-05-28',
                'description' => 'Aplikasi mobile cross-platform dengan fitur checkout & payment gateway.',
            ]);
            Project::create([
                'id' => (string) Str::uuid(),
                'name' => 'Dashboard Analytics SaaS',
                'category' => 'Web Development',
                'client' => 'DataFlow',
                'client_id' => 'c-003',
                'admin_id' => $adminId,
                'status' => 'in-progress',
                'progress' => 45,
                'deadline' => '2026-07-04',
                'description' => 'Dashboard analytics realtime untuk produk SaaS.',
            ]);
        }

        return response()->json(['seeded' => true]);
    }
}
