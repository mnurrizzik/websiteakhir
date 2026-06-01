# Contributing Guide

Panduan untuk berkontribusi dalam Project Hub Pro.

---

## 📋 Daftar Isi

- [Kode Etik](#kode-etik)
- [Cara Berkontribusi](#cara-berkontribusi)
- [Development Guidelines](#development-guidelines)
- [Commit & Pull Request](#commit--pull-request)
- [Code Review Process](#code-review-process)

---

## 📖 Kode Etik

Komunitas kami berkomitmen untuk menyediakan lingkungan yang welcoming dan inclusive. Kami menghargai:

- **Respect**: Hormati perspektif dan pengalaman orang lain
- **Inclusivity**: Semua orang welcome tanpa memandang latar belakang
- **Professionalism**: Komunikasi yang baik dan konstruktif
- **Collaboration**: Bekerja sama untuk hasil terbaik

### Perilaku Tidak Diizinkan

- Harassment atau bullying
- Diskriminasi
- Spam atau troll
- Kode yang merusak

---

## 💡 Cara Berkontribusi

### 1. Report Issues

Jika menemukan bug atau punya feature request:

```bash
# Cek GitHub Issues untuk lihat apakah sudah ada
# Jika tidak, buat issue baru dengan template

# Issue Template:
- **Title**: Deskripsi singkat
- **Description**: Penjelasan detail
- **Steps to Reproduce**: Langkah-langkah mengulang (untuk bugs)
- **Expected Behavior**: Apa yang seharusnya terjadi
- **Actual Behavior**: Apa yang terjadi sekarang
- **Environment**: OS, browser, versi, dll
```

### 2. Fix Issues

Siap mulai coding? Ikuti langkah-langkah:

```bash
# 1. Fork repository
# https://github.com/yourusername/project-hub-pro

# 2. Clone fork Anda
git clone https://github.com/YOUR_USERNAME/project-hub-pro.git
cd project-hub-pro

# 3. Add upstream remote
git remote add upstream https://github.com/original/project-hub-pro.git

# 4. Buat feature branch
git checkout -b feature/issue-description
# atau
git checkout -b fix/bug-description

# 5. Sync dengan main
git fetch upstream
git rebase upstream/main

# 6. Mulai coding!
```

### 3. Feature Development

Untuk fitur baru:

```bash
# 1. Buat issue dulu untuk diskusi
# - Jelaskan apa yang ingin ditambah
- Tunggu approval dari maintainer
- Mulai development setelah approval

# 2. Ikuti development guidelines (lihat bawah)

# 3. Test thoroughly

# 4. Create PR dengan deskripsi detail
```

---

## 📋 Development Guidelines

### Backend (Laravel)

#### Code Style
- Follow PSR-12 coding standard
- Use meaningful variable names
- Add type hints untuk semua function parameters
- Add PHPDoc comments untuk public methods

```php
/**
 * Get projects for user
 *
 * @param string $userId User ID
 * @param array $filters Optional filters
 * @return Collection
 */
public function getProjects(string $userId, array $filters = []): Collection
{
    return Project::where('admin_id', $userId)
        ->when($filters['status'] ?? null, fn($q) => $q->where('status', $filters['status']))
        ->get();
}
```

#### Best Practices
- One model per file
- One controller method per action
- Use scopes untuk reusable queries
- Use resources untuk API responses
- Add validation rules
- Handle errors gracefully

```php
// Good: Scope untuk reusable logic
class Project extends Model
{
    public function scopeActive($query)
    {
        return $query->where('status', '!=', 'archived');
    }
}

// Usage
Project::active()->get();
```

#### Testing
```php
// Write tests untuk semua public methods
class ProjectControllerTest extends TestCase
{
    public function test_can_list_projects()
    {
        $response = $this->get('/api/projects');
        $response->assertStatus(200);
    }
}

// Run tests
php artisan test
```

### Frontend (React)

#### Code Style
- Use functional components
- Use TypeScript untuk type safety
- Use meaningful component names
- Add JSDoc comments untuk complex functions

```typescript
/**
 * ProjectCard - Display single project
 * @param {ProjectCardProps} props
 * @returns {JSX.Element}
 */
interface ProjectCardProps {
  project: Project
  onSelect?: (project: Project) => void
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  return (
    <Card onClick={() => onSelect?.(project)}>
      {/* Content */}
    </Card>
  )
}
```

#### Best Practices
- Use custom hooks untuk reusable logic
- Use React.memo untuk components yang sering di-render
- Use proper error boundaries
- Add loading & error states
- Use TypeScript interfaces
- Keep components small & focused

```typescript
// Good: Small, focused component
interface UserAvatarProps {
  user: User
  size?: 'sm' | 'md' | 'lg'
}

export function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  return (
    <Avatar>
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback>{user.initials}</AvatarFallback>
    </Avatar>
  )
}
```

#### Testing
```typescript
// Write tests untuk components & hooks
import { render, screen } from '@testing-library/react'

describe('ProjectCard', () => {
  it('displays project name', () => {
    render(<ProjectCard project={mockProject} />)
    expect(screen.getByText(mockProject.name)).toBeInTheDocument()
  })
})
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| PHP Classes | PascalCase | `ProjectController` |
| PHP Methods | camelCase | `getProjects()` |
| Database Tables | snake_case_plural | `user_projects` |
| Database Columns | snake_case | `created_at` |
| React Components | PascalCase | `ProjectCard.tsx` |
| React Hooks | use + PascalCase | `useProjects.ts` |
| Variables | camelCase | `projectId` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |

### Git Conventions

**Commit Messages**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (tidak ada logic change)
- `refactor`: Code refactor
- `perf`: Performance improvement
- `test`: Add tests
- `chore`: Build, dependencies, etc

Examples:
```
feat(projects): Add project archiving feature
fix(auth): Fix JWT token expiration issue
docs(api): Update API documentation
chore(deps): Update Laravel to 11.5
```

---

## 🔄 Commit & Pull Request

### Before Committing

```bash
# 1. Update branch dengan latest changes
git fetch upstream
git rebase upstream/main

# 2. Run linting
# Backend
cd backend
./vendor/bin/phpstan analyse

# Frontend
npm run lint
npm run format

# 3. Run tests
# Backend
php artisan test

# Frontend  
npm run test

# 4. Fix any issues found
```

### Creating Pull Request

```bash
# 1. Push ke fork Anda
git push origin feature/issue-description

# 2. Buka GitHub dan create PR
# - Base branch: main
# - Compare branch: feature/issue-description

# 3. Fill PR template:
# - Jelaskan perubahan
# - Link ke related issues
# - Describe testing done
# - Add screenshots (jika ada UI changes)

# PR Template:
## Description
Brief description of changes

## Related Issues
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change

## Testing Done
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Screenshots (if UI changes)
[Add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
```

### After Creating PR

1. Wait untuk review dari maintainers
2. Respond ke feedback/comments
3. Make requested changes
4. Push updates (maintainer akan review lagi)
5. Jika approved, maintainer akan merge

---

## 🔍 Code Review Process

### What Reviewers Look For

- ✅ Code quality & style
- ✅ Logic correctness
- ✅ Performance implications
- ✅ Security concerns
- ✅ Test coverage
- ✅ Documentation

### Common Feedback

| Feedback | Meaning | Action |
|----------|---------|--------|
| LGTM | Looks good to me | Ready to merge |
| Request Changes | Need modifications | Fix & push again |
| Comment | Suggestion/question | Respond/consider |
| Approve | Reviewer approves | Can merge |

### Responding to Feedback

```bash
# 1. Understand the feedback
# - Re-read comment
# - Ask for clarification jika perlu

# 2. Make changes
# - Update code
# - Add commits dengan context

# 3. Push changes
git add .
git commit -m "Address review feedback"
git push origin feature/branch

# 4. Reply to comment
# - Thank reviewer
# - Explain changes made
# - Mark as resolved (if applicable)
```

---

## 🎯 Development Workflow Example

```bash
# 1. Identify issue
# GitHub Issue #42: "Add project export feature"

# 2. Fork & clone
git clone https://github.com/YOUR_USERNAME/project-hub-pro.git
cd project-hub-pro

# 3. Create branch
git checkout -b feature/project-export

# 4. Development
# - Create backend endpoint
# - Create frontend UI
# - Write tests
# - Add documentation

# 5. Local testing
php artisan serve
npm run dev
# Test manually

# 6. Run lint & tests
./vendor/bin/phpstan analyse
npm run lint
npm run format
php artisan test

# 7. Commit
git add .
git commit -m "feat(projects): Add export to Excel/PDF functionality"

# 8. Push
git push origin feature/project-export

# 9. Create PR on GitHub

# 10. Respond to feedback & make changes

# 11. Merge (maintainer) atau rebase & merge
```

---

## 📚 Documentation Updates

Jika ada changes dalam:
- **API**: Update [API.md](./docs/API.md)
- **Backend**: Update [BACKEND.md](./docs/BACKEND.md)
- **Frontend**: Update [FRONTEND.md](./docs/FRONTEND.md)
- **Setup**: Update [INSTALLATION.md](./docs/INSTALLATION.md)

---

## 🆘 Need Help?

- **Questions**: GitHub Discussions
- **Issues**: GitHub Issues
- **Email**: support@projecthub.com
- **Chat**: Discord server (jika ada)

---

## 🙏 Recognition

Contributors kami sangat dihargai! Kontribusi Anda akan:
- Listed di CONTRIBUTORS.md
- Credited di release notes
- Featured di project website

---

## 📜 License

Dengan berkontribusi, Anda agree bahwa kontribusi Anda di-license di bawah MIT License yang sama dengan project ini.

---

**Happy Contributing! 🎉**
