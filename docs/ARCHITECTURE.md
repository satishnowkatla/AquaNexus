# AquaNexus System Architecture

## Overview

AquaNexus is a comprehensive aquaculture management platform that empowers fish farmers with AI-powered tools, market intelligence, financial tracking, and government scheme access. The system follows a modern microservices-ready architecture with a monolithic initial deployment for rapid development.

---

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                │
│    │  React Native │    │  Progressive │    │   Web App    │                │
│    │  Mobile App   │    │  Web App     │    │  (Admin)     │                │
│    │  (iOS/Android)│    │  (PWA)       │    │              │                │
│    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                │
│           │                   │                   │                         │
│           └───────────────────┼───────────────────┘                         │
│                               │                                             │
└───────────────────────────────┼─────────────────────────────────────────────┘
                                │ HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌──────────────────────────────────────────────────────────────────┐    │
│    │                     NGINX Load Balancer                          │    │
│    │              (SSL Termination, Rate Limiting)                    │    │
│    └──────────────────────────────┬───────────────────────────────────┘    │
│                                   │                                         │
│    ┌──────────────────────────────▼───────────────────────────────────┐    │
│    │                     Express.js API Server                        │    │
│    │           (Authentication, Validation, Routing)                  │    │
│    └──────────────────────────────┬───────────────────────────────────┘    │
│                                   │                                         │
└───────────────────────────────────┼─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │    Auth     │  │    Pond     │  │   Disease   │  │   Market    │       │
│  │   Module    │  │   Module    │  │   Module    │  │   Module    │       │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │Transaction  │  │    Chat     │  │    Feed     │  │  Insurance  │       │
│  │   Module    │  │   Module    │  │   Module    │  │   Module    │       │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐                                           │
│  │  Schemes    │  │   Voice     │                                           │
│  │   Module    │  │   Module    │                                           │
│  └─────────────┘  └─────────────┘                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
┌───────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   DATA LAYER      │ │  CACHE LAYER    │ │  STORAGE LAYER  │
├───────────────────┤ ├─────────────────┤ ├─────────────────┤
│                   │ │                 │ │                 │
│  ┌─────────────┐  │ │  ┌───────────┐  │ │  ┌───────────┐  │
│  │ PostgreSQL  │  │ │  │   Redis   │  │ │  │  AWS S3   │  │
│  │  Database   │  │ │  │  Cache    │  │ │  │  Storage  │  │
│  └─────────────┘  │ │  └───────────┘  │ │  └───────────┘  │
│                   │ │                 │ │                 │
└───────────────────┘ └─────────────────┘ └─────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Twilio    │  │   OpenAI    │  │  Disease    │  │  Market     │       │
│  │    OTP      │  │    GPT      │  │ Detection  │  │   Data     │       │
│  │   Service   │  │  Chat API   │  │   ML API   │  │   API      │       │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                         │
│  │  Government │  │   Weather   │  │   Payment   │                         │
│  │   Schemes   │  │    API      │  │   Gateway   │                         │
│  │     API     │  │             │  │   (Future)  │                         │
│  └─────────────┘  └─────────────┘  └─────────────┘                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Descriptions

### Client Layer

| Component | Technology | Description |
|-----------|------------|-------------|
| Mobile App | React Native | Cross-platform mobile app for iOS and Android with offline support |
| PWA | React + Workbox | Progressive Web App for low-bandwidth areas with service workers |
| Admin Web | React | Internal administration dashboard for system management |

### API Gateway Layer

| Component | Technology | Description |
|-----------|------------|-------------|
| Load Balancer | NGINX | SSL termination, static file serving, request routing, rate limiting |
| API Server | Express.js | REST API with JWT authentication, input validation, error handling |

### Application Modules

```
┌─────────────────────────────────────────────────────────────────┐
│                     MODULE STRUCTURE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  module-name/                                                   │
│  ├── module.controller.js    # Request/Response handling       │
│  ├── module.service.js       # Business logic                  │
│  ├── module.model.js         # Database queries                │
│  ├── module.routes.js        # Route definitions               │
│  ├── module.middleware.js     # Custom middleware               │
│  ├── module.validator.js     # Input validation schemas        │
│  ├── module.test.js          # Unit tests                      │
│  └── module.integration.js   # Integration tests               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 1. Auth Module
```
┌─────────────────────────────────────────────────────────┐
│                    AUTH MODULE                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Phone Input ──▶ OTP Generation ──▶ SMS via Twilio     │
│       │                                    │            │
│       ▼                                    ▼            │
│  OTP Verification ◀───────────────── OTP Delivery      │
│       │                                                 │
│       ▼                                                 │
│  JWT Token Generation ──▶ Session Creation             │
│       │                                                 │
│       ▼                                                 │
│  User Profile (First time? Create new user)            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Responsibilities:**
- Phone number validation and OTP generation
- OTP delivery via Twilio SMS
- JWT token generation and validation
- User session management
- Language preference handling

