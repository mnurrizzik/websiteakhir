# API Documentation

Dokumentasi lengkap untuk REST API Project Hub Pro.

---

## 📋 Daftar Isi

- [Base URL & Headers](#base-url--headers)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
- [Rate Limiting](#rate-limiting)
- [Versioning](#versioning)

---

## 🌐 Base URL & Headers

### Base URL
```
Production: https://api.projecthub.com/api
Development: http://localhost:8000/api
```

### Required Headers
```
Content-Type: application/json
Authorization: Bearer {token}
Accept: application/json
```

### Optional Headers
```
X-Request-ID: {unique-request-id}
X-API-Version: 1
```

---

## 🔐 Authentication

### Login Endpoint

**Request**:
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "admin",
    "status": "active",
    "color": "#FF5733",
    "initials": "JD"
  }
}
```

**Error Response (401 Unauthorized)**:
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": {
    "email": ["The provided credentials are incorrect"]
  }
}
```

### Logout Endpoint

**Request**:
```http
POST /api/logout
Authorization: Bearer {token}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Current User

**Request**:
```http
GET /api/user
Authorization: Bearer {token}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "admin",
    "status": "active",
    "client_id": null,
    "color": "#FF5733",
    "initials": "JD",
    "api_token": "token_string",
    "created_at": "2026-05-26T03:10:33Z",
    "updated_at": "2026-05-26T03:10:33Z"
  }
}
```

### Token Usage

Setiap request terproteksi memerlukan token di header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token expires dalam 24 jam. Jika expired, user akan mendapat response 401 dan harus login kembali.

---

## 📦 Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Data retrieved",
  "data": [
    // Array of items
  ],
  "pagination": {
    "total": 100,
    "per_page": 10,
    "current_page": 1,
    "last_page": 10,
    "from": 1,
    "to": 10
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message here",
  "errors": {
    "field_name": ["Error description"]
  }
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Status | Meaning | Usage |
|--------|---------|-------|
| 200 | OK | Success |
| 201 | Created | Resource created |
| 204 | No Content | Success, no data |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable | Validation error |
| 429 | Too Many Requests | Rate limit |
| 500 | Server Error | Internal error |

### Error Examples

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Invalid request",
  "errors": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Unauthorized",
  "errors": {
    "auth": ["Invalid or expired token"]
  }
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "Resource not found",
  "errors": {
    "id": ["Project with ID 123 not found"]
  }
}
```

---

## 🔌 Endpoints

### User Management

#### List Users

**Request**:
```http
GET /api/users?role=admin&status=active&page=1&per_page=10
Authorization: Bearer {token}
```

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| role | string | Filter by role: admin, staff, client |
| status | string | Filter by status: active, inactive |
| page | integer | Page number (default: 1) |
| per_page | integer | Items per page (default: 10) |
| search | string | Search by name or email |

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Users retrieved",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "status": "active",
      "client_id": null,
      "created_at": "2026-05-26T03:10:33Z"
    }
  ],
  "pagination": {
    "total": 50,
    "per_page": 10,
    "current_page": 1,
    "last_page": 5
  }
}
```

#### Create User

**Request**:
```http
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "SecurePassword123",
  "role": "staff",
  "status": "active"
}
```

**Validation**:
- `name`: Required, string, max 255 characters
- `email`: Required, email format, unique
- `password`: Required, min 8 characters
- `role`: Required, enum: admin|staff|client
- `status`: Optional, enum: active|inactive

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "staff",
    "status": "active",
    "created_at": "2026-05-26T10:00:00Z",
    "updated_at": "2026-05-26T10:00:00Z"
  }
}
```

#### Update User

**Request**:
```http
PUT /api/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "inactive",
  "color": "#FF5733"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Updated Name",
    "email": "newuser@example.com",
    "status": "inactive",
    "color": "#FF5733",
    "updated_at": "2026-05-26T10:05:00Z"
  }
}
```

#### Delete User

**Request**:
```http
DELETE /api/users/{id}
Authorization: Bearer {token}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### Project Management

#### List Projects

**Request**:
```http
GET /api/projects?status=in_progress&client_id=uuid&page=1
Authorization: Bearer {token}
```

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter: planning, in_progress, completed, on_hold |
| client_id | string | Filter by client UUID |
| admin_id | string | Filter by admin UUID |
| page | integer | Page number |
| per_page | integer | Items per page |

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Projects retrieved",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "name": "Website Redesign",
      "category": "Web Development",
      "client": "Company A",
      "client_id": "550e8400-e29b-41d4-a716-446655440010",
      "admin_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "in_progress",
      "progress": 65,
      "deadline": "2026-06-30",
      "description": "Complete redesign of company website",
      "created_at": "2026-05-26T03:10:33Z",
      "updated_at": "2026-05-26T03:10:33Z"
    }
  ],
  "pagination": {
    "total": 25,
    "per_page": 10,
    "current_page": 1,
    "last_page": 3
  }
}
```

#### Create Project

**Request**:
```http
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Mobile App",
  "category": "Mobile Development",
  "client": "Client Corp",
  "client_id": "550e8400-e29b-41d4-a716-446655440010",
  "admin_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "planning",
  "deadline": "2026-08-31",
  "description": "New mobile application for iOS and Android"
}
```

