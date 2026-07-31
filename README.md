# FITMAN

FITMAN is a full-stack AI fitness and nutrition coaching platform. It combines a React frontend with a FastAPI backend and Supabase services to provide onboarding, workout planning, nutrition tracking, progress monitoring, an AI coach, and long-term memory features for personalized coaching.

## Overview

FITMAN is designed to help users:

- create an account and complete onboarding
- receive personalized workout plans
- generate workout split routines for specific training days
- log nutrition and track nutrition targets
- track body weight and progress trends
- chat with an AI coaching assistant
- store persistent memory for personalized coaching behavior
- upload and manage documents and related fitness content

The product is built as a modern single-page app with a secure backend API and a Supabase-powered data layer.

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Recharts
- React Query
- Axios
- React Hot Toast

### Backend
- Python
- FastAPI
- Pydantic
- Supabase Python client
- LangGraph
- LangChain
- LangChain Groq integration
- SlowAPI for rate limiting

### Data and Services
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Row Level Security policies

## Project Structure

```text
FITMAN/
├── backend/
│   ├── app/
│   │   ├── ai/              # AI coach routing and LangGraph nodes
│   │   ├── auth/            # Authentication and account operations
│   │   ├── common/          # Shared response helpers
│   │   ├── documents/       # Document-related endpoints
│   │   ├── memory/          # User memory endpoints
│   │   ├── nutrition/       # Nutrition-related routes
│   │   ├── progress/        # Progress, weight, and reports
│   │   ├── users/           # Profile and onboarding logic
│   │   ├── workouts/        # Workout generation, sessions, exercises
│   │   ├── config.py        # Settings and environment loading
│   │   ├── database.py      # Supabase client helpers
│   │   ├── dependencies.py  # Auth dependency helpers
│   │   └── main.py          # FastAPI app entry point
│   ├── scripts/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # App layout, UI primitives, guards
│   │   ├── lib/             # API and authentication helpers
│   │   ├── pages/           # Route-level pages
│   │   └── main.tsx         # React entry point
│   ├── package.json
│   └── vite.config.ts
├── supabase/
│   └── migrations/
└── .env.example
```

## Core Features

### Authentication and Account Management
- user registration and login
- password reset flow
- access token and refresh token handling
- protected routes for authenticated users
- account deletion support

### Onboarding
- multi-step onboarding flow
- profile preferences such as goals, activity level, training experience, and schedule
- profile completion state for accessing the full app

### Workouts
- workout plan generation
- split-based workout generation
- workout sessions and exercise tracking
- exercise management for today’s workout

### Nutrition
- nutrition target calculation
- food logging flows
- nutrition-related dashboard and page support

### Progress Tracking
- weight tracking
- progress pages and reporting surfaces
- progress visualization support

### AI Coach
- AI chat experience for coaching prompts
- conversation management for chat sessions
- profile-aware coaching context using user data

### Memory and Documents
- persistent memory features for the AI assistant
- file/document management endpoints and supporting structure

## Local Development Setup

### 1. Prerequisites

Install:
- Python 3.10 or newer
- Node.js and npm
- A Supabase project

### 2. Environment Variables

Create a file named .env in the project root based on the sample file.

Example values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
GROQ_API_KEY=your-groq-key
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS or Linux
source venv/bin/activate

pip install -r requirements.txt
```

Start the API server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- http://localhost:8000
- API docs: http://localhost:8000/docs

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:
- http://localhost:5173

The Vite config proxies /api requests to the FastAPI backend on port 8000.

### 5. Supabase Database Setup

Create a Supabase project and enable the required extensions and tables.

Recommended initial steps:
1. create the project in Supabase
2. enable the database extensions required by your schema
3. run the SQL migrations from the supabase/migrations directory
4. ensure authentication and storage policies are configured correctly

The backend expects the Supabase environment variables to be present and valid.

## Testing

Backend tests can be run with:

```bash
cd backend
pytest -q tests/test_profile.py tests/test_workouts.py
```

You can also run the broader test suite:

```bash
cd backend
pytest -q
```

## API Conventions

The API uses a consistent response shape:

```json
{
  "success": true,
  "data": {},
  "message": "Optional success message"
}
```

Errors are returned in a consistent format as well.

## Application Flow

1. A user registers or logs in.
2. The authentication layer validates the provided credentials and returns tokens.
3. The frontend stores the access token and sends it as a Bearer token on protected routes.
4. The backend loads the user profile and uses it for onboarding and coaching flows.
5. The user can generate workouts, log nutrition, monitor progress, and interact with the AI coach.

## Notes on AI Features
The AI coach integrates with external model providers through the configured API keys. The project uses LangGraph and LangChain to orchestrate the conversational workflow and to pass context such as the user profile and conversation state into the model.

## Security Notes

The application uses Supabase Auth and backend-side validation for protected operations. The backend is expected to keep service-role credentials private and to avoid exposing them to the frontend.

## License

This project is intended for private or internal use unless otherwise stated by the owner THENABILMAN.
