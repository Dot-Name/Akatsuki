# Tuition Management — Backend (fee-first)
cd server && cp .env.example .env && npm i && npm run seed:dev && npm run dev
All mutating requests must send header `X-Requested-With: XMLHttpRequest` (CSRF guard) and `withCredentials: true`.
Render: root `server`, build `npm i`, start `npm start`; set env vars from .env.example (NODE_ENV=production, CLIENT_URL=your Vercel URL).
Create the real admin once with `npm run seed` using ADMIN_PASSWORD from the environment, then change it via PUT /api/auth/change-password.