#### 2. Pond Module
```
┌─────────────────────────────────────────────────────────┐
│                     POND MODULE                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CRUD Operations:                                       │
│  ├── Create Pond (with validation)                     │
│  ├── Read Pond (with computed metrics)                 │
│  ├── Update Pond (partial updates)                     │
│  └── Delete Pond (cascade cleanup)                     │
│                                                         │
│  Computed Properties:                                   │
│  ├── Days since stocking                                │
│  ├── Estimated biomass                                  │
│  ├── Growth rate                                        │
│  └── Health status summary                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Responsibilities:**
- Pond CRUD operations
- Biomass calculations
- Growth tracking
- Link to disease reports, feed schedules, insurance

#### 3. Disease Detection Module
```
┌─────────────────────────────────────────────────────────┐
│                 DISEASE DETECTION MODULE                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Image Upload ──▶ Pre-processing ──▶ ML API Call       │
│       │              (Resize,           │               │
│       │              Normalize)         ▼               │
│       │                          Disease Analysis      │
│       │                               │                │
│       ▼                               ▼                │
│  Store Image ──▶ Save Report ──▶ Treatment Plan        │
│  in S3             in DB            Generation         │
│                                                         │
│  ML Pipeline:                                           │
│  ├── Image Classification (CNN Model)                  │
│  ├── Confidence Scoring                                │
│  ├── Disease Database Lookup                            │
│  └── Treatment Recommendation Engine                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Responsibilities:**
- Image upload and storage (S3)
- Integration with ML disease detection API
- Diagnosis storage and history
- Treatment recommendation generation

#### 4. Market Intelligence Module
```
┌─────────────────────────────────────────────────────────┐
│                 MARKET MODULE                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Data Sources:                                          │
│  ├── External Market APIs                               │
│  ├── Government Market Data                             │
│  └── User-submitted prices                              │
│                                                         │
│  Features:                                              │
│  ├── Real-time price listings                           │
│  ├── Price trend analysis                               │
│  ├── District/State filtering                           │
│  ├── Best price recommendations                         │
│  └── Market alerts (price changes)                      │
│                                                         │
│  Analytics:                                             │
│  ├── Historical price charts                            │
│  ├── Price forecasting (ML)                             │
│  └── Supply/demand indicators                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Responsibilities:**
- Market price aggregation
- Price trend analysis
- Location-based filtering
- Price alerts and notifications

#### 5. Transaction Module
```
┌─────────────────────────────────────────────────────────┐
│                TRANSACTION MODULE                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Input Methods:                                         │
│  ├── Manual entry                                      │
│  ├── Voice input (Telugu/English)                       │
│  ├── Receipt scanning (OCR) - Future                    │
│  └── Bulk import                                        │
│                                                         │
│  Categories:                                            │
│  ├── Income: sales, subsidies, other                    │
│  └── Expense: feed, medicine, labor, equipment, other   │
│                                                         │
│  Analytics:                                             │
│  ├── Daily/Weekly/Monthly summaries                     │
│  ├── Category breakdown                                 │
│  ├── Profit/Loss statements                             │
│  └── YoY comparisons                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Responsibilities:**
- Financial transaction CRUD
- Voice-to-text transcription (Telugu)
- Financial reporting and analytics
- Budget tracking

