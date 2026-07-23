# AquaNexus AI

An AI-powered aquaculture management platform for Indian shrimp/fish farmers.

## Features

- **AquaDoc** - AI disease diagnosis from photos
- **AquaVoice** - Voice-based accounting
- **AquaAdvisor** - AI chatbot for farming advice
- **AquaFeed** - Optimized feed scheduling
- **AquaConnect** - Cooperative management

## Tech Stack

- **Mobile**: React Native + Expo (TypeScript)
- **Backend**: Node.js + Express (TypeScript)
- **AI Service**: Python FastAPI
- **AI Engine**: Google Gemini 1.5 Flash
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Phone OTP)

## Project Structure

```
aquanexus/
├── mobile/          # React Native app
├── backend/         # Express API server
├── ai-service/      # FastAPI AI microservice
├── database/        # SQL migrations
└── docs/            # Documentation
```

## Quick Start

See [docs/SETUP.md](docs/SETUP.md) for detailed setup instructions.

```bash
# Clone repo
git clone https://github.com/your-org/aquanexus.git

# Install mobile dependencies
cd mobile && npm install

# Start mobile app
npx expo start
```

## API Documentation

See [docs/API.md](docs/API.md) for complete API documentation.

## Database Schema

See [database/schema.sql](database/schema.sql) for the complete database schema.

## Team

- Member 1 (Lead): Foundation + AquaDoc
- Member 2: AquaVoice
- Member 3: AquaAdvisor
- Member 4: AquaFeed + AquaConnect

## License

B.Tech Final Year Project
