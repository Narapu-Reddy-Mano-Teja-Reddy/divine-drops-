# Divine Drops

Luxury fashion and lifestyle e-commerce for **Kuwait**. Clothing, handbags, bags, accessories, cosmetics and beauty — not a perfume house. Currency is **KWD**. Checkout is **cash on delivery** only. There is no Stripe, PayPal or KNET.

## Architecture

- `frontend/` — React, Vite, TypeScript, Tailwind CSS, Framer Motion, GSAP, React Router
- `backend/` — Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT
- `docker-compose.yml` — local PostgreSQL

## Quick start

### 1. Database

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

API: http://localhost:4000

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Storefront: http://localhost:5173  
Admin: http://localhost:5173/admin/login

### Default admin

- Email: `george.a@example.org`
- Password: `Admin@12345`

## Languages

English (LTR) and Arabic (RTL). The `EN | AR` switcher stores the choice in `localStorage` and updates `document.dir`.

## Orders

Customers submit an order with Kuwait address fields. The API:

1. Validates products, stock, sizes and colours
2. Calculates subtotal and delivery (KWD 2, free over KWD 50)
3. Creates a unique order number
4. Saves the order as `PENDING`, `CASH_ON_DELIVERY`, `UNPAID`
5. Surfaces it immediately in the admin dashboard

Confirming an order reduces stock. Cancelling a confirmed order restores stock.

## Cloudinary

Optional. Set `CLOUDINARY_*` in `backend/.env` to enable `POST /api/admin/uploads`.

## Docs

See `backend/API.md` for routes, payloads and admin operations.
