# API Endpoints - Detailed Examples & Usage

Panduan lengkap dengan contoh cURL, payload request, dan response untuk setiap endpoint.

---

## 📋 Daftar Isi

- [Authentication Endpoints](#authentication-endpoints)
- [User Management Endpoints](#user-management-endpoints)
- [Project Management Endpoints](#project-management-endpoints)
- [File Management Endpoints](#file-management-endpoints)
- [Demo Data Endpoint](#demo-data-endpoint)

---

## 🔐 Authentication Endpoints

### 1. POST /api/login - User Login

**Tujuan**: Login user dan dapatkan JWT token

**Method**: `POST`

#### Request

**cURL**:

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

**Payload**:

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Validation**:

- `email`: Required, valid email format
- `password`: Required, min 8 characters

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE2MjMyNDMyMzMsImV4cCI6MTYyMzMyOTYzM30.abcdefghijklmnop",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "status": "active",
    "color": "#FF5733",
    "initials": "AU"
  }
}
```

#### Response Error (401 Unauthorized)

```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": {
    "email": ["The provided credentials are incorrect"]
  }
}
```

---

### 2. POST /api/logout - User Logout

**Tujuan**: Logout user (invalidate token)

**Method**: `POST`

#### Request

**cURL**:

```bash
curl -X POST http://localhost:8000/api/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Headers Wajib**:

- `Authorization: Bearer {token}`

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Response Error (401 Unauthorized)

```json
{
  "success": false,
  "message": "Unauthorized",
  "errors": {
    "auth": ["Invalid or expired token"]
  }
}
```

---

### 3. GET /api/user - Get Current User

**Tujuan**: Dapatkan data user yang sedang login

**Method**: `GET`

#### Request

**cURL**:

```bash
curl -X GET http://localhost:8000/api/user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Headers Wajib**:

- `Authorization: Bearer {token}`

#### Response Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "status": "active",
    "client_id": null,
    "color": "#FF5733",
    "initials": "AU",
    "api_token": "token_string_here",
    "created_at": "2026-05-26T03:10:33Z",
    "updated_at": "2026-05-26T03:10:33Z"
  }
}
```

#### Response Error (401 Unauthorized)

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## 👥 User Management Endpoints

### 1. GET /api/users - List All Users

**Tujuan**: Dapatkan daftar semua user

**Method**: `GET`

**Permission**: Admin only

#### Request

**cURL** - Basic:

```bash
curl -X GET http://localhost:8000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**cURL** - With Filters:

```bash
curl -X GET "http://localhost:8000/api/users?role=admin&status=active&page=1&per_page=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Query Parameters**:

```
GET /api/users?role=admin&status=active&page=1&per_page=10&search=john
```

| Parameter | Type    | Description          | Example              |
| --------- | ------- | -------------------- | -------------------- |
| role      | string  | Filter by role       | admin, staff, client |
| status    | string  | Filter by status     | active, inactive     |
| page      | integer | Page number          | 1                    |
| per_page  | integer | Items per page       | 10                   |
| search    | string  | Search by name/email | john                 |

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "status": "active",
      "client_id": null,
      "color": "#FF5733",
      "initials": "AU",
      "created_at": "2026-05-26T03:10:33Z",
      "updated_at": "2026-05-26T03:10:33Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Staff User",
      "email": "staff@example.com",
      "role": "staff",
      "status": "active",
      "client_id": null,
      "color": "#2196F3",
      "initials": "SU",
      "created_at": "2026-05-26T04:10:33Z",
      "updated_at": "2026-05-26T04:10:33Z"
    }
  ],
  "pagination": {
    "total": 50,
    "per_page": 10,
    "current_page": 1,
    "last_page": 5,
    "from": 1,
    "to": 10
  }
}
```

#### Response Error (403 Forbidden)

```json
{
  "success": false,
  "message": "Unauthorized to access this resource"
}
```

---

### 2. POST /api/users - Create New User

**Tujuan**: Buat user baru

**Method**: `POST`

**Permission**: Admin only

#### Request

**cURL**:

```bash
curl -X POST http://localhost:8000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "SecurePassword123",
    "role": "staff",
    "status": "active"
  }'
```

**Payload**:

```json
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
- `email`: Required, unique email format
- `password`: Required, min 8 characters
- `role`: Required, enum: admin|staff|client
- `status`: Optional, enum: active|inactive (default: active)

#### Response Success (201 Created)

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "staff",
    "status": "active",
    "client_id": null,
    "color": "#4CAF50",
    "initials": "NU",
    "created_at": "2026-05-26T10:00:00Z",
    "updated_at": "2026-05-26T10:00:00Z"
  }
}
```

#### Response Error (422 Unprocessable Entity)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field must be a valid email."],
    "password": ["The password field must be at least 8 characters."]
  }
}
```

