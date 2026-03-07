# Next.js API routes (connected to frontend)

| Method | Route | Purpose |
|--------|--------|--------|
| GET | `/api/hello` | Demo / health check |
| POST | `/api/auth/login` | Login (email + password) → used by AuthModal |
| POST | `/api/auth/signup` | Sign up (name, email, password) → used by AuthModal |

Auth routes are mock: they always return success. Replace with real auth (e.g. NextAuth, Clerk, or your backend) when ready.
