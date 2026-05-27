<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('category');
            $table->string('client');
            $table->string('client_id');
            $table->uuid('admin_id')->nullable();
            $table->enum('status', ['pending', 'in-progress', 'review', 'completed', 'on-hold'])->default('pending');
            $table->integer('progress')->default(0);
            $table->date('deadline')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('admin_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
