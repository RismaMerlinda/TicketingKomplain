# API Documentation - Ticketing Complaint System

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### 1. Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "admin@superadmin.co.id",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "email": "admin@superadmin.co.id",
    "name": "Super Admin",
    "role": "SUPER_ADMIN",
    "productId": null,
    "avatar": "https://ui-avatars.com/api/?name=Super+Admin&background=6366f1&color=fff"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Email atau password salah"
}
```

### 2. Get Current User
**Endpoint:** `GET /auth/me?userId={userId}`

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "email": "admin@superadmin.co.id",
    "name": "Super Admin",
    "role": "SUPER_ADMIN",
    "productId": null,
    "avatar": "https://ui-avatars.com/api/?name=Super+Admin&background=6366f1&color=fff"
  }
}
```

## Test Users

| Email | Password | Role |
|-------|----------|------|
| admin@superadmin.co.id | password123 | SUPER_ADMIN |
| jokiinformatika@gmail.com | joki123 | PRODUCT_ADMIN |
| orbitbilliard.id@gmail.com | orbit123 | PRODUCT_ADMIN |
| hi@catatmak.com | catatmak123 | PRODUCT_ADMIN |

## Testing with PowerShell

### Test Login
```powershell
$body = @{email='admin@superadmin.co.id';password='password123'} | ConvertTo-Json
(Invoke-WebRequest -Uri http://localhost:5000/api/auth/login -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing).Content
```

### Test with wrong password
```powershell
$body = @{email='admin@superadmin.co.id';password='wrongpassword'} | ConvertTo-Json
(Invoke-WebRequest -Uri http://localhost:5000/api/auth/login -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing).Content
```

## MongoDB Connection
```
mongodb://127.0.0.1:27017/ticketingkomplain
```

## Notes
- Password saat ini disimpan dalam plain text (untuk development)
- Untuk production, gunakan bcrypt untuk hash password
- Tambahkan JWT token untuk session management