---

### 3. PUT /api/users/{id} - Update User

**Tujuan**: Update data user

**Method**: `PUT`

**Permission**: Admin or own profile

#### Request

**cURL**:

```bash
curl -X PUT http://localhost:8000/api/users/550e8400-e29b-41d4-a716-446655440002 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "status": "inactive",
    "color": "#FF9800",
    "role": "client"
  }'
```

**Payload** (optional fields):

```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "password": "NewPassword123",
  "role": "client",
  "status": "inactive",
  "color": "#FF9800"
}
```

**URL Parameter**:

- `{id}`: User ID (UUID)

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Updated Name",
    "email": "newuser@example.com",
    "role": "client",
    "status": "inactive",
    "color": "#FF9800",
    "initials": "NU",
    "updated_at": "2026-05-26T10:05:00Z"
  }
}
```

#### Response Error (404 Not Found)

```json
{
  "success": false,
  "message": "User not found",
  "errors": {
    "id": ["User with ID 550e8400-e29b-41d4-a716-446655440099 not found"]
  }
}
```

---

### 4. DELETE /api/users/{id} - Delete User

**Tujuan**: Hapus user

**Method**: `DELETE`

**Permission**: Admin only

#### Request

**cURL**:

```bash
curl -X DELETE http://localhost:8000/api/users/550e8400-e29b-41d4-a716-446655440002 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**URL Parameter**:

- `{id}`: User ID (UUID)

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### Response Error (404 Not Found)

```json
{
  "success": false,
  "message": "User not found"
}
```

---

## 📊 Project Management Endpoints

### 1. GET /api/projects - List All Projects

**Tujuan**: Dapatkan daftar project

**Method**: `GET`

**Permission**: Authenticated users

#### Request

**cURL** - Basic:

```bash
curl -X GET http://localhost:8000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**cURL** - With Filters:

```bash
curl -X GET "http://localhost:8000/api/projects?status=in_progress&client_id=550e8400-e29b-41d4-a716-446655440010&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Query Parameters**:

```
GET /api/projects?status=in_progress&client_id=uuid&admin_id=uuid&page=1&per_page=10
```

| Parameter | Type    | Description                               |
| --------- | ------- | ----------------------------------------- |
| status    | string  | planning, in_progress, completed, on_hold |
| client_id | string  | Filter by client UUID                     |
| admin_id  | string  | Filter by admin UUID                      |
| page      | integer | Page number                               |
| per_page  | integer | Items per page                            |

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Projects retrieved successfully",
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
      "description": "Complete redesign of company website with modern UI",
      "created_at": "2026-05-26T03:10:33Z",
      "updated_at": "2026-05-26T03:10:33Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440101",
      "name": "Mobile App",
      "category": "Mobile Development",
      "client": "Tech Startup",
      "client_id": "550e8400-e29b-41d4-a716-446655440011",
      "admin_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "planning",
      "progress": 0,
      "deadline": "2026-08-31",
      "description": "iOS and Android mobile application",
      "created_at": "2026-05-26T04:10:33Z",
      "updated_at": "2026-05-26T04:10:33Z"
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

---

### 2. POST /api/projects - Create Project

**Tujuan**: Buat project baru

**Method**: `POST`

**Permission**: Admin or staff

#### Request

**cURL**:

```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mobile App",
    "category": "Mobile Development",
    "client": "Client Corp",
    "client_id": "550e8400-e29b-41d4-a716-446655440010",
    "admin_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "planning",
    "deadline": "2026-08-31",
    "description": "New mobile application for iOS and Android"
  }'
```

**Payload**:

```json
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
- `client_id`: Required, valid UUID
- `admin_id`: Required, valid UUID
- `deadline`: Required, date format (YYYY-MM-DD)
- `status`: Optional, enum (default: planning)
- `description`: Optional, text

#### Response Success (201 Created)

```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440102",
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

#### Response Error (422 Unprocessable Entity)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "client_id": ["The selected client_id is invalid."],
    "deadline": ["The deadline field must be a valid date."]
  }
}
```

---

### 3. PATCH /api/projects/{id} - Update Project

**Tujuan**: Update project

**Method**: `PATCH`

**Permission**: Admin or project owner

#### Request

**cURL**:

```bash
curl -X PATCH http://localhost:8000/api/projects/550e8400-e29b-41d4-a716-446655440102 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "progress": 30,
    "description": "Updated description with new features"
  }'
