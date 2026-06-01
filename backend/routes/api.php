<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DemoDataController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\SettingsController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);

Route::post('/logout', [AuthController::class, 'logout']);

Route::get('/user', [AuthController::class, 'me']);

Route::post('/seed-demo', [DemoDataController::class, 'seed']);

/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/

Route::get('/users', [UserController::class, 'index']);

Route::post('/users', [UserController::class, 'store']);

Route::put('/users/{id}', [UserController::class, 'update']);

Route::delete('/users/{id}', [UserController::class, 'destroy']);

/*
|--------------------------------------------------------------------------
| PROJECTS
|--------------------------------------------------------------------------
*/

Route::get('/projects', [ProjectController::class, 'index']);

Route::post('/projects', [ProjectController::class, 'store']);

Route::patch('/projects/{id}', [ProjectController::class, 'update']);

Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

/*
|--------------------------------------------------------------------------
| FILES
|--------------------------------------------------------------------------
*/

Route::get('/files', [FileController::class, 'index']);

Route::post('/files', [FileController::class, 'store']);

Route::delete('/files/{id}', [FileController::class, 'destroy']);

Route::get(
    '/files/{id}/download',
    [FileController::class, 'download']
);

/*
|--------------------------------------------------------------------------
| SETTINGS
|--------------------------------------------------------------------------
*/

Route::get(
    '/settings',
    [SettingsController::class, 'index']
);

Route::patch(
    '/settings/workspace',
    [SettingsController::class, 'updateWorkspace']
);

Route::patch(
    '/settings/notifications',
    [SettingsController::class, 'updateNotifications']
);

Route::patch(
    '/settings/appearance',
    [SettingsController::class, 'updateAppearance']
);

Route::patch(
    '/settings/security',
    [SettingsController::class, 'updateSecurity']
);

/*
|--------------------------------------------------------------------------
| LOGIN PAGE SETTINGS
|--------------------------------------------------------------------------
*/

Route::get('/settings/login-page', function () {

    $path = storage_path(
        'app/login_page.json'
    );

    if (!File::exists($path)) {

        File::put(
            $path,

            json_encode([
                "brand_name" =>
                    "ProjectFlow",

                "top_badge" =>
                    "Project Management, simplified",

                "login_title" =>
                    "Selamat datang kembali",

                "login_subtitle" =>
                    "Masuk untuk memantau dan mengelola project Anda.",

                "hero_title" =>
                    "Pantau setiap progress project Anda dalam satu dashboard modern.",

                "hero_subtitle" =>
                    "Realtime updates, diskusi tim, file management, dan analytics — semua dalam workspace yang clean dan cepat.",

                "stat_projects" =>
                    "24",

                "stat_ontime" =>
                    "98%",

                "stat_tasks" =>
                    "12k",

                "footer_text" =>
                    "© 2026 ProjectFlow. Crafted for modern teams."
            ])
        );
    }

    return response()->json(

        json_decode(
            File::get($path),
            true
        )

    );
});

Route::patch('/settings/login-page', function (Request $request) {

    $path = storage_path(
        'app/login_page.json'
    );

    File::put(

        $path,

        json_encode(
            $request->all(),
            JSON_PRETTY_PRINT
        )

    );

    return response()->json([
        'success' => true,
        'message' => 'Saved'
    ]);
});