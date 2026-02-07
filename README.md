# Gameboxd - Game Wishlist Platform

Gameboxd is a full-stack web app for discovering games, building a personal wishlist, and tracking purchase status. It ships with secure auth, email activation, and a clean dashboard UX.

## Screenshots

**Landing Page**

![Landing Page](readme_pictures/landing-page.PNG)

Hero section dengan CTA jelas untuk onboarding cepat.

**Home Page**

![Home Page](readme_pictures/home-page.PNG)

Daftar game dengan pencarian dan navigasi ke detail.

## Highlights

- End-to-end flow: register -> email activation -> login -> browse games -> wishlist
- Clean UX with search, pagination, and detailed game view
- Secure API with JWT, httpOnly cookies, and role-based guardrails
- Prisma + PostgreSQL data model with migrations and seeds

## Key Features

- Auth: register, login, logout, email activation
- Game library: paginated list + search by title
- Game detail: rich metadata + rating + add to wishlist
- Wishlist: status toggle (pending/purchased/removed) + delete
- Reviews API: add, update, delete, list by game or user
- Admin endpoints: manage user profile and roles

## Tech Stack

**Frontend**

- React 19 + Vite
- Redux Toolkit + RTK Query
- React Router
- Tailwind CSS + DaisyUI
- React Hook Form + Yup validation

**Backend**

- Node.js + Express
- Prisma ORM + PostgreSQL
- JWT auth (httpOnly cookie)
- Nodemailer (email activation)

## System Design (High Level)

- Client (React) consumes REST API
- API server (Express) handles auth, games, wishlist, reviews
- Prisma connects to PostgreSQL
- Mail service handles account activation and email changes

## Project Structure

- GAME-WISHLIST-RONTEND/ (React frontend)
- WISHLISTGAME-backend/ (Express + Prisma backend)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### 1) Install Dependencies

```bash
npm install
cd GAME-WISHLIST-RONTEND
npm install
cd ../WISHLISTGAME-backend
npm install
```

### 2) Environment Variables (Backend)

Create `.env` inside `WISHLISTGAME-backend/`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
JWT_SECRET=your_jwt_secret
APP_URL=http://localhost:3000
PORT=3000
NODE_ENV=development

EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
EMAIL_FROM="Gameboxd <no-reply@yourdomain.com>"
```

### 3) Prisma Setup

```bash
cd WISHLISTGAME-backend
npx prisma generate
npx prisma migrate deploy
```

Optional seeds:

```bash
npm run seed:game
npm run seed:game2
npm run seed:wishlist
```

### 4) Run the App (Dev)

From repo root:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` and backend on `http://localhost:3000`.

## Useful Scripts

**Root**

- `npm run dev` -> run frontend + backend

**Backend**

- `npm run dev` -> nodemon server
- `npm run start` -> production server
- `npm run prisma:migrate` -> apply migrations
- `npm run prisma:generate` -> generate Prisma client

**Frontend**

- `npm run dev` -> Vite dev server
- `npm run build` -> production build
- `npm run lint` -> ESLint

## API Overview

Base URL: `http://localhost:3000/api`

**Auth**

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/activate/:id`
- `GET /auth/changeEmail/:id`
- `POST /auth/logout`

**Games**

- `GET /games?page=&limit=`
- `GET /games/:id`

**Wishlist**

- `GET /wishlist`
- `GET /wishlist/:wishListId`
- `POST /wishlist/:gameId`
- `PUT /wishlist/:wishListId`
- `DELETE /wishlist/:wishListId`

**Reviews**

- `GET /reviews`
- `GET /reviews/me`
- `GET /reviews/:id`
- `GET /reviews/game/:gameId`
- `POST /reviews`
- `PUT /reviews/:id`
- `DELETE /reviews/:id`

**Users**

- `GET /users/all`
- `GET /users/me`
- `GET /users/:id`
- `PUT /users/me`
- `PUT /users/admin/:id`
- `DELETE /users/:id` (ADMIN)

## Resume-Ready Notes

- Built a secure auth system with email verification and JWT cookies
- Designed scalable Prisma schema (User, Game, Wishlist, Review, Favorite)
- Implemented paginated and searchable game catalog
- Delivered a clean, responsive UI with strong form validation
- Structured backend with modular routes, controllers, and middleware

## Roadmap Ideas

- Public profiles and shareable wishlists
- Review moderation + rating aggregation
- Image optimization + CDN
- CI pipeline and unit tests

## License

MIT