#### 6. Chat/AI Assistant Module
```
┌─────────────────────────────────────────────────────────┐
│                 CHAT MODULE                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  User Message ──▶ Language Detection ──▶ Context Build  │
│       │              (te/en)               │            │
│       │                                    ▼            │
│       │                          ┌─────────────────┐   │
│       │                          │  System Prompt   │   │
│       │                          │  + User Context  │   │
│       │                          │  + Knowledge     │   │
│       │                          └────────┬────────┘   │
│       │                                   │            │
│       │                                   ▼            │
│       │                          ┌─────────────────┐   │
│       │                          │   OpenAI API    │   │
│       │                          │   (GPT-4)       │   │
│       │                          └────────┬────────┘   │
│       │                                   │            │
│       └──────────────────────────────────▶│            │
│                                           ▼            │
│  Response ──▶ Translation ──▶ Store ──▶ Deliver       │
│              (if needed)      History     to User      │
│                                                         │
│  Knowledge Base:                                        │
│  ├── Fish farming best practices                        │
│  ├── Disease information database                       │
│  ├── Feed charts and schedules                          │
│  ├── Government scheme details                          │
│  └── User's own farm data                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Responsibilities:**
- Multi-turn conversation management
- Telugu/English language support
- Context-aware responses
- Integration with user's farm data
- Knowledge base retrieval (RAG)

---

## Data Flow Diagrams

### 1. User Authentication Flow

```
┌────────┐          ┌────────┐          ┌────────┐          ┌────────┐
│ Mobile │          │  API   │          │ Redis  │          │ Twilio │
│  App   │          │ Server │          │ Cache  │          │  SMS   │
└───┬────┘          └───┬────┘          └───┬────┘          └───┬────┘
    │                   │                   │                   │
    │  1. Request OTP   │                   │                   │
    │  (phone number)   │                   │                   │
    │──────────────────▶│                   │                   │
    │                   │                   │                   │
    │                   │  2. Generate OTP  │                   │
    │                   │  Store in Redis   │                   │
    │                   │──────────────────▶│                   │
    │                   │                   │                   │
    │                   │  3. Send OTP      │                   │
    │                   │──────────────────────────────────────▶│
    │                   │                   │                   │
    │  4. OTP Sent      │                   │                   │
    │◀──────────────────│                   │                   │
    │                   │                   │                   │
    │  5. Verify OTP    │                   │                   │
    │──────────────────▶│                   │                   │
    │                   │                   │                   │
    │                   │  6. Validate OTP  │                   │
    │                   │──────────────────▶│                   │
    │                   │                   │                   │
    │                   │  7. OTP Valid     │                   │
    │                   │◀──────────────────│                   │
    │                   │                   │                   │
    │                   │  8. Generate JWT  │                   │
    │                   │  Create/Find User │                   │
    │                   │                   │                   │
    │  9. Return Token  │                   │                   │
    │  + User Profile   │                   │                   │
    │◀──────────────────│                   │                   │
    │                   │                   │                   │
```

### 2. Disease Detection Flow

```
┌────────┐          ┌────────┐          ┌────────┐          ┌────────┐
│ Mobile │          │  API   │          │   ML   │          │  AWS   │
│  App   │          │ Server │          │ Service│          │   S3   │
└───┬────┘          └───┬────┘          └───┬────┘          └───┬────┘
    │                   │                   │                   │
    │  1. Upload Image  │                   │                   │
    │  + Pond ID        │                   │                   │
    │──────────────────▶│                   │                   │
    │                   │                   │                   │
    │                   │  2. Upload to S3  │                   │
    │                   │──────────────────────────────────────▶│
    │                   │                   │                   │
    │                   │  3. Get S3 URL    │                   │
    │                   │◀──────────────────────────────────────│
    │                   │                   │                   │
    │                   │  4. Send to ML    │                   │
    │                   │  (image URL)      │                   │
    │                   │──────────────────▶│                   │
    │                   │                   │                   │
    │                   │                   │  5. Analyze       │
    │                   │                   │  Image (CNN)      │
    │                   │                   │                   │
    │                   │  6. Return        │                   │
    │                   │  Diagnosis        │                   │
    │                   │◀──────────────────│                   │
    │                   │                   │                   │
    │                   │  7. Save Report   │                   │
    │                   │  to Database      │                   │
    │                   │                   │                   │
    │  8. Return        │                   │                   │
    │  Report           │                   │                   │
    │◀──────────────────│                   │                   │
    │                   │                   │                   │
```

### 3. Transaction Voice Input Flow

```
┌────────┐          ┌────────┐          ┌────────┐          ┌────────┐
│ Mobile │          │  API   │          │ Speech │          │  NLP   │
│  App   │          │ Server │          │  API   │          │ Engine │
└───┬────┘          └───┬────┘          └───┬────┘          └───┬────┘
    │                   │                   │                   │
    │  1. Record Audio  │                   │                   │
    │  (Telugu/English) │                   │                   │
    │──────────────────▶│                   │                   │
    │                   │                   │                   │
    │                   │  2. Send Audio    │                   │
    │                   │  (base64)         │                   │
    │                   │──────────────────▶│                   │
    │                   │                   │                   │
    │                   │  3. Transcribe    │                   │
    │                   │◀──────────────────│                   │
    │                   │                   │                   │
    │                   │  4. Parse Amount  │                   │
    │                   │  Category, Type   │                   │
    │                   │──────────────────────────────────────▶│
    │                   │                   │                   │
    │                   │  5. Structured    │                   │
    │                   │  Transaction Data │                   │
    │                   │◀──────────────────────────────────────│
    │                   │                   │                   │
    │                   │  6. Save          │                   │
    │                   │  Transaction      │                   │
    │                   │                   │                   │
    │  7. Return        │                   │                   │
    │  Transaction      │                   │                   │
    │◀──────────────────│                   │                   │
    │                   │                   │                   │
