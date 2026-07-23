# AquaNexus AI — FINAL FROZEN PLAN

---

## 1. Project Info

| Item | Detail |
|---|---|
| Name | AquaNexus AI |
| Type | B.Tech Final Year Project |
| Platform | Android (Mobile App) |
| Cost | $0 |
| Team | 4 Members |
| Duration | 6 Weeks |
| Modules | 5 |

---

## 2. Tech Stack

| Component | Technology | Free Tier |
|---|---|---|
| Mobile App | React Native + Expo (TypeScript) | Free builds |
| Backend | Node.js + Express (TypeScript) | Render 750 hrs/mo |
| AI Service | Python FastAPI | Render 750 hrs/mo |
| AI Engine | Google Gemini 1.5 Flash | 15 RPM, 1M tokens/day |
| Voice | Web Speech API | Free |
| Database | Supabase (PostgreSQL) | 500MB, 50K MAU |
| Auth | Supabase Auth (Phone OTP) | 50K MAU |
| Storage | Supabase Storage | 1GB |
| Maps | react-native-maps + OpenStreetMap | Free |
| Notifications | Expo Push Notifications | Free |

---

## 3. Team Roles

| Member | Role | Module | Builds |
|---|---|---|---|
| Member 1 (Lead) | Lead Developer | Foundation + AquaDoc | Project setup, navigation, UI components, auth, backend, AI service, database, AquaDoc module |
| Member 2 | Frontend Developer | AquaVoice | Voice screens, transaction screens, voice service, voice hook |
| Member 3 | Frontend Developer | AquaAdvisor | Chat screens, suggestion chips, advisor service |
| Member 4 | Frontend Developer | AquaFeed + AquaConnect | Feed screens, cooperative dashboard, both services |

---

## 4. Project Structure

```
aquanexus/
│
├── mobile/                              # React Native + Expo
│   ├── app/
│   │   ├── _layout.tsx                  # Root layout
│   │   ├── index.tsx                    # Splash screen
│   │   ├── onboarding/
│   │   │   └── index.tsx
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   ├── otp-verify.tsx
│   │   │   └── profile-setup.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── home.tsx
│   │   │   ├── aquadoc.tsx
│   │   │   ├── aquavoice.tsx
│   │   │   ├── aquaadvisor.tsx
│   │   │   ├── aquafeed.tsx
│   │   │   └── aquaconnect.tsx
│   │   └── (modals)/
│   │       ├── diagnosis-result.tsx
│   │       ├── chat.tsx
│   │       └── pond-detail.tsx
│   │
│   ├── components/
│   │   ├── ui/                          # SHARED - All use these
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── shared/                      # SHARED - Common components
│   │   │   ├── Header.tsx
│   │   │   ├── ModuleCard.tsx
│   │   │   ├── PondSelector.tsx
│   │   │   └── LanguageToggle.tsx
│   │   ├── aquadoc/                     # Member 1
│   │   │   ├── CameraCapture.tsx
│   │   │   └── DiagnosisCard.tsx
│   │   ├── aquavoice/                   # Member 2
│   │   │   ├── VoiceRecorder.tsx
│   │   │   └── TransactionList.tsx
│   │   ├── aquaadvisor/                 # Member 3
│   │   │   ├── ChatBubble.tsx
│   │   │   └── SuggestionChips.tsx
│   │   ├── aquafeed/                    # Member 4
│   │   │   ├── FeedForm.tsx
│   │   │   └── ScheduleCard.tsx
│   │   └── aquaconnect/                 # Member 4
│   │       ├── MemberCard.tsx
│   │       └── AlertBadge.tsx
│   │
│   ├── services/
│   │   ├── api.ts                       # Member 1
│   │   ├── supabase.ts                  # Member 1
│   │   ├── auth.service.ts              # Member 1
│   │   ├── aquadoc.service.ts           # Member 1
│   │   ├── aquavoice.service.ts         # Member 2
│   │   ├── aquaadvisor.service.ts       # Member 3
│   │   ├── aquafeed.service.ts          # Member 4
│   │   └── aquaconnect.service.ts       # Member 4
│   │
│   ├── store/
│   │   ├── authStore.ts                 # Member 1
│   │   ├── userStore.ts                 # Member 1
│   │   ├── pondStore.ts                 # Member 1
│   │   └── settingsStore.ts             # Member 1
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                   # Member 1
│   │   ├── useCamera.ts                 # Member 1
│   │   ├── useVoice.ts                  # Member 2
│   │   └── useLanguage.ts               # Member 1
│   │
│   ├── utils/
│   │   ├── constants.ts                 # Member 1
│   │   ├── theme.ts                     # Member 1
│   │   ├── formatters.ts                # Member 1
│   │   └── validators.ts                # Member 1
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── fonts/
│   │   └── icons/
│   │
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
│
│
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   ├── supabase.ts
│   │   │   └── cors.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── rateLimit.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── pond.routes.ts
│   │   │   ├── aquadoc.routes.ts
│   │   │   ├── aquavoice.routes.ts
│   │   │   ├── aquaadvisor.routes.ts
│   │   │   ├── aquafeed.routes.ts
│   │   │   └── aquaconnect.routes.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── pond.service.ts
│   │   │   └── ai-client.ts
│   │   ├── utils/
│   │   │   ├── apiError.ts
│   │   │   ├── response.ts
│   │   │   └── logger.ts
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
│
├── ai-service/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── disease.py
│   │   │   ├── advisor.py
│   │   │   ├── voice.py
│   │   │   ├── feed.py
│   │   │   └── connect.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── gemini_service.py
│   │   │   ├── disease_detector.py
│   │   │   ├── rag_engine.py
│   │   │   ├── voice_processor.py
│   │   │   ├── feed_calculator.py
│   │   │   └── data_aggregator.py
│   │   ├── prompts/
│   │   │   ├── disease_prompt.txt
│   │   │   ├── advisor_prompt.txt
│   │   │   ├── voice_prompt.txt
│   │   │   └── feed_prompt.txt
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── disease.py
│   │   │   ├── advisor.py
│   │   │   ├── voice.py
│   │   │   └── feed.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── image_utils.py
│   │       └── text_utils.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
│
├── database/
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_ponds.sql
│   │   ├── 003_create_disease_reports.sql
│   │   ├── 004_create_transactions.sql
│   │   ├── 005_create_chat_history.sql
│   │   ├── 006_create_feed_schedules.sql
│   │   ├── 007_create_cooperative.sql
│   │   └── 008_create_indexes.sql
│   └── seed.sql
│
│
├── docs/
│   ├── API.md
│   ├── SETUP.md
│   ├── DEPLOYMENT.md
│   └── ARCHITECTURE.md
│
│
├── .gitignore
└── README.md
```

