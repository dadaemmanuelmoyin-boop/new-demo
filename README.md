# Receipt status app

Next.js + Prisma + Postgres.

## Local
    cp .env.example .env     # put a real Postgres URL in it
    npm install
    npx prisma db push
    npm run dev

## Deploy on Vercel
1. Project -> Storage -> create a Postgres (Neon) database and connect it to the project.
2. Make sure the env var DATABASE_URL exists (Settings -> Environment Variables).
3. Redeploy. The build creates the tables automatically.

API
- POST  /api/receipts            body: {"message"?: string} -> {id, url}
- GET   /api/receipts/:id        -> {id, message, status}
- PATCH /api/receipts/:id        body: {"status": "PENDING"|"COMPLETED"|"FAILED"}
