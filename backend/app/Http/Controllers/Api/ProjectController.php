<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $user = $this->authenticate($request);

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 401);
        }

        $query = Project::query();

        /**
         * CLIENT
         * hanya melihat project miliknya
         */
        if ($user->role === 'client') {

            $query->where(
                'client_id',
                $user->id
            );
        }

        /**
         * ADMIN
         * hanya melihat project yang di assign
         */
        elseif ($user->role === 'admin') {

            $query->where(
                'admin_id',
                $user->id
            );
        }

        /**
         * SUPER ADMIN
         * tampil semua project
         */

        $projects = $query
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(
                fn(Project $project)
                    => $this->transformProject($project)
            );

        return response()->json([
            'projects' => $projects,
        ]);
    }

    public function store(Request $request)
    {
        $user = $this->authenticate($request);

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 401);
        }

        if ($user->role !== 'super_admin') {
            return response()->json([
                'message' => 'Forbidden.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'category' => [
                'required',
                'string',
                'max:255',
            ],

            'clientId' => [
                'required',
                'string',
                'max:255',
            ],

            'client' => [
                'required',
                'string',
                'max:255',
            ],

            'adminId' => [
                'nullable',
                'string',
            ],

            'deadline' => [
                'nullable',
                'date',
            ],

            'description' => [
                'nullable',
                'string',
            ],
        ]);

        $project = new Project();

        $project->id =
            (string) Str::uuid();

        $project->name =
            $validated['name'];

        $project->category =
            $validated['category'];

        $project->client =
            $validated['client'];

        /**
         * IMPORTANT
         * sekarang pakai user.id
         * bukan client_id custom lagi
         */
        $project->client_id =
            $validated['clientId'];

        $project->admin_id =
            $validated['adminId'] ?? null;

        $project->status =
            'pending';

        $project->progress =
            0;

        $project->deadline =
            $validated['deadline'] ?? null;

        $project->description =
            $validated['description'] ?? '';

        $project->save();

        return response()->json([
            'id' => $project->id,
        ], 201);
    }

    public function update(
        Request $request,
        string $id
    ) {
        $user = $this->authenticate($request);

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 401);
        }

        if (
            $user->role !== 'admin' &&
            $user->role !== 'super_admin'
        ) {
            return response()->json([
                'message' => 'Forbidden.',
            ], 403);
        }

        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'message' =>
                    'Project tidak ditemukan.',
            ], 404);
        }

        /**
         * ADMIN
         * hanya boleh edit project miliknya
         */
        if (
            $user->role === 'admin' &&
            $project->admin_id !== $user->id
        ) {
            return response()->json([
                'message' => 'Forbidden.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => [
                'sometimes',
                'in:pending,in-progress,review,completed,on-hold',
            ],

            'progress' => [
                'sometimes',
                'integer',
                'min:0',
                'max:100',
            ],

            'deadline' => [
                'nullable',
                'date',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'adminId' => [
                'nullable',
                'string',
            ],

            'clientId' => [
                'nullable',
                'string',
            ],

            'client' => [
                'nullable',
                'string',
            ],
        ]);

        if (
            array_key_exists(
                'status',
                $validated
            )
        ) {
            $project->status =
                $validated['status'];
        }

        if (
            array_key_exists(
                'progress',
                $validated
            )
        ) {
            $project->progress =
                $validated['progress'];
        }

        if (
            array_key_exists(
                'deadline',
                $validated
            )
        ) {
            $project->deadline =
                $validated['deadline'] ?? null;
        }

        if (
            array_key_exists(
                'description',
                $validated
            )
        ) {
            $project->description =
                $validated['description'] ?? '';
        }

        if (
            array_key_exists(
                'adminId',
                $validated
            )
        ) {
            $project->admin_id =
                $validated['adminId'] ?? null;
        }

        if (
            array_key_exists(
                'clientId',
                $validated
            )
        ) {
            $project->client_id =
                $validated['clientId']
                ?? $project->client_id;
        }

        if (
            array_key_exists(
                'client',
                $validated
            )
        ) {
            $project->client =
                $validated['client']
                ?? $project->client;
        }

        $project->save();

        return response()->json([
            'ok' => true,
        ]);
    }

    public function destroy(
        Request $request,
        string $id
    ) {
        $user = $this->authenticate($request);

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 401);
        }

        if (
            $user->role !== 'super_admin'
        ) {
            return response()->json([
                'message' => 'Forbidden.',
            ], 403);
        }

        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'message' =>
                    'Project tidak ditemukan.',
            ], 404);
        }

        $project->delete();

        return response()->json([
            'ok' => true,
        ]);
    }

    private function authenticate(
        Request $request
    ): ?User {

        $token =
            $request->bearerToken();

        if (!$token) {
            return null;
        }

        return User::where(
            'api_token',
            hash('sha256', $token)
        )->first();
    }

    private function transformProject(
        Project $project
    ): array {

        return [
            'id' =>
                $project->id,

            'name' =>
                $project->name,

            'category' =>
                $project->category,

            'client' =>
                $project->client,

            'clientId' =>
                $project->client_id,

            'adminId' =>
                $project->admin_id,

            'status' =>
                $project->status,

            'progress' =>
                $project->progress,

            'deadline' =>
                $project->deadline
                    ? date(
                        'Y-m-d',
                        strtotime(
                            $project->deadline
                        )
                    )
                    : '',

            'description' =>
                $project->description ?? '',

            'team' => [],
        ];
    }
}