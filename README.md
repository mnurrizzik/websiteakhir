# Project Hub Pro

Aplikasi manajemen proyek modern dengan arsitektur full-stack yang mengintegrasikan Laravel backend, React frontend, dan Supabase database.

**Status**: 🚀 In Development

---

## 📋 Daftar Isi

- [Tentang Aplikasi](#tentang-aplikasi)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Quick Start](#quick-start)
- [Panduan Lengkap](#panduan-lengkap)
- [Kontribusi](#kontribusi)

---

## 🎯 Tentang Aplikasi

**Project Hub Pro** adalah platform manajemen proyek yang dirancang untuk memfasilitasi kolaborasi tim antara admin, staff, dan klien. Aplikasi ini menyediakan fitur-fitur seperti:

- Manajemen proyek dan task
- Komunikasi real-time (chat)
- Manajemen file dan dokumen
- Calendar dan scheduling
- Reporting dan analytics
- Multi-role user management

---

## ✨ Fitur Utama

### 👨‍💼 Admin Panel
- Dashboard analytics
- Manajemen user (admin, staff, klien)
- Manajemen project komprehensif
- Monitoring file dan dokumen
- Staff management dan assignment
- System reports
- Settings dan konfigurasi

### 👤 Client Dashboard
- View project assigned
- Track project progress
- Upload dan download file
- Calendar view
- In-app chat/notification
- User profile management

### 🛠️ Fitur Teknis
- Authentication & Authorization
- Role-based access control (RBAC)
- File upload & management
- Real-time notifications
- RESTful API
- Database migrations

---

## 🏗️ Tech Stack

### Backend
- **Framework**: Laravel 11.x
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT Token
- **API**: RESTful API
- **Validation**: Laravel Validation
- **ORM**: Eloquent

### Frontend
- **Framework**: React 19
- **Router**: TanStack Router
- **Build Tool**: Vite
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **Form**: React Hook Form
- **HTTP Client**: Axios
- **Type Safety**: TypeScript

### Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Cloudflare Workers
- **Build**: Vite + Wrangler
- **Package Manager**: Bun

---

## 📁 Struktur Proyek

```
project-hub-pro/
├── backend/                    # Laravel Backend
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/   # API Controllers
│   │   └── Models/            # Eloquent Models (User, Project, File)
│   ├── routes/
│   │   └── api.php            # API Routes Definition
│   ├── database/
│   │   ├── migrations/        # Database migrations
│   │   └── factories/         # Model factories
│   ├── config/                # Configuration files
│   └── storage/               # File storage
│
├── src/                        # React Frontend
│   ├── routes/                # TanStack router pages
│   │   ├── __root.tsx         # Root layout
│   │   ├── admin.tsx          # Admin layout
│   │   ├── admin.*.tsx        # Admin pages
│   │   ├── client.tsx         # Client layout
│   │   ├── client.*.tsx       # Client pages
│   │   ├── login.tsx          # Login page
│   │   └── index.tsx          # Home page
│   ├── components/            # Reusable components
│   │   ├── layout/            # Layout components
│   │   ├── shared/            # Shared components
│   │   └── ui/                # UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   │   ├── api.ts            # API client setup
│   │   ├── auth.ts           # Authentication logic
│   │   └── project-store.ts  # State management
│   └── styles.css            # Global styles
│
├── supabase/                  # Supabase config
│   ├── config.toml           # Supabase configuration
│   └── migrations/           # Supabase migrations
│
├── vite.config.ts            # Vite configuration
├── package.json              # Frontend dependencies
└── wrangler.jsonc            # Cloudflare configuration
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ atau Bun
- PHP 8.2+
- Composer
- PostgreSQL / Supabase account
- Git

### 1. Clone Repository
```bash
git clone <repo-url>
cd project-hub-pro
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan seed:run  # Optional: seed demo data
```

### 3. Setup Frontend
```bash
cd ..
bun install  # atau npm install / yarn install
bun run dev  # Start development server
```

### 4. Environment Variables
Buat file `.env` di root folder backend dengan konfigurasi:
```
APP_NAME="Project Hub Pro"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=<supabase-host>
DB_PORT=5432
DB_DATABASE=<database-name>
DB_USERNAME=<username>
DB_PASSWORD=<password>

JWT_SECRET=your-secret-key
```

### 5. Jalankan Aplikasi
```bash
# Terminal 1: Backend (dari folder backend)
php artisan serve

# Terminal 2: Frontend (dari root)
bun run dev
```

Akses aplikasi di `http://localhost:5173`

---

## 📚 Panduan Lengkap

- [Backend Setup & Documentation](./docs/BACKEND.md)
- [Frontend Setup & Documentation](./docs/FRONTEND.md)
- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing Guide](./CONTRIBUTING.md)

---

## 🔐 Authentication

Aplikasi menggunakan JWT (JSON Web Token) untuk authentication:

1. **Login**: Send credentials → Receive JWT token
2. **Token Storage**: JWT disimpan di localStorage
3. **Protected Routes**: Setiap request disertai Authorization header
4. **Token Refresh**: Auto refresh sebelum token expired

Lihat [API Documentation](./docs/API.md#authentication) untuk detail lengkap.

---

## 📦 Project Dependencies

### Backend Dependencies
- Laravel Framework
- Laravel Tinker
- Doctrine DBAL
- PHPUnit
- Faker

### Frontend Dependencies
- React & React DOM
- TanStack Router & Query
- Radix UI Components
- Tailwind CSS
- React Hook Form
- Axios

Lihat file `package.json` (frontend) dan `backend/composer.json` untuk dependency lengkap.

---

## 🔧 Development Commands

### Backend
```bash
cd backend

# Database
php artisan migrate              # Run migrations
php artisan migrate:rollback     # Rollback last migration
php artisan seed:run             # Run seeders

# Development
php artisan serve                # Start dev server
php artisan tinker               # Interactive shell

# Testing
php artisan test                 # Run tests
./vendor/bin/phpunit             # Run PHPUnit
```

### Frontend
```bash
# Development
bun run dev                      # Start dev server
bun run build                    # Production build
bun run preview                  # Preview build

# Code Quality
bun run lint                     # Run ESLint
bun run format                   # Format with Prettier
```

---

## 🗄️ Database Schema

### Users Table
```sql
- id (UUID)
- name
- email
- password
- role (admin|staff|client)
- client_id (nullable)
- status (active|inactive)
- api_token
- created_at, updated_at
```

### Projects Table
```sql
- id (UUID)
- name
- category
- client (company name)
- client_id (user id)
- admin_id (user id)
- status (planning|in_progress|completed|on_hold)
- progress (0-100)
- deadline
- description
- created_at, updated_at
```

### Files Table
```sql
- id (UUID)
- name
- original_name
- mime_type
- type
- size
- path
- project_id (UUID)
- uploaded_by (user id)
- created_at, updated_at
```

Lihat [Database Documentation](./docs/DATABASE.md) untuk schema lengkap.

---

## 🚨 Troubleshooting

### Backend Issues

**Migration Error**
```bash
# Check migration status
php artisan migrate:status

# Rollback dan coba lagi
php artisan migrate:rollback --step=1
php artisan migrate
```

**Database Connection Error**
- Verifikasi `.env` configuration
- Pastikan Supabase project aktif
- Check network connection

### Frontend Issues

**Port Conflict (5173)**
```bash
bun run dev -- --port 3000
```

**Module Not Found**
```bash
# Clear cache dan reinstall
rm -rf node_modules bun.lock
bun install
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `PATCH /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Files
- `GET /api/files` - List files
- `POST /api/files` - Upload file
- `DELETE /api/files/{id}` - Delete file
- `GET /api/files/{id}/download` - Download file

Lihat [API Documentation](./docs/API.md) untuk detail lengkap.

---

## 🤝 Kontribusi

Kami menerima kontribusi dari komunitas! Untuk berkontribusi:

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

Lihat [CONTRIBUTING.md](./CONTRIBUTING.md) untuk detail lengkap.

---

## 📝 License

Project ini di-license di bawah MIT License - lihat file [LICENSE](./LICENSE) untuk detail.

---

## 📧 Support

- **Email**: support@projecthub.com
- **Documentation**: [Wiki](./docs/)
- **Issues**: [GitHub Issues](https://github.com/yourrepo/issues)

---

## 🙏 Terima Kasih

Terima kasih telah menggunakan Project Hub Pro! Feedback dan saran Anda sangat berharga.

---

**Last Updated**: May 2026
**Version**: 1.0.0 (In Development)
