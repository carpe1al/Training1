# Training1 Frontend

Next.js frontend with App Router, role-based routing, and interactive LMS components.

## Quick Start

1. **Clone and install dependencies:**
```bash
git clone <repo-url>
cd Training1-Frontend
npm install
```

2. **Set up environment:**
```bash
cp env/.env.frontend.example .env.local
# Edit .env.local with your API URLs
```

3. **Start development server:**
```bash
npm run dev
```

Application will be available at `http://localhost:3000`

## Project Structure

- `src/app/` - Next.js App Router pages
  - `(public)/` - Public pages (login, etc.)
  - `(learner)/` - Learner dashboard and courses
  - `(admin)/` - Admin interface for managing training
- `src/components/` - Reusable React components
- `src/lib/` - API client and utilities
- `src/styles/` - Global styles and Tailwind CSS

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## Features

- **Role-based routing** - Different interfaces for learners, managers, and admins
- **Magic Link authentication** - Passwordless login
- **Interactive training players** - Video, document, walkthrough, and assessment players
- **Training authoring** - Built-in tools for creating docs, slides, and PDFs
- **Live sessions** - Kahoot-style live training games
- **Progress tracking** - Comprehensive analytics and reporting

## Environment Variables

See `env/.env.frontend.example` for all required environment variables.

## Deployment

This frontend is designed to deploy on Vercel. See the main README for deployment instructions.