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
            ['email' => 'super@corestone.id',  'password' => 'password123', 'name' => 'Super Admin', 'role' => 'super_admin', 'initials' => 'SA', 'color' => 'oklch(0.58 0.18 255)'],
            ['email' => 'admin@corestone.id',  'password' => 'password123', 'name' => 'Admin Utama', 'role' => 'admin',       'initials' => 'AD', 'color' => 'oklch(0.65 0.16 155)'],
            ['email' => 'acme@corestone.id',   'password' => 'password123', 'name' => 'Acme Corp',   'role' => 'client',      'initials' => 'AC', 'color' => 'oklch(0.7 0.15 200)'],
            ['email' => 'shopnow@corestone.id','password' => 'password123', 'name' => 'ShopNow',     'role' => 'client',      'initials' => 'SN', 'color' => 'oklch(0.78 0.15 75)'],
            ['email' => 'dataflow@corestone.id','password'=> 'password123', 'name' => 'DataFlow',    'role' => 'client',      'initials' => 'DF', 'color' => 'oklch(0.65 0.2 320)'],
        ];

        $emailToId = [];
        foreach ($seedUsers as $userData) {
            $user = User::firstWhere('email', $userData['email']);
            if (!$user) {
                $user = User::create([
                    'id'        => (string) Str::uuid(),
                    'email'     => $userData['email'],
                    'password'  => Hash::make($userData['password']),
                    'name'      => $userData['name'],
                    'role'      => $userData['role'],
                    // ✅ client_id di tabel users tidak dipakai untuk ownership project
                    // ownership project pakai user.id langsung
                    'client_id' => null,
                    'status'    => 'active',
                    'color'     => $userData['color'],
                    'initials'  => $userData['initials'],
                ]);
            }
            $emailToId[$userData['email']] = $user->id;
        }

        $adminId = $emailToId['admin@corestone.id'];

        // ✅ FIX: ambil UUID user yang benar untuk client_id project
        $acmeId     = $emailToId['acme@corestone.id'];
        $shopNowId  = $emailToId['shopnow@corestone.id'];
        $dataFlowId = $emailToId['dataflow@corestone.id'];

        $existingProjects = Project::count();
        if ($existingProjects === 0) {
            Project::create([
                'id'          => (string) Str::uuid(),
                'name'        => 'Redesign Landing Page Acme',
                'category'    => 'UI/UX Design',
                'client'      => 'Acme Corp',
                // ✅ FIX: pakai UUID user, bukan 'c-001'
                'client_id'   => $acmeId,
                'admin_id'    => $adminId,
                'status'      => 'in-progress',
                'progress'    => 68,
                'deadline'    => '2026-06-12',
                'description' => 'Redesign halaman utama dengan style modern dan konversi tinggi.',
            ]);
            Project::create([
                'id'          => (string) Str::uuid(),
                'name'        => 'Mobile App E-commerce',
                'category'    => 'Mobile Development',
                'client'      => 'ShopNow',
                // ✅ FIX: pakai UUID user, bukan 'c-002'
                'client_id'   => $shopNowId,
                'admin_id'    => $adminId,
                'status'      => 'review',
                'progress'    => 92,
                'deadline'    => '2026-05-28',
                'description' => 'Aplikasi mobile cross-platform dengan fitur checkout & payment gateway.',
            ]);
            Project::create([
                'id'          => (string) Str::uuid(),
                'name'        => 'Dashboard Analytics SaaS',
                'category'    => 'Web Development',
                'client'      => 'DataFlow',
                // ✅ FIX: pakai UUID user, bukan 'c-003'
                'client_id'   => $dataFlowId,
                'admin_id'    => $adminId,
                'status'      => 'in-progress',
                'progress'    => 45,
                'deadline'    => '2026-07-04',
                'description' => 'Dashboard analytics realtime untuk produk SaaS.',
            ]);
        }

        return response()->json(['seeded' => true]);
    }
}