```

**Payload** (optional fields):

```json
{
  "name": "Updated Project Name",
  "status": "in_progress",
  "progress": 30,
  "deadline": "2026-09-15",
  "description": "Updated description"
}
```

**URL Parameter**:

- `{id}`: Project ID (UUID)

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440102",
    "name": "Mobile App",
    "category": "Mobile Development",
    "client": "Client Corp",
    "status": "in_progress",
    "progress": 30,
    "deadline": "2026-09-15",
    "description": "Updated description with new features",
    "updated_at": "2026-05-26T10:15:00Z"
  }
}
```

#### Response Error (404 Not Found)

```json
{
  "success": false,
  "message": "Project not found",
  "errors": {
    "id": ["Project with ID 550e8400-e29b-41d4-a716-446655440199 not found"]
  }
}
```

---

### 4. DELETE /api/projects/{id} - Delete Project

**Tujuan**: Hapus project

**Method**: `DELETE`

**Permission**: Admin or project owner

#### Request

**cURL**:

```bash
curl -X DELETE http://localhost:8000/api/projects/550e8400-e29b-41d4-a716-446655440102 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**URL Parameter**:

- `{id}`: Project ID (UUID)

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

#### Response Error (404 Not Found)

```json
{
  "success": false,
  "message": "Project not found"
}
```

---

## 📁 File Management Endpoints

### 1. GET /api/files - List Files

**Tujuan**: Dapatkan daftar file

**Method**: `GET`

**Permission**: Authenticated users

#### Request

**cURL** - All Files:

```bash
curl -X GET http://localhost:8000/api/files \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**cURL** - Filter by Project:

```bash
curl -X GET "http://localhost:8000/api/files?project_id=550e8400-e29b-41d4-a716-446655440100&type=document&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Query Parameters**:

```
GET /api/files?project_id=uuid&type=document&page=1&per_page=10
```

| Parameter  | Type    | Description                          |
| ---------- | ------- | ------------------------------------ |
| project_id | string  | Filter by project UUID               |
| type       | string  | document, image, video, audio, other |
| page       | integer | Page number                          |
| per_page   | integer | Items per page                       |

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Files retrieved successfully",
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
      "created_at": "2026-05-26T03:10:33Z",
      "updated_at": "2026-05-26T03:10:33Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440201",
      "name": "Design Mockup",
      "original_name": "design.png",
      "mime_type": "image/png",
      "type": "image",
      "size": 2097152,
      "path": "/files/550e8400-e29b-41d4-a716-446655440201",
      "project_id": "550e8400-e29b-41d4-a716-446655440100",
      "uploaded_by": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2026-05-26T04:10:33Z",
      "updated_at": "2026-05-26T04:10:33Z"
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

---

### 2. POST /api/files - Upload File

**Tujuan**: Upload file baru

**Method**: `POST`

**Permission**: Authenticated users

**Content-Type**: `multipart/form-data`

#### Request

**cURL**:

```bash
curl -X POST http://localhost:8000/api/files \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/file.pdf" \
  -F "project_id=550e8400-e29b-41d4-a716-446655440100"
```

**Form Data**:

```
file: [binary file content]
project_id: 550e8400-e29b-41d4-a716-446655440100
```

**Validation**:

- `file`: Required, file upload
- `project_id`: Required, valid UUID (project must exist)
- Max file size: 50MB
- Allowed types: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, ZIP, RAR

#### Response Success (201 Created)

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440202",
    "name": "Design Document",
    "original_name": "design.pdf",
    "mime_type": "application/pdf",
    "type": "document",
    "size": 1048576,
    "path": "/files/550e8400-e29b-41d4-a716-446655440202",
    "project_id": "550e8400-e29b-41d4-a716-446655440100",
    "uploaded_by": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2026-05-26T10:20:00Z",
    "updated_at": "2026-05-26T10:20:00Z"
  }
}
```

#### Response Error (422 Unprocessable Entity)

```json
{
  "success": false,
  "message": "File upload failed",
  "errors": {
    "file": ["The file field is required."],
    "size": ["The file may not be greater than 51200 kilobytes."]
  }
}
```

#### Response Error (413 Payload Too Large)

```json
{
  "success": false,
  "message": "File size exceeds maximum allowed size (50MB)"
}
```

---

### 3. GET /api/files/{id}/download - Download File

**Tujuan**: Download file

**Method**: `GET`

**Permission**: Authenticated users

#### Request

**cURL**:

```bash
curl -X GET http://localhost:8000/api/files/550e8400-e29b-41d4-a716-446655440202/download \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -o filename.pdf
```

**URL Parameter**:

- `{id}`: File ID (UUID)

#### Response Success (200 OK)

```
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="design.pdf"
Content-Length: 1048576

[Binary file data...]
```

#### Response Error (404 Not Found)

```json
{
  "success": false,
  "message": "File not found"
}
```

