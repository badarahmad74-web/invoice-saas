# Invoice SaaS Monorepo Structure

## Frontend (Root)
- **Framework**: React 19 + Vite 7 + TypeScript
- **Styling**: Tailwind CSS 4 + PostCSS
- **Routing**: React Router 7
- **Forms**: React Hook Form + Zod validation
- **HTTP**: Axios
- **Charts**: Recharts
- **Build**: `npm run build` → `dist/`
- **Dev Server**: `npm run dev` → http://localhost:5173
- **Deploy Target**: Hostinger Node.js

## Backend (`/backend`)
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT (configure in .env)
- **CORS**: Enabled for frontend origin
- **Build**: `npm run build` → `backend/dist/`
- **Dev Server**: `npm run dev` → http://localhost:5000
- **Deploy Target**: Separate hosting (Railway, Render, AWS)

## API Contract
- **Frontend** calls `http://localhost:5000/api/*` (development)
- **Frontend** calls `$VITE_API_URL/api/*` (production)
- Backend CORS configured to accept `FRONTEND_URL`

## Development Workflow

### Frontend Only
```bash
cd . && npm install && npm run dev
```

### Backend Only
```bash
cd backend && npm install && npm run dev
```

### Full Stack (Parallel Terminals)
```bash
# Terminal 1: Backend
cd backend && npm install && npm run dev

# Terminal 2: Frontend
npm install && npm run dev
```

### Production Deployment
- Frontend: Deploy to Hostinger (this repo root)
- Backend: Deploy separately to Railway/Render/AWS