```

---

## Database Schema (Entity Relationship)

```
┌─────────────────────┐         ┌─────────────────────┐
│       users          │         │      ponds           │
├─────────────────────┤         ├─────────────────────┤
│ id (PK, UUID)       │────┐    │ id (PK, UUID)       │
│ phone (UNIQUE)      │    │    │ user_id (FK)        │◀──┐
│ name                │    │    │ name                │   │
│ email (UNIQUE)      │    ├───▶│ area_acres          │   │
│ language            │    │    │ fish_species        │   │
│ avatar_url          │    │    │ stocking_date       │   │
│ created_at          │    │    │ fish_count          │   │
│ updated_at          │    │    │ pond_type           │   │
└─────────────────────┘    │    │ created_at          │   │
        │                  │    └─────────────────────┘   │
        │                  │             │                │
        │                  │             │                │
        │                  │    ┌────────┴────────────────┘
        │                  │    │
        │    ┌─────────────┼────┴────────────────────────────────┐
        │    │             │                                      │
        │    │    ┌────────▼─────────┐    ┌─────────────────────┐│
        │    │    │ disease_reports  │    │   feed_schedules    ││
        │    │    ├─────────────────┤    ├─────────────────────┤│
        │    │    │ id (PK, UUID)   │    │ id (PK, UUID)       ││
        │    ├───▶│ user_id (FK)    │    │ pond_id (FK)        ││◀─┘
        │    │    │ pond_id (FK)    │◀───│ feed_type           ││
        │    │    │ image_url       │    │ quantity_kg         ││
        │    │    │ diagnosis       │    │ frequency           ││
        │    │    │ confidence      │    │ start_date          ││
        │    │    │ treatment       │    │ end_date            ││
        │    │    │ created_at      │    │ created_at          ││
        │    │    └─────────────────┘    └─────────────────────┘│
        │    │                                                  │
        │    │    ┌─────────────────┐    ┌─────────────────────┐│
        │    │    │ transactions    │    │    insurance        ││
        │    │    ├─────────────────┤    ├─────────────────────┤│
        │    │    │ id (PK, UUID)   │    │ id (PK, UUID)       ││
        │    ├───▶│ user_id (FK)    │    │ user_id (FK)        │◀┘
        │    │    │ type            │    │ pond_id (FK)        │
        │    │    │ amount          │    │ provider            │
        │    │    │ category        │    │ policy_type         │
        │    │    │ description     │    │ premium             │
        │    │    │ voice_text      │    │ coverage_amount     │
        │    │    │ created_at      │    │ start_date          │
        │    │    └─────────────────┘    │ end_date            │
        │    │                           │ status              │
        │    │    ┌─────────────────┐    │ created_at          │
        │    │    │  chat_history   │    └─────────────────────┘
        │    │    ├─────────────────┤
        │    └───▶│ id (PK, UUID)   │
        │         │ user_id (FK)    │    ┌─────────────────────┐
        │         │ session_id      │    │  market_listings    │
        │         │ role            │    ├─────────────────────┤
        │         │ message         │    │ id (PK, UUID)       │
        │         │ created_at      │    │ species             │
        │         └─────────────────┘    │ price_per_kg        │
        │                                │ market_name         │
        │    ┌─────────────────────┐    │ district            │
        └───▶│ government_schemes  │    │ state               │
             ├─────────────────────┤    │ listed_at           │
             │ id (PK, UUID)       │    │ expires_at          │
             │ name                │    └─────────────────────┘
             │ description         │
             │ eligibility_criteria│
             │ (JSONB)             │
             │ benefit_amount      │
             │ application_url     │
             │ state               │
             │ active              │
             └─────────────────────┘