**Validation**:
- `name`: Required, string, max 255
- `category`: Required, string
- `client`: Required, string (company name)
- `client_id`: Required, UUID (valid user)
- `admin_id`: Required, UUID (valid user)
- `deadline`: Required, date format
- `status`: Optional, enum
- `description`: Optional, text

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440101",
    "name": "Mobile App",
    "category": "Mobile Development",
    "client": "Client Corp",
    "client_id": "550e8400-e29b-41d4-a716-446655440010",
    "admin_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "planning",
    "progress": 0,
    "deadline": "2026-08-31",
    "description": "New mobile application for iOS and Android",
    "created_at": "2026-05-26T10:10:00Z",
    "updated_at": "2026-05-26T10:10:00Z"
  }
}
```

#### Update Project

**Request**:
```http
PATCH /api/projects/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in_progress",
  "progress": 30,
  "description": "Updated description"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440101",
    "name": "Mobile App",
    "status": "in_progress",
    "progress": 30,
    "updated_at": "2026-05-26T10:15:00Z"
  }
}
```

#### Delete Project

**Request**:
```http
DELETE /api/projects/{id}
Authorization: Bearer {token}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

### File Management

#### List Files

**Request**:
```http
GET /api/files?project_id=uuid&page=1
Authorization: Bearer {token}
```

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| project_id | string | Filter by project UUID |
| type | string | Filter: document, image, video, audio, other |
| page | integer | Page number |

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Files retrieved",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440200",
      "name": "Project Proposal",
      "original_name": "proposal.pdf",
      "mime_type": "application/pdf",
      "type": "document",
      "size": 524288,
      "path": "/files/550e8400-e29b-41d4-a716-446655440200",
      "project_id": "550e8400-e29b-41d4-a716-446655440100",
      "uploaded_by": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2026-05-26T03:10:33Z"
    }
  ],
  "pagination": {
    "total": 15,
    "per_page": 10,
    "current_page": 1,
    "last_page": 2
  }
}
```

#### Upload File

**Request**:
```http
POST /api/files
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- file: [binary file]
- project_id: 550e8400-e29b-41d4-a716-446655440100
```

**Validation**:
- `file`: Required, file upload
- `project_id`: Required, UUID (project must exist)
- Max file size: 50MB
- Allowed types: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, ZIP, RAR

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440201",
    "name": "Design Document",
    "original_name": "design.pdf",
    "mime_type": "application/pdf",
    "type": "document",
    "size": 1048576,
    "path": "/files/550e8400-e29b-41d4-a716-446655440201",
    "project_id": "550e8400-e29b-41d4-a716-446655440100",
    "uploaded_by": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2026-05-26T10:20:00Z"
  }
}
```

#### Download File

**Request**:
```http
GET /api/files/{id}/download
Authorization: Bearer {token}
```

**Response (200 OK)**:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="design.pdf"

[Binary file data]
```

#### Delete File

**Request**:
```http
DELETE /api/files/{id}
Authorization: Bearer {token}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

### Demo Data

#### Seed Demo Data

**Request**:
```http
POST /api/seed-demo
Authorization: Bearer {token}

{}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Demo data seeded successfully",
  "data": {
    "users": 15,
    "projects": 20,
    "files": 35
  }
}
```

**Note**: Endpoint ini hanya untuk development/testing. Bisa membuat duplikat data.

---

## ⏱️ Rate Limiting

### Rate Limit Headers

Setiap response menyertakan header:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
```

### Rate Limits

| Endpoint | Method | Limit | Window |
|----------|--------|-------|--------|
| /login | POST | 5 | 15 minutes |
| /api/* | GET | 100 | 1 minute |
| /api/* | POST | 50 | 1 minute |
| /api/* | PATCH | 50 | 1 minute |
| /api/* | DELETE | 50 | 1 minute |

### Rate Limit Error

**Response (429 Too Many Requests)**:
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "retry_after": 60
}
```

---

## 🔄 Versioning

API version dapat dispesifikasi via header:

```http
X-API-Version: 1
```

Atau via URL path (untuk future versions):

```http
GET /api/v1/projects
GET /api/v2/projects  (future)
```

### Current Version

- **Version**: 1.0
- **Stability**: Stable
- **Deprecation Date**: TBD

---

## 📚 cURL Examples

### Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }'
```

### Get Projects
```bash
curl -X GET http://localhost:8000/api/projects \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

### Create Project
```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Project",
    "category": "Development",
    "client": "Client Name",
    "client_id": "uuid",
    "admin_id": "uuid",
    "deadline": "2026-06-30"
  }'
```

### Upload File
```bash
curl -X POST http://localhost:8000/api/files \
  -H "Authorization: Bearer {token}" \
  -F "file=@/path/to/file.pdf" \
  -F "project_id=uuid"
```

---

## 📚 Resources

- [REST API Best Practices](https://restfulapi.net)
- [HTTP Status Codes](https://httpwg.org/specs/rfc7231.html#status.codes)
- [JSON API Specification](https://jsonapi.org)
- [OpenAPI Specification](https://www.openapis.org)

---

**Last Updated**: May 2026
**API Version**: 1.0
