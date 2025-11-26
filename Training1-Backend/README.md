# Training1 Backend

REST + GraphQL API, business logic, queue workers, rendering services (PDF/DOCX/PPTX), live WebSocket server.

## Quick Start

1. **Clone and install dependencies:**
```bash
git clone <repo-url>
cd Training1-Backend
npm install
```

2. **Set up environment:**
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

3. **Start local services:**
```bash
docker compose -f docker/docker-compose.local.yml up -d
```

4. **Set up database:**
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

5. **Start development server:**
```bash
npm run dev
```

Server will be available at `http://localhost:4000`

## Project Structure

- `src/modules/` - Feature modules (auth, training, assessment, etc.)
- `src/config/` - Configuration and constants
- `src/utils/` - Shared utilities
- `src/types/` - TypeScript type definitions
- `prisma/` - Database schema and migrations
- `scripts/` - Utility scripts
- `tests/` - Test files

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data
- `npm run test` - Run tests

## Environment Variables

See `.env.example` for all required environment variables.

## Deployment

This backend is designed to deploy on Render.com. See the main README for deployment instructions.