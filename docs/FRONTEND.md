# Frontend Documentation

Dokumentasi lengkap untuk frontend React + TypeScript Project Hub Pro.

---

## 📋 Daftar Isi

- [Teknologi & Setup](#teknologi--setup)
- [Struktur Folder](#struktur-folder)
- [Project Structure](#project-structure)
- [Routing](#routing)
- [Components](#components)
- [Hooks & State Management](#hooks--state-management)
- [API Integration](#api-integration)
- [Styling](#styling)
- [Development](#development)
- [Deployment](#deployment)

---

## 🛠️ Teknologi & Setup

### Tech Stack
- **Framework**: React 19
- **Router**: TanStack Router v1
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Library**: Radix UI
- **CSS**: Tailwind CSS
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Package Manager**: Bun

### Instalasi

#### Prerequisites
- Node.js 18+ atau Bun
- Git

#### Langkah-Langkah

```bash
# 1. Clone repository
cd project-hub-pro

# 2. Install dependencies
bun install
# atau: npm install / yarn install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan API endpoint

# 4. Start development server
bun run dev
# Akses di http://localhost:5173

# 5. Build untuk production
bun run build

# 6. Preview build
bun run preview
```

### Environment Variables

Buat file `.env.local`:

```env
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=10000
NODE_ENV=development
```

---

## 📁 Struktur Folder

```
src/
├── routes/                     # TanStack Router pages
│   ├── __root.tsx             # Root layout wrapper
│   ├── index.tsx              # Home page
│   ├── login.tsx              # Login page
│   │
│   ├── admin.tsx              # Admin layout
│   ├── admin.index.tsx        # Admin dashboard
│   ├── admin.projects.tsx     # Projects list
│   ├── admin.projects.tsx     # Project detail
│   ├── admin.users.tsx        # Users management
│   ├── admin.staff.tsx        # Staff management
│   ├── admin.files.tsx        # Files management
│   ├── admin.chat.tsx         # Chat system
│   ├── admin.reports.tsx      # Reports & analytics
│   ├── admin.settings.tsx     # System settings
│   │
│   ├── client.tsx             # Client layout
│   ├── client.index.tsx       # Client dashboard
│   ├── client.projects.tsx    # Projects list
│   ├── client.projects.$id.tsx # Project detail
│   ├── client.calendar.tsx    # Calendar view
│   ├── client.chat.tsx        # Chat messaging
│   ├── client.notifications.tsx # Notifications
│   └── client.profile.tsx     # User profile
│
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx    # Admin wrapper
│   │   ├── ClientLayout.tsx   # Client wrapper
│   │   ├── Header.tsx         # Header bar
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   └── Footer.tsx         # Footer
│   │
│   ├── shared/
│   │   ├── ProjectCard.tsx    # Project card component
│   │   ├── UserAvatar.tsx     # User avatar
│   │   ├── FileUploader.tsx   # File upload component
│   │   ├── Modal.tsx          # Modal wrapper
│   │   ├── DataTable.tsx      # Reusable table
│   │   ├── Form.tsx           # Form wrapper
│   │   └── Pagination.tsx     # Pagination
│   │
│   └── ui/                    # Radix UI wrappers
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Dialog.tsx
│       ├── Tabs.tsx
│       ├── Card.tsx
│       └── ... (other UI)
│
├── hooks/
│   ├── use-mobile.tsx         # Mobile detection
│   ├── use-auth.ts            # Auth hook
│   ├── use-projects.ts        # Projects data
│   ├── use-users.ts           # Users data
│   └── ... (other custom hooks)
│
├── lib/
│   ├── api.ts                 # API client setup
│   ├── auth.ts                # Auth utilities
│   ├── error-capture.ts       # Error handling
│   ├── error-page.ts          # Error page utils
│   ├── utils.ts               # Utility functions
│   ├── project-store.ts       # State management
│   └── mock-data.ts           # Mock data
│
├── integrations/              # External integrations
│   └── (API integrations, plugins, etc)
│
├── router.tsx                 # Router configuration
├── routeTree.gen.ts          # Auto-generated route tree
├── server.ts                 # SSR server entry
├── start.ts                  # App start
├── styles.css                # Global styles
└── index.html                # HTML entry point
```

---

## 🛣️ Routing

### Router Setup

**File**: `src/router.tsx`

```typescript
import { RootRoute, Router, Route } from '@tanstack/react-router'
import Root from './routes/__root'
import Login from './routes/login'
import AdminLayout from './routes/admin'
import AdminDashboard from './routes/admin.index'

// Define routes
const rootRoute = new RootRoute({
  component: Root,
})

const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
})

const adminRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminLayout,
})

const adminDashboardRoute = new Route({
  getParentRoute: () => adminRoute,
  path: '/',
  component: AdminDashboard,
})

// Create router
const routeTree = rootRoute.addChildren([
  loginRoute,
  adminRoute.addChildren([adminDashboardRoute]),
])

export const router = new Router({ routeTree })
```

### Route Types

#### Public Routes
- `/` - Home
- `/login` - Login page

#### Admin Routes (Protected)
- `/admin` - Admin dashboard
- `/admin/projects` - Projects list
- `/admin/users` - Users management
- `/admin/staff` - Staff management
- `/admin/files` - Files management
- `/admin/chat` - Chat system
- `/admin/reports` - Reports
- `/admin/settings` - Settings

#### Client Routes (Protected)
- `/client` - Client dashboard
- `/client/projects` - Projects list
- `/client/projects/:id` - Project detail
- `/client/calendar` - Calendar view
- `/client/chat` - Chat
- `/client/notifications` - Notifications
- `/client/profile` - User profile

### Route Guards

**File**: `src/lib/auth.ts`

```typescript
// Protected route guard
export function requireAuth() {
  const token = localStorage.getItem('token')
  if (!token) {
    throw redirect({ to: '/login' })
  }
  return token
}

// Role-based access
export function requireRole(role: string) {
  const user = localStorage.getItem('user')
  if (!user) return requireAuth()
  
  const parsedUser = JSON.parse(user)
  if (parsedUser.role !== role) {
    throw redirect({ to: '/' })
  }
}
```

---

## 🎨 Components

### Layout Components

#### AdminLayout
```typescript
// src/components/layout/AdminLayout.tsx
<div className="flex h-screen">
  <Sidebar role="admin" />
  <div className="flex-1 flex flex-col">
    <Header />
    <main className="flex-1 overflow-auto p-6">
      <Outlet />
    </main>
  </div>
</div>
```

#### ClientLayout
```typescript
// src/components/layout/ClientLayout.tsx
<div className="flex h-screen">
  <Sidebar role="client" />
  <div className="flex-1 flex flex-col">
    <Header />
    <main className="flex-1 overflow-auto p-6">
      <Outlet />
    </main>
  </div>
</div>
```

### Shared Components

#### ProjectCard
```typescript
interface ProjectCardProps {
  project: Project
  onClick?: () => void
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <Card onClick={onClick} className="cursor-pointer hover:shadow-lg">
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>{project.category}</CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={project.progress} />
        <p className="text-sm text-gray-500 mt-2">
          Status: {project.status}
        </p>
      </CardContent>
    </Card>
  )
}
```

#### FileUploader
```typescript
interface FileUploaderProps {
  onUpload: (file: File) => Promise<void>
  projectId: string
}

export function FileUploader({ onUpload, projectId }: FileUploaderProps) {
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    for (const file of files) {
      await onUpload(file)
    }
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed p-8 rounded cursor-pointer"
    >
      <input
        type="file"
        multiple
        onChange={(e) => {
          e.target.files?.forEach(onUpload)
        }}
      />
    </div>
  )
}
```

### UI Components

Semua UI components menggunakan Radix UI primitives:

```typescript
// src/components/ui/Button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-slate-50 hover:bg-slate-800",
        destructive: "bg-red-500 text-slate-50 hover:bg-red-600",
        outline: "border border-slate-200 bg-white hover:bg-slate-100",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        link: "text-slate-900 underline-offset-4 hover:underline",
      },
    },
  }
)
```

---

## 🪝 Hooks & State Management

### Custom Hooks

#### useAuth
```typescript
// src/hooks/use-auth.ts
export function useAuth() {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUser(token).then(setUser)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.post('/login', { email, password })
    localStorage.setItem('token', response.data.token)
    setUser(response.data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return { user, loading, login, logout }
}
```

#### useProjects
```typescript
// src/hooks/use-projects.ts
export function useProjects(filters?: ProjectFilters) {
  const [projects, setProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    fetchProjects(filters)
      .then(setProjects)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [filters])

  return { projects, loading, error }
}
```

#### useMobile
```typescript
// src/hooks/use-mobile.tsx
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)")
    const onChange = () => setIsMobile(window.innerWidth < 768)
    
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < 768)
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
```

### State Management

Menggunakan kombinasi:
- Local state (React.useState)
- Context API (untuk auth, theme)
- localStorage (untuk persistence)
- URL params (untuk filtering)

**File**: `src/lib/project-store.ts`

```typescript
// Simple store untuk project state
export const projectStore = {
  projects: [] as Project[],
  filters: {} as ProjectFilters,

  setProjects(projects: Project[]) {
    this.projects = projects
  },

  setFilters(filters: ProjectFilters) {
    this.filters = filters
  },

  getFiltered() {
    return this.projects.filter(p => {
      if (this.filters.status && p.status !== this.filters.status) return false
      if (this.filters.client_id && p.client_id !== this.filters.client_id) return false
      return true
    })
  }
}
```

---

## 🔌 API Integration

### API Client Setup

**File**: `src/lib/api.ts`

```typescript
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

### API Calls Examples

```typescript
// Authentication
async function login(email: string, password: string) {
  const response = await api.post('/login', { email, password })
  return response.data
}

// Projects
async function getProjects(filters?: object) {
  const response = await api.get('/projects', { params: filters })
  return response.data
}

async function createProject(data: ProjectInput) {
  const response = await api.post('/projects', data)
  return response.data
}

async function updateProject(id: string, data: Partial<Project>) {
  const response = await api.patch(`/projects/${id}`, data)
  return response.data
}

// Files
async function uploadFile(file: File, projectId: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('project_id', projectId)
  
  const response = await api.post('/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}
```

---

## 🎨 Styling

### Tailwind CSS

**Configuration**: `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a',
        secondary: '#64748b',
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}

export default config
```

### Global Styles

**File**: `src/styles.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply scroll-smooth;
  }

  body {
    @apply bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50;
  }
}

@layer components {
  .container {
    @apply mx-auto px-4 max-w-7xl;
  }

  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition;
  }
}
```

---

## 💻 Development

### Development Commands

```bash
# Start dev server (with hot reload)
bun run dev

# Build untuk production
bun run build

# Preview production build
bun run preview

# Lint code
bun run lint

# Format code
bun run format
```

### Development Environment

```bash
# Terminal 1: Start backend
cd backend
php artisan serve

# Terminal 2: Start frontend
bun run dev
```

Aplikasi akan berjalan di:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- API: `http://localhost:8000/api`

### Debugging

#### Browser DevTools
- React Developer Tools extension
- Network tab untuk API calls
- Console untuk errors

#### VS Code Debugging
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Vite App",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

### Hot Module Replacement (HMR)

Vite otomatis reload saat file berubah. Untuk konfigurasi:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    hmr: {
      host: 'localhost',
      port: 5173,
    },
  },
})
```

---

## 🚀 Deployment

### Build Untuk Production

```bash
# Build optimized bundle
bun run build

# Output di dist/ folder
# - Minified CSS/JS
# - Lazy-loaded chunks
# - Sourcemaps (optional)
```

### Deployment Options

#### 1. Cloudflare Pages
```bash
# wrangler.jsonc sudah configured
npm run build
wrangler deploy
```

#### 2. Vercel
```bash
# Deploy ke Vercel
vercel

# Atau link GitHub repo ke Vercel dashboard
```

#### 3. Static Hosting (Netlify, GitHub Pages)
```bash
# Build dan push dist/ folder
bun run build
# Upload dist/ ke hosting
```

#### 4. Docker

```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables (Production)

```env
VITE_API_URL=https://api.projecthub.com
VITE_API_TIMEOUT=10000
NODE_ENV=production
```

### Performance Optimization

```typescript
// Code splitting
const AdminLayout = React.lazy(() => import('./components/layout/AdminLayout'))

// Image optimization
<img src={image} loading="lazy" alt="..." />

// Bundle analysis
import { visualizer } from 'rollup-plugin-visualizer'
// Add to vite.config.ts
```

---

## 📚 Resource Files

### Type Definitions

**File**: `src/lib/types.ts`

```typescript
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'staff' | 'client'
  status: 'active' | 'inactive'
}

export interface Project {
  id: string
  name: string
  category: string
  client: string
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold'
  progress: number
  deadline: Date
  description: string
}

export interface File {
  id: string
  name: string
  size: number
  type: string
  path: string
  projectId: string
  uploadedBy: string
}
```

### Mock Data

**File**: `src/lib/mock-data.ts`

```typescript
export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Project A',
    category: 'Web Development',
    client: 'Client A',
    status: 'in_progress',
    progress: 65,
    deadline: new Date('2026-06-30'),
    description: 'Project A description'
  },
  // ... more mock data
]

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active'
  },
  // ... more mock data
]
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port
bun run dev -- --port 3000
```

### Module Not Found
```bash
# Clear cache dan reinstall
rm -rf node_modules bun.lock
bun install
```

### CORS Error
```typescript
// Backend: Configure CORS in Laravel
// config/cors.php
'allowed_origins' => ['http://localhost:5173']
```

### API Timeout
```typescript
// Update .env.local
VITE_API_TIMEOUT=30000  // 30 seconds
```

---

## 📚 Resources

- [React Documentation](https://react.dev)
- [TanStack Router](https://tanstack.com/router)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev)

---

**Last Updated**: May 2026
