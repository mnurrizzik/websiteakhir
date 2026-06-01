# Database Documentation

Dokumentasi lengkap untuk database schema Project Hub Pro.

---

## 📋 Daftar Isi

- [Database Overview](#database-overview)
- [Schema Design](#schema-design)
- [Tables](#tables)
- [Relationships](#relationships)
- [Migrations](#migrations)
- [Backup & Recovery](#backup--recovery)

---

## 🗄️ Database Overview

### Database Engine
- **Type**: PostgreSQL 12+
- **Hosting**: Supabase (Cloud) atau Self-Hosted
- **Encoding**: UTF-8
- **Timezone**: UTC

### Connection Details

**Supabase**:
```env
DB_CONNECTION=pgsql
DB_HOST=db.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=<password>
```

**Self-Hosted**:
```env
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=project_hub_pro
DB_USERNAME=postgres
DB_PASSWORD=<password>
```

---

## 🏗️ Schema Design

### ER Diagram

```
┌──────────┐         ┌───────────┐         ┌────────┐
│  Users   │◄───────►│ Projects  │◄───────►│ Files  │
└──────────┘         └───────────┘         └────────┘
     │                                           │
     │ (admin)                            (uploaded_by)
     │                                           │
     └─────────────────────────────────────────┘

Users (1) ────────── (N) Projects
Users (1) ────────── (N) Files
Projects (1) ─────── (N) Files
```

### Design Principles

- **Normalization**: 3NF (Third Normal Form)
- **Constraints**: Primary keys, foreign keys, unique constraints
- **Indexes**: On frequently queried columns
- **Timestamps**: created_at, updated_at untuk audit trail
- **Soft Deletes**: Nullable deleted_at (jika perlu)

---

## 📊 Tables

### Users Table

**Purpose**: Menyimpan data pengguna aplikasi

**DDL**:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  email_verified_at TIMESTAMP NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff', 'client') NOT NULL DEFAULT 'client',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  client_id UUID REFERENCES users(id) ON DELETE SET NULL,
  color VARCHAR(7),
  initials VARCHAR(2),
  api_token VARCHAR(255) UNIQUE,
  remember_token VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_client_id ON users(client_id);
```

**Fields**:

| Field | Type | Constraint | Description |
|-------|------|-----------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(255) | NOT NULL | User's full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email |
| email_verified_at | TIMESTAMP | NULL | Email verification date |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| role | ENUM | NOT NULL | admin, staff, atau client |
| status | ENUM | NOT NULL | active atau inactive |
| client_id | UUID | FK | Reference ke users table (untuk client hierarchy) |
| color | VARCHAR(7) | NULL | Hex color untuk avatar |
| initials | VARCHAR(2) | NULL | User's initials |
| api_token | VARCHAR(255) | UNIQUE | Token untuk API access |
| remember_token | VARCHAR(100) | NULL | Remember me token |
| created_at | TIMESTAMP | | Created timestamp |
| updated_at | TIMESTAMP | | Last updated timestamp |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Roles**:
- **admin**: Full access, manage everything
- **staff**: Limited access, manage projects & files
- **client**: View only, own projects

---

### Projects Table

**Purpose**: Menyimpan data proyek

**DDL**:
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  client VARCHAR(255) NOT NULL,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status ENUM('planning', 'in_progress', 'completed', 'on_hold') 
    NOT NULL DEFAULT 'planning',
  progress SMALLINT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  deadline DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_admin_id ON projects(admin_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_deadline ON projects(deadline);
```

**Fields**:

| Field | Type | Constraint | Description |
|-------|------|-----------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Project name |
| category | VARCHAR(255) | | Project category |
| client | VARCHAR(255) | NOT NULL | Client company name |
| client_id | UUID | FK, NOT NULL | Reference ke users |
| admin_id | UUID | FK, NOT NULL | Project administrator |
| status | ENUM | NOT NULL | planning, in_progress, completed, on_hold |
| progress | SMALLINT | CHECK | 0-100 percentage |
| deadline | DATE | NOT NULL | Project deadline |
| description | TEXT | | Project description |
| created_at | TIMESTAMP | | Created timestamp |
| updated_at | TIMESTAMP | | Last updated timestamp |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Status Workflow**:
```
planning → in_progress → completed
    ↓           ↓
  on_hold → any status
```

---

### Files Table

**Purpose**: Menyimpan metadata file yang di-upload

**DDL**:
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(255),
  type ENUM('document', 'image', 'video', 'audio', 'other'),
  size BIGINT NOT NULL,
  path VARCHAR(500) NOT NULL UNIQUE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_files_project_id ON files(project_id);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_type ON files(type);
CREATE INDEX idx_files_created_at ON files(created_at);
```

**Fields**:

| Field | Type | Constraint | Description |
|-------|------|-----------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Display name |
| original_name | VARCHAR(255) | NOT NULL | Original file name |
| mime_type | VARCHAR(255) | | MIME type (application/pdf, etc) |
| type | ENUM | | document, image, video, audio, other |
| size | BIGINT | NOT NULL | File size in bytes |
| path | VARCHAR(500) | UNIQUE, NOT NULL | Storage path |
| project_id | UUID | FK, NOT NULL | Associated project |
| uploaded_by | UUID | FK, NOT NULL | User who uploaded |
| created_at | TIMESTAMP | | Upload timestamp |
| updated_at | TIMESTAMP | | Last updated timestamp |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**File Size Limits**:
- Single file: 50MB
- Total per project: 1GB

---

### Cache Table (Laravel)

**DDL**:
```sql
CREATE TABLE cache (
  key VARCHAR(255) PRIMARY KEY,
  value MEDIUMTEXT NOT NULL,
  expiration INT NOT NULL
);

CREATE INDEX idx_cache_expiration ON cache(expiration);
```

---

### Jobs Table (Laravel Queue)

**DDL**:
```sql
CREATE TABLE jobs (
  id BIGSERIAL PRIMARY KEY,
  queue VARCHAR(255) NOT NULL,
  payload LONGTEXT NOT NULL,
  attempts INT DEFAULT 0,
  reserved_at INT NULL,
  available_at INT NOT NULL,
  created_at INT NOT NULL,
  updated_at INT NOT NULL
);

CREATE INDEX idx_jobs_queue ON jobs(queue);
```

---

## 🔗 Relationships

### One-to-Many (1:N)

**Users → Projects**:
```
User (as admin) has many Projects
DELETE user → projects.admin_id becomes NULL or CASCADE
```

**Users → Files**:
```
User (uploader) has many Files
DELETE user → files.uploaded_by becomes NULL or CASCADE
```

**Projects → Files**:
```
Project has many Files
DELETE project → all files deleted (CASCADE)
```

### Self-Referencing (1:1 optional)

**Users → Users**:
```
User (client) belongs to User (account manager)
client_id references users(id)
DELETE user → client_id becomes NULL
```

---

## 🔄 Migrations

### Migration Files

Location: `backend/database/migrations/`

**File Naming**: `YYYY_MM_DD_HHMMSS_migration_name.php`

### Migration Process

```bash
# Create migration
php artisan make:migration create_projects_table

# Run migrations
php artisan migrate

# Rollback last batch
php artisan migrate:rollback

# Rollback all
php artisan migrate:reset

# Refresh (reset + migrate)
php artisan migrate:refresh

# Fresh (drop + create + seed)
php artisan migrate:fresh
```

### Creating Migrations

```php
// database/migrations/0001_01_01_000003_create_projects_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->enum('status', ['planning', 'in_progress', 'completed', 'on_hold'])
                ->default('planning');
            $table->uuid('client_id');
            $table->uuid('admin_id');
            $table->timestamps();
            
            $table->foreign('client_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
            
            $table->foreign('admin_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
            
            $table->index('client_id');
            $table->index('admin_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
```

---

## 💾 Backup & Recovery

### PostgreSQL Backup

**Full Backup**:
```bash
# Custom format (recommended)
pg_dump -U postgres -F c -b -v -f backup.dump project_hub_pro

# SQL format
pg_dump -U postgres -v project_hub_pro > backup.sql

# From Supabase
pg_dump postgresql://user:password@db.supabase.co:5432/postgres > backup.sql
```

**Incremental Backup** (WAL):
```bash
# Enable WAL archiving in postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backup/wal_archive/%f'
```

### PostgreSQL Restore

**From Dump**:
```bash
# Custom format
pg_restore -U postgres -d project_hub_pro backup.dump

# SQL format
psql -U postgres project_hub_pro < backup.sql

# To new database
createdb project_hub_pro_restored
pg_restore -U postgres -d project_hub_pro_restored backup.dump
```

### Backup Strategy

**Recommended**:
- **Daily**: Incremental backups
- **Weekly**: Full backups (offsite)
- **Monthly**: Archive backups

**Tools**:
- Supabase: Automated backups included
- PostgreSQL: `pg_dump`, `pg_restore`
- AWS S3/Backblaze: For offsite storage

### Recovery Procedures

**If Database Corrupted**:
```bash
# 1. Stop application
systemctl stop nginx php8.2-fpm

# 2. Create new database
createdb project_hub_pro_recovery

# 3. Restore from backup
pg_restore -d project_hub_pro_recovery backup.dump

# 4. Verify data
psql -d project_hub_pro_recovery -c "SELECT COUNT(*) FROM users;"

# 5. Rename databases
psql -c "ALTER DATABASE project_hub_pro RENAME TO project_hub_pro_corrupted;"
psql -c "ALTER DATABASE project_hub_pro_recovery RENAME TO project_hub_pro;"

# 6. Start application
systemctl start nginx php8.2-fpm
```

---

## 📈 Performance Tips

### Indexing Strategy

```sql
-- Frequently filtered columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_files_project_id ON files(project_id);

-- Composite indexes for common queries
CREATE INDEX idx_projects_client_status 
  ON projects(client_id, status);

-- Check existing indexes
\d+ users
```

### Query Optimization

```sql
-- Use EXPLAIN to analyze queries
EXPLAIN ANALYZE
SELECT * FROM projects 
WHERE client_id = 'uuid' AND status = 'in_progress';

-- Use LIMIT untuk large result sets
SELECT * FROM files LIMIT 100;

-- Use OFFSET untuk pagination
SELECT * FROM files LIMIT 10 OFFSET 20;
```

### Maintenance

```bash
# Analyze table statistics
php artisan tinker
>>> DB::statement('ANALYZE projects;');

# Vacuum to clean up
>>> DB::statement('VACUUM projects;');

# Reindex tables
>>> DB::statement('REINDEX TABLE projects;');
```

---

## 🔒 Security

### Data Protection

- **Encryption**: Sensitive fields should be encrypted
- **Hashing**: Passwords hashed dengan bcrypt
- **Audit Trails**: Use timestamps (created_at, updated_at)
- **Soft Deletes**: Keep historical data

### Access Control

- **User Roles**: RBAC via role column
- **Row-Level Security**: Implement in queries
- **Connection**: Use SSL untuk database connections

---

## 📊 Sample Queries

### Common Queries

```sql
-- Projects by client
SELECT * FROM projects 
WHERE client_id = '550e8400-e29b-41d4-a716-446655440010'
ORDER BY deadline ASC;

-- Files for project
SELECT f.* FROM files f
WHERE f.project_id = '550e8400-e29b-41d4-a716-446655440100'
ORDER BY f.created_at DESC;

-- User projects summary
SELECT 
  p.id,
  p.name,
  COUNT(f.id) as file_count,
  p.progress,
  p.status
FROM projects p
LEFT JOIN files f ON f.project_id = p.id
WHERE p.admin_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY p.id
ORDER BY p.created_at DESC;

-- Active projects (in progress or planning)
SELECT * FROM projects
WHERE status IN ('in_progress', 'planning')
AND deadline >= CURRENT_DATE
ORDER BY deadline ASC;

-- Recent files
SELECT * FROM files
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

---

## 📚 Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Laravel Migrations](https://laravel.com/docs/migrations)
- [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)
- [SQL Performance Tuning](https://use-the-index-luke.com/)

---

**Last Updated**: May 2026
