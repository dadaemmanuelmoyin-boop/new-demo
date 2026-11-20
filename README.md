# Receipt status app

    npm install
    npx prisma db push
    npm run dev

Open http://localhost:3000 (creates a demo receipt and redirects to /receipt/[id]).
Tap the pill to toggle PENDING <-> COMPLETED; other open tabs update within 3s.

API
- POST  /api/receipts            body: {"message"?: string} -> {id, url}
- GET   /api/receipts/:id        -> {id, message, status}
- PATCH /api/receipts/:id        body: {"status": "PENDING"|"COMPLETED"|"FAILED"}
