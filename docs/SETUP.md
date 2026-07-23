# AquaNexus AI — Team Setup Guide

---

## Prerequisites

Each team member needs:

1. **Node.js** (v18+) - https://nodejs.org
2. **npm** or **yarn** - Comes with Node.js
3. **Git** - https://git-scm.com
4. **VS Code** - https://code.visualstudio.com
5. **Expo Go app** on your phone - Download from Play Store

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/aquanexus.git
cd aquanexus
```

---

## Step 2: Install Dependencies

### Mobile App
```bash
cd mobile
npm install
```

### Backend
```bash
cd backend
npm install
```

### AI Service
```bash
cd ai-service
pip install -r requirements.txt
```

---

## Step 3: Environment Variables

### Backend (.env)
```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
AI_SERVICE_URL=https://aquanexus-ai.onrender.com
JWT_SECRET=your-jwt-secret
```

### AI Service (.env)
```env
GOOGLE_GEMINI_API_KEY=your-gemini-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

### Mobile App
Update `mobile/utils/constants.ts`:
```typescript
export const API_URL = 'http://localhost:3000'; // or your deployed URL
export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = 'your-anon-key';
```

---

## Step 4: Start Development

### Mobile App
```bash
cd mobile
npx expo start
```
Scan QR code with Expo Go app.

### Backend
```bash
cd backend
npm run dev
```

### AI Service
```bash
cd ai-service
uvicorn app.main:app --reload
```

---

## Step 5: Git Workflow

### Branch Naming
```
feature/foundation     (Member 1)
feature/aquadoc        (Member 1)
feature/aquavoice      (Member 2)
feature/aquaadvisor    (Member 3)
feature/aquafeed       (Member 4)
feature/aquaconnect    (Member 4)
```

### Daily Workflow
```bash
# Start your day
git checkout develop
git pull origin develop
git checkout feature/your-module

# Work on your code...

# End your day
git add .
git commit -m "feat: add voice recorder component"
git push origin feature/your-module
```

### Weekly Merge (Sunday)
```bash
# Create PR to develop
# After review, merge to develop
```

---

## Step 6: File Ownership

### Member 1 (Lead) - Creates These First
```
mobile/app/_layout.tsx
mobile/app/index.tsx
mobile/app/onboarding/index.tsx
mobile/app/auth/login.tsx
mobile/app/auth/otp-verify.tsx
mobile/app/auth/profile-setup.tsx
mobile/app/(tabs)/_layout.tsx
mobile/app/(tabs)/home.tsx
mobile/components/ui/* (all 7)
mobile/components/shared/* (all 4)
mobile/services/api.ts
mobile/services/supabase.ts
mobile/services/auth.service.ts
mobile/store/* (all 4)
mobile/hooks/useAuth.ts
mobile/hooks/useCamera.ts
mobile/hooks/useLanguage.ts
mobile/utils/* (all 4)
```

### Member 2 - Creates These
```
mobile/components/aquavoice/VoiceRecorder.tsx
mobile/components/aquavoice/TransactionList.tsx
mobile/app/(tabs)/aquavoice.tsx
mobile/services/aquavoice.service.ts
mobile/hooks/useVoice.ts
```

### Member 3 - Creates These
```
mobile/components/aquaadvisor/ChatBubble.tsx
mobile/components/aquaadvisor/SuggestionChips.tsx
mobile/app/(tabs)/aquaadvisor.tsx
mobile/app/(modals)/chat.tsx
mobile/services/aquaadvisor.service.ts
```

### Member 4 - Creates These
```
mobile/components/aquafeed/FeedForm.tsx
mobile/components/aquafeed/ScheduleCard.tsx
mobile/components/aquaconnect/MemberCard.tsx
mobile/components/aquaconnect/AlertBadge.tsx
mobile/app/(tabs)/aquafeed.tsx
mobile/app/(tabs)/aquaconnect.tsx
mobile/services/aquafeed.service.ts
mobile/services/aquaconnect.service.ts
```

---

## Step 7: Design Rules

### Import Components
```typescript
// CORRECT
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { theme } from '../../utils/theme';

// WRONG - Don't create your own
import { MyButton } from './MyButton';
```

### Use Theme
```typescript
// CORRECT
<View style={{ backgroundColor: theme.colors.background, padding: theme.spacing.md }}>

// WRONG - Never hardcode
<View style={{ backgroundColor: '#F8F9FA', padding: 16 }}>
```

### Screen Template
```typescript
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Header } from '../../components/shared/Header';
import { Card } from '../../components/ui/Card';
import { theme } from '../../utils/theme';

export default function MyModuleScreen() {
  return (
    <View style={styles.container}>
      <Header title="My Module" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          {/* Your content here */}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md },
});
```

---

## Step 8: API Calls

### Service Template
```typescript
// mobile/services/mymodule.service.ts
import { api } from './api';

export const mymoduleService = {
  getData: async (id: string) => {
    const response = await api.get(`/mymodule/${id}`);
    return response.data;
  },

  postData: async (data: any) => {
    const response = await api.post('/mymodule', data);
    return response.data;
  },
};
```

---

## Step 9: Testing

### Test on Phone
1. Start Expo: `npx expo start`
2. Open Expo Go app
3. Scan QR code
4. Test your module

### Test API
Use Postman or curl:
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```

---

## Step 10: Common Issues

### Issue: "Cannot find module"
**Solution:**
```bash
cd mobile
npm install
npx expo start --clear
```

### Issue: "API connection failed"
**Solution:** Check `mobile/utils/constants.ts` has correct URL

### Issue: "Merge conflicts"
**Solution:**
```bash
git checkout develop
git pull origin develop
git checkout feature/your-module
git merge develop
# Fix conflicts in VS Code
```

---

## Contact

- **Member 1 (Lead)**: Your Name - your@email.com
- **Member 2**: Name - email
- **Member 3**: Name - email
- **Member 4**: Name - email

---

**Remember: Weekly merge every Sunday!**