---

## 5. Database Schema

```sql
-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('farmer','cooperative')) DEFAULT 'farmer',
    language VARCHAR(10) CHECK (language IN ('te','hi','en')) DEFAULT 'te',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILES
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    district VARCHAR(100),
    village VARCHAR(100),
    pincode VARCHAR(6),
    total_pond_area DECIMAL(10,2),
    primary_species VARCHAR(50),
    years_experience INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PONDS
CREATE TABLE ponds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    area_acres DECIMAL(6,2) NOT NULL,
    species VARCHAR(50) NOT NULL,
    stocking_density INT,
    stocking_date DATE,
    expected_harvest_date DATE,
    status VARCHAR(20) CHECK (status IN ('active','harvested','inactive')) DEFAULT 'active',
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AQUADOC
CREATE TABLE disease_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES users(id),
    pond_id UUID REFERENCES ponds(id),
    image_url TEXT,
    voice_description TEXT,
    symptoms TEXT[],
    diagnosis TEXT,
    severity VARCHAR(20) CHECK (severity IN ('low','medium','high','critical')),
    treatment TEXT,
    medicine_name VARCHAR(200),
    medicine_dosage TEXT,
    follow_up_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AQUAVEOICE
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES users(id),
    pond_id UUID REFERENCES ponds(id),
    type VARCHAR(20) CHECK (type IN ('income','expense')) NOT NULL,
    category VARCHAR(50),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    voice_text TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AQUAADVISOR
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    module VARCHAR(50) DEFAULT 'advisor',
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'te',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AQUAFEED
CREATE TABLE feed_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pond_id UUID REFERENCES ponds(id),
    feed_type VARCHAR(50),
    morning_kg DECIMAL(8,2),
    evening_kg DECIMAL(8,2),
    total_daily_kg DECIMAL(8,2),
    feed_grade VARCHAR(20),
    cumulative_cost DECIMAL(12,2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feed_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES feed_schedules(id),
    feed_date DATE NOT NULL,
    quantity_kg DECIMAL(8,2),
    cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AQUACONNECT
CREATE TABLE cooperatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    district VARCHAR(100),
    leader_id UUID REFERENCES users(id),
    member_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cooperative_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cooperative_id UUID REFERENCES cooperatives(id),
    user_id UUID REFERENCES users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cooperative_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cooperative_id UUID REFERENCES cooperatives(id),
    title VARCHAR(200),
    message TEXT,
    alert_type VARCHAR(50),
    priority VARCHAR(20) CHECK (priority IN ('low','medium','high')) DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. API Endpoints

### Auth
```
POST   /api/auth/send-otp
POST   /api/auth/verify-otp
POST   /api/auth/register
GET    /api/auth/me
```

### User
```
GET    /api/users/profile
PUT    /api/users/profile
PUT    /api/users/language
```

### Pond
```
GET    /api/ponds
POST   /api/ponds
GET    /api/ponds/:id
PUT    /api/ponds/:id
DELETE /api/ponds/:id
```

### AquaDoc
```
POST   /api/aquadoc/diagnose
GET    /api/aquadoc/history
GET    /api/aquadoc/:id
```

### AquaVoice
```
POST   /api/aquavoice/record
GET    /api/aquavoice/ledger
GET    /api/aquavoice/summary
```

### AquaAdvisor
```
POST   /api/aquaadvisor/chat
GET    /api/aquaadvisor/history
```

### AquaFeed
```
POST   /api/aquafeed/calculate
GET    /api/aquafeed/schedule
GET    /api/aquafeed/cost
```

### AquaConnect
```
GET    /api/aquaconnect/dashboard
GET    /api/aquaconnect/alerts
GET    /api/aquaconnect/members
GET    /api/aquaconnect/map
```

---

## 7. AI Service Endpoints

```
POST   /ai/disease/diagnose      → Photo + symptoms → Diagnosis
POST   /ai/advisor/chat          → Question → Expert answer
POST   /ai/voice/parse           → Voice text → Transaction
POST   /ai/feed/calculate        → Pond data → Feed schedule
POST   /ai/connect/aggregate     → Member data → Dashboard
```

---

## 8. Design System

```typescript
// mobile/utils/theme.ts
export const theme = {
  colors: {
    primary: '#0077B6',
    secondary: '#00B4D8',
    accent: '#90E0EF',
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#212529',
    textLight: '#6C757D',
    success: '#28A745',
    warning: '#FFC107',
    danger: '#DC3545',
    border: '#DEE2E6',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
};
```

### Rules for Team
1. Import from `components/ui/` only
2. Use `theme.colors`, `theme.spacing`, `theme.fontSize`
3. Never hardcode colors or spacing
4. Copy screen template structure

---

## 9. Git Workflow

```
main (production)
  └── develop (integration)
      ├── feature/foundation     (Member 1)
      ├── feature/aquadoc        (Member 1)
      ├── feature/aquavoice      (Member 2)
      ├── feature/aquaadvisor    (Member 3)
      ├── feature/aquafeed       (Member 4)
      └── feature/aquaconnect    (Member 4)
```

### Rules
1. Member 1 pushes foundation first
2. Others branch from develop
3. Weekly merge to develop (Sunday)
4. Final merge to main after testing

---

## 10. Timeline

### Week 1: Foundation (Member 1)

| Day | Task |
|---|---|
| 1 | Create Expo project |
| 2 | Navigation structure |
| 3 | Supabase + migrations |
| 4 | Backend Express setup |
| 5 | FastAPI AI service setup |
| 6 | Gemini API integration |
| 7 | Push to develop |

### Week 2: Parallel Development

| Member 1 | Member 2 | Member 3 | Member 4 |
|---|---|---|---|
| Auth screens | VoiceRecorder component | ChatBubble component | FeedForm component |
| Home dashboard | TransactionList component | SuggestionChips | ScheduleCard + MemberCard + AlertBadge |
| Pond CRUD | useVoice hook | aquaadvisor.service.ts | aquafeed.service.ts + aquaconnect.service.ts |
| AquaDoc AI endpoint | aquavoice.service.ts | AquaAdvisor AI endpoint | AquaFeed + AquaConnect AI endpoints |

### Week 3: Module Screens

| Member 1 | Member 2 | Member 3 | Member 4 |
|---|---|---|---|
| CameraCapture component | aquavoice.tsx screen | aquaadvisor.tsx screen | aquafeed.tsx screen |
| DiagnosisCard component | — | chat.tsx modal | aquaconnect.tsx screen |
| aquadoc.tsx screen | — | — | — |
| aquadoc.service.ts | — | — | — |

### Week 4: Integration

| Day | Task |
|---|---|
| 1-2 | Merge all to develop |
| 3-4 | Fix conflicts |
| 5-6 | Connect frontend to backend |
| 7 | Full testing |

### Week 5: Polish

| Task | Owner |
|---|---|
| Loading states | All |
| Error handling | All |
| Multilingual | All |
| Offline handling | Member 1 |
| Push notifications | Member 2 |

### Week 6: Deploy

| Day | Task |
|---|---|
| 1-2 | Deploy AI service |
| 3-4 | Deploy backend |
| 5-6 | Build APK |
| 7 | Final testing + docs |

---

## 11. Data Flow

```
┌─────────────────────────────────────────────┐
│              MOBILE APP                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│
│  │AquaDoc │ │AquaVoic│ │AquaAdvr│ │AquaFeed││
│  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘│
│      └──────────┼──────────┼──────────┘      │
│           ┌─────▼──────────▼─────┐           │
│           │   Service Layer      │           │
│           └──────────┬───────────┘           │
└──────────────────────┼───────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│            BACKEND (Express)                 │
│  Routes → Middleware → Controllers           │
│              │                               │
│    ┌─────────┼─────────┐                     │
│    ▼         ▼         ▼                     │
│ Supabase  AI Service  Storage                │
└──────────────────────┼───────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│          AI SERVICE (FastAPI)                │
│  Routers → Services → Gemini API             │
└─────────────────────────────────────────────┘
```

---

## 12. Free API Keys

| Service | Where | Free Limit |
|---|---|---|
| Google Gemini | aistudio.google.com | 15 RPM, 1M tokens/day |
| Supabase | supabase.com | 500MB DB, 50K MAU |
| Render | render.com | 750 hrs/month |
| Expo | expo.dev | Free builds |

---

## 13. Total Cost

| Item | Cost |
|---|---|
| All services | $0 |
| **TOTAL** | **$0** |

---

**THIS IS FINAL. NO MORE CHANGES.**