```

---

## Technology Stack

### Frontend

| Layer | Technology | Purpose |
|-------|------------|---------|
| Mobile | React Native 0.73+ | Cross-platform mobile app |
| State | React Query | Server state management |
| UI | NativeBase / React Native Paper | UI component library |
| Forms | React Hook Form | Form management |
| i18n | react-i18next | Internationalization (EN/TE) |
| Storage | AsyncStorage / MMKV | Offline data persistence |
| Voice | react-native-voice | Speech recognition |

### Backend

| Layer | Technology | Purpose |
|-------|------------|---------|
| Runtime | Node.js 20.x | JavaScript runtime |
| Framework | Express.js 4.x | HTTP server |
| ORM | Prisma / Knex.js | Database queries |
| Validation | Joi / Zod | Input validation |
| Auth | jsonwebtoken | JWT authentication |
| Logger | Winston | Application logging |
| Test | Jest + Supertest | Unit & integration tests |

### Database & Cache

| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 15.x | Primary database |
| Redis | 7.x | Caching, sessions, OTP storage |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| NGINX | Reverse proxy, load balancer |
| AWS/GCP | Cloud hosting |
| GitHub Actions | CI/CD pipeline |

### External Services

| Service | Provider | Purpose |
|---------|----------|---------|
| SMS/OTP | Twilio | Phone verification |
| AI Chat | OpenAI GPT-4 | Conversational AI assistant |
| Image Storage | AWS S3 | Disease images, avatars |
| Disease Detection | Custom ML API | Fish disease identification |
| Market Data | AgriMarket API | Fish prices and trends |

---

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: Transport Security                                │
│  ├── TLS 1.3 encryption                                    │
│  ├── HSTS headers                                           │
│  └── Certificate management                                 │
│                                                             │
│  Layer 2: API Gateway                                       │
│  ├── Rate limiting (per IP, per user)                       │
│  ├── Request size limits                                    │
│  ├── CORS policy                                            │
│  └── IP whitelisting (admin endpoints)                      │
│                                                             │
│  Layer 3: Authentication                                    │
│  ├── Phone-based OTP (primary)                              │
│  ├── JWT tokens (short-lived: 7 days)                       │
│  ├── Token refresh mechanism                                │
│  └── Session management via Redis                           │
│                                                             │
│  Layer 4: Authorization                                     │
│  ├── User can only access own data                          │
│  ├── Role-based access (future: admin, user)                │
│  └── Resource-level permissions                             │
│                                                             │
│  Layer 5: Data Protection                                   │
│  ├── Input sanitization                                     │
│  ├── SQL injection prevention (parameterized queries)       │
│  ├── XSS protection                                         │
│  └── Data encryption at rest                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Security

- **At Rest:** AES-256 encryption for database, S3 server-side encryption
- **In Transit:** TLS 1.3 for all communications
- **Secrets:** Environment variables, never hardcoded
- **PII:** Phone numbers masked in logs, minimal data collection
- **Backups:** Encrypted with separate key

---

## Scalability Considerations

### Horizontal Scaling

```
                    ┌─────────────┐
                    │    Load     │
                    │  Balancer   │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
     ┌──────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
     │   API #1    │ │  API #2  │ │   API #3   │
     └──────┬──────┘ └────┬─────┘ └─────┬──────┘
            │              │              │
            └──────────────┼──────────────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL │
                    │  (Primary)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL │
                    │  (Replica)  │
                    └─────────────┘
```

### Caching Strategy

| Data Type | Cache TTL | Strategy |
|-----------|-----------|----------|
| User Profile | 1 hour | Write-through |
| Market Prices | 5 minutes | Refresh-ahead |
| Pond Details | 30 minutes | Cache-aside |
| Disease Reports | No cache | Direct DB |
| Chat History | No cache | Direct DB |
| Schemes | 24 hours | Cache-aside |

### Performance Targets

| Metric | Target |
|--------|--------|
| API Response Time | < 200ms (p95) |
| Database Query Time | < 50ms (p95) |
| Image Upload | < 5 seconds |
| Disease Detection | < 10 seconds |
| Chat Response | < 3 seconds |
| Uptime | 99.9% |

---

## Deployment Environments

| Environment | Purpose | Infrastructure |
|-------------|---------|----------------|
| Development | Local development | Docker Compose |
| Staging | Pre-production testing | Cloud (small instances) |
| Production | Live system | Cloud (auto-scaling) |

---

## Future Architecture Enhancements

### Phase 2

- [ ] Microservices decomposition (Auth, AI, Market)
- [ ] Message queue (RabbitMQ/Kafka) for async processing
- [ ] GraphQL API layer
- [ ] Real-time WebSocket connections
- [ ] Elasticsearch for market data search

### Phase 3

- [ ] Kubernetes deployment
- [ ] Service mesh (Istio)
- [ ] Multi-region deployment
- [ ] Advanced ML pipeline (training + inference)
- [ ] IoT integration (pond sensors)
- [ ] Blockchain for supply chain tracking
