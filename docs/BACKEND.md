# Backend Documentation

Dokumentasi lengkap untuk backend Laravel Project Hub Pro.

---

## 📋 Daftar Isi

- [Struktur Folder](#struktur-folder)
- [Setup & Instalasi](#setup--instalasi)
- [Models & Database](#models--database)
- [Controllers](#controllers)
- [Routes](#routes)
- [Authentication](#authentication)
- [File Upload](#file-upload)
- [Testing](#testing)
- [Deployment](#deployment)

---

## 📁 Struktur Folder

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── AuthController.php      # Authentication logic
│   │   │       ├── UserController.php      # User management
│   │   │       ├── ProjectController.php   # Project management
│   │   │       ├── FileController.php      # File handling
│   │   │       └── DemoDataController.php  # Demo data seeding
│   │   └── Middleware/
│   │       └── (Authentication middleware)
│   ├── Models/
│   │   ├── User.php                # User model
│   │   ├── Project.php             # Project model
│   │   └── File.php                # File model
│   └── Providers/
│       └── AppServiceProvider.php  # Service provider
│
├── routes/
│   ├── api.php                 # API routes
│   ├── web.php                 # Web routes (optional)
│   └── console.php             # Console commands
│
├── database/
│   ├── migrations/             # Database migrations
│   ├── factories/              # Model factories
│   └── seeders/                # Data seeders
│
├── config/
│   ├── app.php                 # App configuration
│   ├── database.php            # Database config
│   ├── auth.php                # Auth config
│   └── ...                     # Other configs
│
├── storage/
│   ├── app/                    # File storage
│   ├── logs/                   # Application logs
│   └── framework/              # Framework cache
│
├── bootstrap/
│   ├── app.php                 # App bootstrap
│   └── providers.php           # Provider bootstrap
│
├── tests/
│   ├── Feature/                # Feature tests
│   ├── Unit/                   # Unit tests
│   └── TestCase.php            # Base test case
│
├── .env.example                # Environment example
├── composer.json               # Dependencies
├── artisan                     # Laravel CLI
└── phpunit.xml                 # PHPUnit config
```

---

## 🔧 Setup & Instalasi

### Prerequisites
- PHP 8.2+
- Composer
- PostgreSQL (or Supabase)
- Git

### Langkah-Langkah

#### 1. Clone Repository
```bash
cd project-hub-pro
cd backend
```

#### 2. Install Dependencies
```bash
composer install
```

#### 3. Setup Environment
```bash
# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate
```

#### 4. Configure Database
Edit `.env` dengan PostgreSQL credentials:
```env
DB_CONNECTION=pgsql
DB_HOST=db.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

#### 5. Run Migrations
```bash
php artisan migrate

# Seed dengan data demo (optional)
php artisan seed:run
php artisan db:seed --class=DemoDataSeeder
```

#### 6. Generate JWT Secret (jika diperlukan)
```bash
php artisan jwt:secret
```

#### 7. Start Development Server
```bash
php artisan serve
# Server berjalan di http://localhost:8000
```

---

## 🗄️ Models & Database

### User Model

**File**: `app/Models/User.php`

**Attributes**:
```php
- id: string (UUID)
- name: string
- email: string (unique)
- password: string (hashed)
- role: enum (admin|staff|client)
- client_id: string|null (FK ke User)
- status: enum (active|inactive)
- color: string (hex color untuk avatar)
- initials: string (user initials)
- api_token: string|null (untuk API access)
- timestamps: created_at, updated_at
```

**Key Features**:
- Use UUID untuk primary key
- Custom casts untuk fields
- HasMany relationships (projects, files)
- Authentication ready

**Relations**:
```php
- projects() - HasMany
- files() - HasMany  
- assignedProjects() - BelongsToMany
```

### Project Model

**File**: `app/Models/Project.php`

**Attributes**:
```php
- id: string (UUID)
- name: string
- category: string
- client: string (company name)
- client_id: string (FK ke User)
- admin_id: string (FK ke User)
- status: enum (planning|in_progress|completed|on_hold)
- progress: integer (0-100)
- deadline: date
- description: text
- timestamps: created_at, updated_at
```

**Key Features**:
- Track project progress
- Multi-status support
- Client dan admin assignment
- File relationships

**Relations**:
```php
- client() - BelongsTo User
- admin() - BelongsTo User
- files() - HasMany
```

### File Model

**File**: `app/Models/File.php`

**Attributes**:
```php
- id: string (UUID)
- name: string (display name)
- original_name: string (file name)
- mime_type: string
- type: string (document|image|video|audio|other)
- size: integer (bytes)
- path: string (storage path)
- project_id: string (FK ke Project)
- uploaded_by: string (FK ke User)
- timestamps: created_at, updated_at
```

**Key Features**:
- Auto UUID generation
- File type detection
- Size tracking
- Project association

**Relations**:
```php
- project() - BelongsTo Project
- uploadedBy() - BelongsTo User
```

### Database Migrations

**Users Table**:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff', 'client') DEFAULT 'client',
  client_id UUID,
  status ENUM('active', 'inactive') DEFAULT 'active',
  color VARCHAR(7),
  initials VARCHAR(2),
  api_token VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Projects Table**:
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  client VARCHAR(255),
  client_id UUID NOT NULL,
  admin_id UUID NOT NULL,
  status ENUM('planning', 'in_progress', 'completed', 'on_hold') DEFAULT 'planning',
  progress SMALLINT DEFAULT 0,
  deadline DATE,
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id),
  FOREIGN KEY (admin_id) REFERENCES users(id)
);
```

**Files Table**:
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  mime_type VARCHAR(255),
  type VARCHAR(50),
  size BIGINT,
  path VARCHAR(255),
  project_id UUID NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

---

## 🎮 Controllers

### AuthController

**File**: `app/Http/Controllers/Api/AuthController.php`

**Methods**:

```php
// Login
POST /api/login
Request: { email, password }
Response: { token, user }

// Logout  
POST /api/logout
Response: { message }

// Get Current User
GET /api/user
Response: { user }
```

**Implementation**:
- Validate credentials
- Generate JWT token
- Return user data dengan token
- Token expiry handling

### UserController

**File**: `app/Http/Controllers/Api/UserController.php`

**Methods**:

```php
// List Users
GET /api/users
Query: ?role=admin&status=active
Response: { data: User[] }

// Create User
POST /api/users
Request: { name, email, password, role, ... }
Response: { user }

// Update User
PUT /api/users/{id}
Request: { name, email, role, ... }
Response: { user }

// Delete User
DELETE /api/users/{id}
Response: { message }
```

**Authorization**: Admin only

### ProjectController

**File**: `app/Http/Controllers/Api/ProjectController.php`

**Methods**:

```php
// List Projects
GET /api/projects
Query: ?status=in_progress&client_id=uuid
Response: { data: Project[] }

// Create Project
POST /api/projects
Request: { name, category, client, deadline, ... }
Response: { project }

// Update Project
PATCH /api/projects/{id}
Request: { name, status, progress, ... }
Response: { project }

// Delete Project
DELETE /api/projects/{id}
Response: { message }
```

**Authorization**: Admin or Project owner

### FileController

**File**: `app/Http/Controllers/Api/FileController.php`

**Methods**:

```php
// List Files
GET /api/files
Query: ?project_id=uuid
Response: { data: File[] }

// Upload File
POST /api/files
Form: { file, project_id }
Response: { file }

// Delete File
DELETE /api/files/{id}
Response: { message }

// Download File
GET /api/files/{id}/download
Response: (file binary)
```

**Storage**: Menggunakan Laravel storage (local/s3)

### DemoDataController

**File**: `app/Http/Controllers/Api/DemoDataController.php`

**Methods**:

```php
// Seed Demo Data
POST /api/seed-demo
Response: { message, data: { users, projects, files } }
```

**Use Case**: Development & testing

---

## 🛣️ Routes

### API Routes Definition

**File**: `routes/api.php`

```php
// Authentication (no auth required)
POST /api/login
POST /api/logout
GET /api/user

// Demo (no auth required)
POST /api/seed-demo

// Users (Protected)
GET /api/users
POST /api/users
PUT /api/users/{id}
DELETE /api/users/{id}

// Projects (Protected)
GET /api/projects
POST /api/projects
PATCH /api/projects/{id}
DELETE /api/projects/{id}

// Files (Protected)
GET /api/files
POST /api/files
DELETE /api/files/{id}
GET /api/files/{id}/download
```

### Middleware

```php
// Sanctum Auth Middleware
api  // Token-based auth

// Custom Middleware (jika ada):
// - check-admin
// - check-project-owner
```

---

## 🔐 Authentication

### JWT Token Flow

```
1. Client Login
   POST /api/login (email, password)
   ↓
2. Server Validates
   ↓
3. Generate JWT Token
   ↓
4. Return Token + User
   ↓
5. Client Stores Token (localStorage)
   ↓
6. Include Token in Request Header
   Authorization: Bearer <token>
   ↓
7. Server Validates Token
   ↓
8. Process Request
```

### Token Claims

```json
{
  "sub": "user_id",
  "iat": 1234567890,
  "exp": 1234571490,
  "email": "user@example.com",
  "role": "admin"
}
```

### Middleware Auth

Gunakan `auth:sanctum` middleware untuk protect routes:

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::get('/projects', [ProjectController::class, 'index']);
});
```

---

## 📤 File Upload

### Upload Flow

```
1. Client POST /api/files
   - File binary
   - project_id
   - (other metadata)
   ↓
2. Server Validates
   - File type
   - File size
   - Project exists
   ↓
3. Store File
   - Generate UUID
   - Save to storage/app/files
   - Create DB record
   ↓
4. Return File Object
   {
     id, name, path, size, type, ...
   }
```

### File Storage

- **Location**: `storage/app/files/`
- **URL Access**: `/storage/files/{filename}`
- **Size Limit**: Configurable (default 50MB)
- **Allowed Types**: PDF, DOC, XLS, IMG, ZIP, etc

### Configuration

Edit `config/filesystems.php`:

```php
'disks' => [
    'local' => [
        'driver' => 'local',
        'root' => storage_path('app'),
        'visibility' => 'private',
    ],
    
    'public' => [
        'driver' => 'local',
        'root' => storage_path('app/public'),
        'url' => env('APP_URL').'/storage',
        'visibility' => 'public',
    ],
    
    's3' => [
        'driver' => 's3',
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION'),
        'bucket' => env('AWS_BUCKET'),
    ],
],
```

---

## 🧪 Testing

### Unit Tests

**Location**: `tests/Unit/`

**Example**:
```php
// tests/Unit/UserModelTest.php
public function test_user_creation()
{
    $user = User::factory()->create();
    $this->assertNotNull($user->id);
}
```

### Feature Tests

**Location**: `tests/Feature/`

**Example**:
```php
// tests/Feature/AuthControllerTest.php
public function test_user_can_login()
{
    $response = $this->postJson('/api/login', [
        'email' => 'test@example.com',
        'password' => 'password'
    ]);
    
    $response->assertStatus(200)
        ->assertHasKeys(['token', 'user']);
}
```

### Running Tests

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/AuthControllerTest.php

# Run with coverage
php artisan test --coverage

# Run using PHPUnit directly
./vendor/bin/phpunit
```

### Test Configuration

Edit `phpunit.xml`:

```xml
<phpunit>
    <testsuites>
        <testsuite name="Unit">
            <directory suffix="Test.php">./tests/Unit</directory>
        </testsuite>
        <testsuite name="Feature">
            <directory suffix="Test.php">./tests/Feature</directory>
        </testsuite>
    </testsuites>
    
    <php>
        <env name="APP_ENV" value="testing"/>
        <env name="DB_CONNECTION" value="sqlite"/>
        <env name="DB_DATABASE" value=":memory:"/>
    </php>
</phpunit>
```

---

## 🚀 Deployment

### Prerequisites
- Server dengan PHP 8.2+
- PostgreSQL / Supabase
- Composer
- SSL Certificate

### Deployment Steps

#### 1. Clone & Setup
```bash
git clone <repo-url> /var/www/project-hub-pro
cd /var/www/project-hub-pro/backend
composer install --no-dev
```

#### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env dengan production values
php artisan key:generate
```

#### 3. Database Migration
```bash
php artisan migrate --force
php artisan seed:run --force
```

#### 4. Permissions
```bash
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
chown -R www-data:www-data /var/www/project-hub-pro/
```

#### 5. Web Server (Nginx)
```nginx
server {
    listen 80;
    server_name api.projecthub.com;
    root /var/www/project-hub-pro/backend/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

#### 6. SSL Certificate (Let's Encrypt)
```bash
certbot --nginx -d api.projecthub.com
```

#### 7. Environment Variables for Production
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.projecthub.com

DB_CONNECTION=pgsql
DB_HOST=db.supabase.co
DB_PORT=5432
DB_DATABASE=prod_database
DB_USERNAME=postgres
DB_PASSWORD=secure_password

CACHE_DRIVER=redis
QUEUE_CONNECTION=database
```

#### 8. Optimization
```bash
# Optimize autoloader
composer install --no-dev --optimize-autoloader

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### 9. Monitoring & Logs
```bash
# View logs
tail -f storage/logs/laravel.log

# Monitor app
ps aux | grep php-fpm
ps aux | grep laravel
```

### Rollback

Jika ada masalah:
```bash
# Rollback database
php artisan migrate:rollback --step=1

# Clear caches
php artisan cache:clear
php artisan config:clear
```

---

## 📝 Common Commands

```bash
# Artisan Commands
php artisan serve                    # Start dev server
php artisan tinker                   # Interactive shell
php artisan make:model Name          # Create model
php artisan make:controller Name     # Create controller
php artisan make:migration Name      # Create migration
php artisan make:seeder Name         # Create seeder
php artisan make:factory Name        # Create factory

# Database
php artisan migrate                  # Run migrations
php artisan migrate:rollback         # Rollback
php artisan migrate:fresh            # Drop all & migrate
php artisan db:seed                  # Run seeders

# Cache & Config
php artisan cache:clear              # Clear all caches
php artisan config:cache             # Cache config
php artisan route:cache              # Cache routes
php artisan view:cache               # Cache views
```

---

## 🐛 Troubleshooting

### Connection Error
```bash
# Test database connection
php artisan tinker
>>> DB::connection()->getPDO();
```

### Migration Issues
```bash
# Check migration status
php artisan migrate:status

# Reset & start fresh
php artisan migrate:fresh
```

### Permission Denied
```bash
# Fix storage permissions
chmod -R 775 storage/ bootstrap/cache/
chown -R www-data:www-data ./
```

### Clear Everything
```bash
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan optimize:clear
composer dump-autoload
```

---

## 📚 Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Eloquent ORM](https://laravel.com/docs/eloquent)
- [API Resources](https://laravel.com/docs/eloquent-resources)
- [Testing](https://laravel.com/docs/testing)
- [Deployment](https://laravel.com/docs/deployment)

---

**Last Updated**: May 2026
