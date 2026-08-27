# Nyaya Setu — REST API Reference

Base URL: `http://localhost:5000/api`

All mutating endpoints and authenticated endpoints require a Bearer token in the `Authorization` header:
`Authorization: Bearer <JWT_ACCESS_TOKEN>`

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/signup`
Register a new user account (Citizen, Lawyer, Law Student, Organization, Admin).

**Request Body:**
```json
{
  "email": "aarav.sharma@example.com",
  "password": "SecurePassword123!",
  "role": "CITIZEN",
  "phone": "+919876543210",
  "profileData": {
    "fullName": "Aarav Sharma",
    "location": {
      "city": "Delhi",
      "state": "Delhi"
    }
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "66ce78a1f9a...",
      "email": "aarav.sharma@example.com",
      "role": "CITIZEN",
      "phone": "+919876543210",
      "isVerified": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
}
```

---

### `POST /api/auth/login`
Authenticate with email and password.

**Request Body:**
```json
{
  "email": "aarav.sharma@example.com",
  "password": "SecurePassword123!"
}
```

---

### `POST /api/auth/refresh`
Refresh expired access token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

---

### `GET /api/auth/me`
Retrieve currently authenticated user and profile.

---

## 2. Cases (`/api/cases`)

### `POST /api/cases`
File a new structured case.

**Request Body:**
```json
{
  "title": "Unpaid Salary Dispute",
  "category": "Employment",
  "issue": "Employer withheld 3 months salary",
  "description": "Joined in Jan 2023. November, December, and January salary not released.",
  "location": {
    "city": "Delhi",
    "state": "Delhi"
  },
  "urgency": "HIGH",
  "parties": {
    "plaintiff": { "name": "Aarav Sharma" },
    "defendant": { "name": "Tech Corp Pvt Ltd", "designation": "Director" }
  },
  "financialDetails": {
    "disputedAmount": 150000,
    "currency": "INR"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Case registered successfully",
  "data": {
    "_id": "66ce8120fa1...",
    "caseNumber": "NYA-20260827-4821",
    "category": "Employment",
    "issue": "Employer withheld 3 months salary",
    "status": "OPEN",
    "urgency": "HIGH"
  }
}
```

---

### `GET /api/cases`
List cases. Citizens see only their own cases. Lawyers see available and assigned cases. Admins see all cases.
Query params: `category`, `status`, `urgency`, `city`, `page`, `limit`.

---

### `GET /api/cases/:id`
Get full case details including timeline events, documents, and evidence (Cached via Redis).

---

### `PATCH /api/cases/:id`
Update case fields or status.

---

### `PATCH /api/cases/:id/assign-lawyer`
Assign advocate to case.
```json
{
  "lawyerId": "66ce78a1f9a..."
}
```

---

## 3. Case Timeline (`/api/cases/:id/events` & `/api/cases/:id/timeline`)

### `POST /api/cases/:id/events`
Add a structured chronological milestone to the case.

**Request Body:**
```json
{
  "eventType": "LEGAL_NOTICE_SENT",
  "title": "Legal Notice Dispatched",
  "dateTime": "2024-01-10T10:00:00Z",
  "description": "15-day statutory notice sent via registered speed post to employer.",
  "source": "LAWYER"
}
```

---

### `GET /api/cases/:id/timeline`
Retrieve all timeline events sorted chronologically.

---

## 4. Documents & Background Queue (`/api/documents`)

### `POST /api/documents`
Register document metadata and push processing job to Redis queue.

**Request Body:**
```json
{
  "caseId": "66ce8120fa1...",
  "title": "Appointment Letter & Contract",
  "documentType": "EMPLOYMENT_CONTRACT",
  "fileUrl": "https://storage.nyayasetu.in/contracts/contract_01.pdf",
  "fileSize": 1048576,
  "mimeType": "application/pdf"
}
```

---

## 5. Lawyer Directory (`/api/lawyers`)

### `GET /api/lawyers`
Search verified advocates and law students.
Query params: `practiceArea`, `city`, `state`, `minExperience`, `verifiedOnly`.

---

## 6. Verification (`/api/verification`)

### `POST /api/verification/request`
Submit Bar Council enrollment details for verification.

### `GET /api/verification/requests` (Admin)
List pending verifications.

### `PATCH /api/verification/requests/:id` (Admin)
Approve or reject verification:
```json
{
  "status": "VERIFIED",
  "reviewNotes": "Bar Council enrollment verified on state roll."
}
```

---

## 7. System Health (`/api/health`)

### `GET /api/health`
Checks database (MongoDB, Redis) and server connectivity.