---

### 4. DELETE /api/files/{id} - Delete File

**Tujuan**: Hapus file

**Method**: `DELETE`

**Permission**: Admin or file uploader

#### Request

**cURL**:

```bash
curl -X DELETE http://localhost:8000/api/files/550e8400-e29b-41d4-a716-446655440202 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**URL Parameter**:

- `{id}`: File ID (UUID)

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

#### Response Error (404 Not Found)

```json
{
  "success": false,
  "message": "File not found"
}
```

#### Response Error (403 Forbidden)

```json
{
  "success": false,
  "message": "Unauthorized to delete this file"
}
```

---

## 🌱 Demo Data Endpoint

### POST /api/seed-demo - Seed Demo Data

**Tujuan**: Create demo/test data (Development only)

**Method**: `POST`

**Permission**: Any authenticated user (Development)

#### Request

**cURL**:

```bash
curl -X POST http://localhost:8000/api/seed-demo \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**No request body needed**

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Demo data seeded successfully",
  "data": {
    "users": 15,
    "projects": 20,
    "files": 35,
    "details": {
      "admin_created": 2,
      "staff_created": 5,
      "client_created": 8,
      "projects_created": 20,
      "files_created": 35
    }
  }
}
```

**Note**: Endpoint ini hanya untuk development/testing. Dapat membuat duplikat data jika dipanggil berkali-kali.

---

## 🔄 Common HTTP Methods Summary

### GET

- **Purpose**: Retrieve data
- **Body**: No request body
- **Safe**: Yes
- **Idempotent**: Yes
- **Cacheable**: Yes

**Example**:

```bash
curl -X GET http://localhost:8000/api/users
```

### POST

- **Purpose**: Create new resource
- **Body**: Yes (JSON)
- **Safe**: No
- **Idempotent**: No
- **Cacheable**: No

**Example**:

```bash
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John"}'
```

### PUT

- **Purpose**: Replace entire resource
- **Body**: Yes (JSON)
- **Safe**: No
- **Idempotent**: Yes
- **Cacheable**: No

**Example**:

```bash
curl -X PUT http://localhost:8000/api/users/123 \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane", "email": "jane@example.com"}'
```

### PATCH

- **Purpose**: Partial update resource
- **Body**: Yes (JSON)
- **Safe**: No
- **Idempotent**: Yes
- **Cacheable**: No

**Example**:

```bash
curl -X PATCH http://localhost:8000/api/projects/123 \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress", "progress": 50}'
```

### DELETE

- **Purpose**: Delete resource
- **Body**: No request body
- **Safe**: No
- **Idempotent**: Yes
- **Cacheable**: No

**Example**:

```bash
curl -X DELETE http://localhost:8000/api/users/123
```

---

## 📋 Response Status Codes Summary

| Code | Status            | Usage                                |
| ---- | ----------------- | ------------------------------------ |
| 200  | OK                | Successful GET, PUT, PATCH, DELETE   |
| 201  | Created           | Successful POST (resource created)   |
| 204  | No Content        | Successful DELETE (no response body) |
| 400  | Bad Request       | Invalid request format               |
| 401  | Unauthorized      | Missing/invalid authentication       |
| 403  | Forbidden         | Authenticated but no permission      |
| 404  | Not Found         | Resource doesn't exist               |
| 422  | Unprocessable     | Validation error                     |
| 429  | Too Many Requests | Rate limit exceeded                  |
| 500  | Server Error      | Internal server error                |

---

## 🔑 Authentication Header Format

Semua request ke endpoint yang protected harus menyertakan header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Dapatkan token dari `/api/login` endpoint dan simpan untuk request berikutnya.

---

## 📝 Request Headers Best Practices

```bash
# Recommended headers untuk setiap request
curl -X GET http://localhost:8000/api/users \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-Request-ID: unique-request-id"
```

| Header        | Description                       |
| ------------- | --------------------------------- |
| Authorization | Bearer token untuk authentication |
| Content-Type  | application/json                  |
| Accept        | application/json                  |
| X-Request-ID  | Unique ID untuk tracking requests |

---

## 🧪 Testing dengan Postman

1. **Import Collection**:
   - Buat new collection di Postman
   - Import endpoints dari dokumentasi ini

2. **Setup Environment**:
   - Base URL: `http://localhost:8000`
   - Token: Dapatkan dari login, simpan di variable
   - Project ID: Simpan UUID untuk filter

3. **Example Postman Pre-request Script**:
   ```javascript
   // Set Authorization header automatically
   const token = pm.environment.get("token");
   pm.request.headers.add({
     key: "Authorization",
     value: `Bearer ${token}`,
   });
   ```

---

**Last Updated**: May 2026
