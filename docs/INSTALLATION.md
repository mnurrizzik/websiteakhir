# Setup & Installation Guide

Panduan lengkap untuk setup dan instalasi Project Hub Pro di berbagai environment.

---

## 📋 Daftar Isi

- [System Requirements](#system-requirements)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Docker Setup](#docker-setup)
- [Troubleshooting](#troubleshooting)
- [First Run Checklist](#first-run-checklist)

---

## 🖥️ System Requirements

### Minimum Requirements

#### Backend (Laravel)
- **OS**: Linux, macOS, atau Windows (WSL2)
- **PHP**: 8.2 atau lebih tinggi
- **Database**: PostgreSQL 12+
- **Composer**: 2.2+
- **RAM**: 2GB
- **Storage**: 5GB

#### Frontend (React)
- **Node.js**: 18.12+
- **npm/yarn/bun**: Latest version
- **RAM**: 1GB
- **Storage**: 2GB

### Recommended Requirements

- **OS**: Ubuntu 20.04 LTS atau lebih baru
- **PHP**: 8.3
- **PostgreSQL**: 15+
- **Node.js**: 20 LTS
- **RAM**: 4GB+
- **Storage**: 20GB+
- **CPU**: 2+ cores

### Optional Tools

- **Docker**: 20.10+ (untuk containerization)
- **Git**: 2.30+
- **VS Code**: Latest (atau editor lain)
- **Postman**: Latest (untuk API testing)
- **DBeaver**: Latest (untuk database management)

---

## 🚀 Development Setup

### Step 1: Clone Repository

```bash
# Clone repo
git clone https://github.com/yourusername/project-hub-pro.git
cd project-hub-pro

# Create branch untuk development (optional)
git checkout -b develop
```

### Step 2: Setup Database (Supabase)

#### Option A: Menggunakan Supabase Cloud

1. **Buat akun Supabase**
   - Kunjungi https://supabase.com
   - Sign up dengan GitHub atau email
   - Buat project baru

2. **Copy credentials**
   - Buka Settings → Database
   - Copy host, port, database name, user, password
   - Simpan untuk nanti

#### Option B: PostgreSQL Local

```bash
# Linux (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql@15
brew services start postgresql@15

# Windows
# Download dari https://www.postgresql.org/download/windows/

# Create database
createdb project_hub_pro
```

### Step 3: Setup Backend

```bash
# Navigate to backend
cd backend

# Copy environment file
cp .env.example .env

# Install dependencies
composer install

# Generate app key
php artisan key:generate

# Configure database in .env
# Edit .env dan set DB_* variables:
# DB_CONNECTION=pgsql
# DB_HOST=db.supabase.co  (atau localhost)
# DB_PORT=5432
# DB_DATABASE=postgres
# DB_USERNAME=postgres
# DB_PASSWORD=your_password

# Run migrations
php artisan migrate

# (Optional) Seed demo data
php artisan db:seed

# (Optional) Generate JWT secret
php artisan jwt:secret

# Test backend
php artisan serve
# Akses http://localhost:8000
```

### Step 4: Setup Frontend

```bash
# Navigate to root
cd ..

# Copy environment file
cp .env.example .env.local

# Edit .env.local
# VITE_API_URL=http://localhost:8000
# VITE_API_TIMEOUT=10000

# Install dependencies
bun install
# atau: npm install / yarn install

# Start dev server
bun run dev
# Akses http://localhost:5173
```

### Step 5: Verify Installation

#### Backend Check
```bash
# Terminal di backend folder
php artisan serve

# Test endpoints
curl http://localhost:8000/api/user
# Should return 401 (unauthorized) - Normal!

curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

#### Frontend Check
```bash
# Browser
# http://localhost:5173

# Check console untuk errors
# Klik F12 → Console tab
```

### Step 6: Create Test User

Gunakan Tinker untuk create test user:

```bash
cd backend

php artisan tinker

# Di Tinker shell:
$user = \App\Models\User::create([
  'name' => 'Test Admin',
  'email' => 'admin@test.com',
  'password' => bcrypt('password123'),
  'role' => 'admin',
  'status' => 'active'
])

exit
```

Atau gunakan API:

```bash
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin-token}" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "client"
  }'
```

### Step 7: First Login

1. Buka http://localhost:5173/login
2. Enter credentials:
   - Email: `admin@test.com`
   - Password: `password123`
3. Klik login
4. Seharusnya redirect ke admin dashboard

---

## 🌍 Production Deployment

### Step 1: Prepare Server

#### Linux Server Setup
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install dependencies
sudo apt-get install -y \
  curl \
  git \
  nginx \
  php8.2 \
  php8.2-cli \
  php8.2-fpm \
  php8.2-pgsql \
  php8.2-curl \
  php8.2-mbstring \
  composer \
  postgresql

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Enable services
sudo systemctl enable nginx
sudo systemctl enable php8.2-fpm
sudo systemctl enable postgresql
```

### Step 2: Clone & Setup Repository

```bash
# Create project directory
sudo mkdir -p /var/www/project-hub-pro
cd /var/www/project-hub-pro

# Clone repository
sudo git clone https://github.com/yourusername/project-hub-pro.git .

# Set permissions
sudo chown -R www-data:www-data /var/www/project-hub-pro
sudo chmod -R 755 /var/www/project-hub-pro
sudo chmod -R 775 /var/www/project-hub-pro/backend/storage
sudo chmod -R 775 /var/www/project-hub-pro/backend/bootstrap/cache
```

### Step 3: Backend Deployment

```bash
cd /var/www/project-hub-pro/backend

# Install dependencies
composer install --no-dev --optimize-autoloader

# Copy environment
sudo cp .env.example .env

# Generate key
php artisan key:generate

# Set production database
# Edit .env dengan production database credentials

# Run migrations
php artisan migrate --force

# Seed data (optional)
php artisan db:seed --force

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Set permissions
sudo chown -R www-data:www-data /var/www/project-hub-pro/backend
```

### Step 4: Frontend Deployment

```bash
cd /var/www/project-hub-pro

# Copy environment
cp .env.example .env.production

# Set production API URL
# Edit .env.production:
# VITE_API_URL=https://api.yourdomain.com

# Install & build
npm install
npm run build

# Output di dist/ folder
```

### Step 5: Nginx Configuration

Create `/etc/nginx/sites-available/project-hub-pro`:

```nginx
# API Server Block
server {
    listen 80;
    server_name api.yourdomain.com;
    
    root /var/www/project-hub-pro/backend/public;
    index index.php;

    # SSL redirect
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    root /var/www/project-hub-pro/backend/public;
    index index.php;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Laravel rewrite
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Block access to sensitive files
    location ~ /\.(?!well-known).* {
        deny all;
    }
}

# Frontend Server Block
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/project-hub-pro/dist;
    index index.html;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable sites:
```bash
sudo ln -s /etc/nginx/sites-available/project-hub-pro \
  /etc/nginx/sites-enabled/

sudo rm /etc/nginx/sites-enabled/default

# Test & reload
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificates
sudo certbot certonly --nginx -d api.yourdomain.com -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Step 7: Environment Variables

**Backend** (`/var/www/project-hub-pro/backend/.env`):
```env
APP_NAME="Project Hub Pro"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_CONNECTION=pgsql
DB_HOST=your-db-host
DB_PORT=5432
DB_DATABASE=prod_db
DB_USERNAME=prod_user
DB_PASSWORD=secure_password

CACHE_DRIVER=redis
QUEUE_CONNECTION=database
SESSION_DRIVER=cookie

JWT_SECRET=your-jwt-secret-key

CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

**Frontend** (`.env.production`):
```env
VITE_API_URL=https://api.yourdomain.com
VITE_API_TIMEOUT=10000
NODE_ENV=production
```

### Step 8: Verify Production

```bash
# Check services
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo systemctl status postgresql

# Check logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/www/project-hub-pro/backend/storage/logs/laravel.log

# Test endpoints
curl https://api.yourdomain.com/api/projects
curl https://yourdomain.com
```

---

## 🐳 Docker Setup

### Create Dockerfile

```dockerfile
# Dockerfile for Production
FROM php:8.2-fpm as backend

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    git \
    curl \
    unzip

# Install PHP extensions
RUN docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql
RUN docker-php-ext-install pdo_pgsql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy backend files
COPY backend/ .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Permissions
RUN chown -R www-data:www-data /app

# Frontend build
FROM node:20-alpine as frontend

WORKDIR /build

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Nginx
FROM nginx:alpine

# Copy backend
COPY --from=backend /app/public /var/www/backend/public

# Copy frontend
COPY --from=frontend /build/dist /var/www/frontend

# Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: project_hub_postgres
    environment:
      POSTGRES_DB: project_hub
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Laravel Backend
  backend:
    image: project-hub-pro:latest
    container_name: project_hub_backend
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - DB_HOST=postgres
      - DB_DATABASE=project_hub
      - DB_USERNAME=postgres
      - DB_PASSWORD=secure_password
      - APP_ENV=production
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend/storage:/app/storage
      - ./backend/bootstrap/cache:/app/bootstrap/cache
    command: php artisan serve --host=0.0.0.0

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: project_hub_redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:

networks:
  default:
    name: project_hub_network
```

### Docker Commands

```bash
# Build image
docker-compose build

# Start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Run migration
docker-compose exec backend php artisan migrate

# Stop containers
docker-compose down

# Restart
docker-compose restart
```

---

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check connection
php artisan tinker
>>> DB::connection()->getPDO()

# For Supabase, ensure:
# - SSL mode is enabled
# - IP is whitelisted
# - Credentials are correct
```

### Permission Denied

```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/project-hub-pro
chmod -R 775 backend/storage backend/bootstrap/cache
```

### Port Already in Use

```bash
# Find process using port
lsof -i :8000
lsof -i :5173

# Kill process
kill -9 <PID>
```

### Composer Out of Memory

```bash
# Increase memory limit
php -d memory_limit=-1 /usr/bin/composer install
```

### Node.js Module Issues

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# For Bun
rm -rf node_modules bun.lock
bun install
```

### API CORS Error

```bash
# Frontend .env
VITE_API_URL=http://localhost:8000

# Backend config/cors.php
'allowed_origins' => ['http://localhost:5173']
```

---

## ✅ First Run Checklist

### Pre-Development

- [ ] Clone repository
- [ ] Copy .env files (backend & frontend)
- [ ] Install dependencies (backend & frontend)
- [ ] Setup database (Supabase atau PostgreSQL)
- [ ] Run migrations
- [ ] Create test user
- [ ] Start backend (php artisan serve)
- [ ] Start frontend (npm/bun run dev)

### Development Verification

- [ ] Backend accessible: http://localhost:8000
- [ ] Frontend accessible: http://localhost:5173
- [ ] API responding: http://localhost:8000/api
- [ ] Login works
- [ ] Create project works
- [ ] Upload file works
- [ ] No console errors

### Pre-Production

- [ ] All dependencies updated
- [ ] Environment variables configured
- [ ] Database migrated
- [ ] SSL certificates installed
- [ ] Nginx configured
- [ ] File permissions set
- [ ] Logs configured
- [ ] Backup strategy ready

### Post-Production

- [ ] Domain DNS pointing correctly
- [ ] SSL certificate verified
- [ ] API responding on HTTPS
- [ ] Frontend loading correctly
- [ ] Login/auth working
- [ ] Database backups automated
- [ ] Logs being collected
- [ ] Monitoring setup (optional)

---

## 📞 Support

- **Documentation**: See [docs/](../docs/)
- **Issues**: GitHub Issues
- **Email**: support@projecthub.com

---

**Last Updated**: May 2026
