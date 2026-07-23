# AquaNexus AI — API Documentation

---

## Base URLs

- **Backend API**: `https://aquanexus-backend.onrender.com/api`
- **AI Service**: `https://aquanexus-ai.onrender.com/ai`

---

## Auth Routes

### Send OTP
```
POST /api/auth/send-otp
```
**Body:**
```json
{
  "phone": "+919876543210"
}
```
**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### Verify OTP
```
POST /api/auth/verify-otp
```
**Body:**
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "phone": "+919876543210",
      "full_name": "John Doe"
    }
  }
}
```

### Register
```
POST /api/auth/register
```
**Body:**
```json
{
  "phone": "+919876543210",
  "full_name": "John Doe",
  "district": "West Godavari",
  "village": "Narsapur",
  "primary_species": "shrimp"
}
```

### Get Current User
```
GET /api/auth/me
```
**Headers:** `Authorization: Bearer <token>`

---

## User Routes

### Get Profile
```
GET /api/users/profile
```

### Update Profile
```
PUT /api/users/profile
```
**Body:**
```json
{
  "district": "West Godavari",
  "village": "Narsapur",
  "total_pond_area": 2.5,
  "primary_species": "shrimp",
  "years_experience": 5
}
```

### Switch Language
```
PUT /api/users/language
```
**Body:**
```json
{
  "language": "te"
}
```

---

## Pond Routes

### List Ponds
```
GET /api/ponds
```

### Create Pond
```
POST /api/ponds
```
**Body:**
```json
{
  "name": "Pond 1",
  "area_acres": 1.5,
  "species": "shrimp",
  "stocking_density": 50000,
  "stocking_date": "2026-01-15",
  "expected_harvest_date": "2026-06-15"
}
```

### Get Pond
```
GET /api/ponds/:id
```

### Update Pond
```
PUT /api/ponds/:id
```

### Delete Pond
```
DELETE /api/ponds/:id
```

---

## AquaDoc Routes (Disease Diagnosis)

### Diagnose Disease
```
POST /api/aquadoc/diagnose
```
**Body (multipart/form-data):**
- `image`: File (fish/shrimp photo)
- `pondId`: UUID
- `voiceDescription`: String (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "diagnosis": "White Spot Syndrome",
    "severity": "high",
    "treatment": "Add salt 3g/L, improve water quality...",
    "medicine_name": "Formalin",
    "medicine_dosage": "25ppm for 1 hour",
    "follow_up_date": "2026-07-28"
  }
}
```

### Get History
```
GET /api/aquadoc/history
```

### Get Specific Diagnosis
```
GET /api/aquadoc/:id
```

---

## AquaVoice Routes (Voice Accounting)

### Record Transaction
```
POST /api/aquavoice/record
```
**Body:**
```json
{
  "pondId": "uuid",
  "text": "Bought 10 bags of feed for 5000 rupees"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "expense",
    "category": "feed",
    "amount": 5000,
    "description": "10 bags of feed"
  }
}
```

### Get Ledger
```
GET /api/aquavoice/ledger?pondId=uuid
```

### Get Summary
```
GET /api/aquavoice/summary?pondId=uuid
```

---

## AquaAdvisor Routes (AI Chatbot)

### Send Message
```
POST /api/aquaadvisor/chat
```
**Body:**
```json
{
  "message": "My shrimp are showing white spots, what should I do?",
  "language": "te"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "response": "White spots on shrimp indicate White Spot Syndrome...",
    "suggestions": [
      "Check water quality immediately",
      "Isolate affected pond",
      "Add salt to water"
    ]
  }
}
```

### Get Chat History
```
GET /api/aquaadvisor/history
```

---

## AquaFeed Routes (Feed Optimizer)

### Calculate Feed Schedule
```
POST /api/aquafeed/calculate
```
**Body:**
```json
{
  "pondId": "uuid",
  "species": "shrimp",
  "area_acres": 1.5,
  "stocking_density": 50000,
  "stocking_days": 45
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "morning_kg": 12.5,
    "evening_kg": 12.5,
    "total_daily_kg": 25,
    "feed_type": "Sinking pellets",
    "feed_grade": "32% protein",
    "daily_cost": 1750
  }
}
```

### Get Current Schedule
```
GET /api/aquafeed/schedule?pondId=uuid
```

### Get Cost Tracker
```
GET /api/aquafeed/cost?pondId=uuid
```

---

## AquaConnect Routes (Cooperative)

### Get Dashboard
```
GET /api/aquaconnect/dashboard
```

### Get Alerts
```
GET /api/aquaconnect/alerts
```

### Get Members
```
GET /api/aquaconnect/members
```

### Get Map Data
```
GET /api/aquaconnect/map
```

---

## AI Service Endpoints

### Disease Diagnosis
```
POST /ai/disease/diagnose
```
**Body:**
```json
{
  "image_base64": "base64_encoded_image",
  "symptoms": ["white spots", "lethargy"],
  "species": "shrimp",
  "language": "te"
}
```

### Advisor Chat
```
POST /ai/advisor/chat
```
**Body:**
```json
{
  "message": "How to improve water quality?",
  "language": "te",
  "context": {
    "species": "shrimp",
    "pond_area": 1.5
  }
}
```

### Voice Parse
```
POST /ai/voice/parse
```
**Body:**
```json
{
  "text": "Bought 10 bags of feed for 5000 rupees",
  "language": "te"
}
```

### Feed Calculate
```
POST /ai/feed/calculate
```
**Body:**
```json
{
  "species": "shrimp",
  "area_acres": 1.5,
  "stocking_density": 50000,
  "stocking_days": 45
}
```

### Connect Aggregate
```
POST /ai/connect/aggregate
```
**Body:**
```json
{
  "cooperative_id": "uuid"
}
```

---

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid phone number format"
  }
}
```

## Success Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```
