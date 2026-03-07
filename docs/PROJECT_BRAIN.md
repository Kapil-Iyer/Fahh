# Wanderers — Project Brain (System Context)

**Use this as the single source of truth for product context and architecture.** Paste or reference it at the start of Cursor/Gemini sessions so the AI generates clean, aligned code.

---

## Role

You are helping build a hackathon project called **Wanderers** as a **senior startup engineer and product architect**. Goal: a **working production-style MVP** — clean, modular, scalable code, not a toy script.

---

## Mission

Wanderers is a **social discovery platform that moves people offline into real-world meetups**.

- Most apps optimize for scrolling and engagement. Wanderers optimizes for **real-world action**.
- **Goal:** Help students turn spontaneous ideas into real-life meetups with people nearby.
- **Example:** Student thinks “I want to play basketball right now” → opens Wanderers → posts intent → nearby students join → small group forms → chat unlocks → meetup happens.

**One-line pitch:** *Wanderers turns spontaneous ideas into real-world meetups in minutes.*

---

## Core Product Loop

Every feature must support this loop. Do not add features that don’t.

```
Intent
  ↓
Temporary activity bubble
  ↓
People nearby join
  ↓
Small group forms (3–5 users)
  ↓
Group chat unlocks
  ↓
Real meetup happens
  ↓
Photo moment
  ↓
Optional connection ("I want to wander with you")
```

---

## Target Users

- **Initial launch:** University of Waterloo students.
- **Auth:** `@uwaterloo.ca` email OTP only (safety, trust, campus exclusivity).
- Future: other universities.

---

## Hackathon Scope (48h MVP)

Demonstrate the **core loop end-to-end**. Not the full startup.

**MVP must allow:**

1. User signup with Waterloo email
2. Create a bubble (activity + location + time)
3. View nearby bubbles
4. Join a bubble
5. When 3–5 users join → unlock chat
6. Coordinate meetup
7. Upload meetup photo
8. Generate shareable "Wander Moment" card
9. Optional connection after meetup

**Demo flow:** login → discover bubble → join → chat → we met → photo → connection.

---

## Tech Stack

| Layer        | Choice        | Notes |
|-------------|----------------|--------|
| Frontend    | Next.js       | App Router, `src/app` |
| Styling     | TailwindCSS   | |
| Backend     | Supabase      | Postgres + Realtime + **Auth** |
| Auth        | **Supabase only** | Email OTP, restricted to `@uwaterloo.ca`. **Do not use Auth0.** |
| AI          | Gemini API    | Intent parsing (and icebreakers if time) |
| Media       | Cloudinary    | Shareable meetup cards ("Wander Moments") |
| Hosting     | Vercel        | |

**Architecture:**

```
Next.js frontend
      ↓ Supabase client
Supabase (Postgres + Realtime + Auth)
      ↓
Cloudinary (image processing)
      ↓
Gemini API (AI)
```

No custom Node backend. Next.js API routes for server logic.

---

## Database Schema (Supabase Postgres)

**users**
- `id` uuid PK → `auth.users(id)`
- `email` text
- `name` text
- `created_at` timestamp

**bubbles**
- `id` uuid PK
- `creator_id` uuid
- `activity` text
- `zone` text
- `time_window` text
- `expires_at` timestamp
- `status` text
- `exact_location` text

**bubble_members**
- `bubble_id` uuid
- `user_id` uuid
- `joined_at` timestamp

**messages**
- `id` uuid PK
- `bubble_id` uuid
- `user_id` uuid
- `content` text
- `created_at` timestamp

**connections**
- `user_id_1` uuid
- `user_id_2` uuid
- `created_at` timestamp

**meetup_photos**
- `id` uuid PK
- `bubble_id` uuid
- `user_id` uuid
- `image_url` text
- `created_at` timestamp

---

## Product Rules (Always Respect)

1. **No empty screens** — Always show at least a few bubbles. Seed demo data if needed.
2. **Bubble expiration** — Bubbles expire after their time window; exclude expired in queries.
3. **Location privacy** — Nearby users see only zone, activity, time. Exact location only after group formation.
4. **Group size** — Chat unlocks when **3–5 members** have joined.
5. **Connections optional** — "I want to wander with you" creates a mutual connection; not a social graph.

---

## AI (Gemini) Use

- **Primary:** Intent parsing.  
  e.g. `"anyone down for basketball near pac tonight?"` → `activity`, `zone`, `time_window`.
- **Secondary (if time):** Icebreaker suggestions when a bubble forms.

---

## Demo Zones (Simplify for Hackathon)

Hardcode for demo if needed:

- SLC, PAC, DP, Waterloo Park

---

## Coding Standards

- Modular, readable, production-style.
- Strongly typed where possible.
- Small reusable components, clear API routes, structured DB queries.
- Avoid hacks unless necessary for demo.

---

## Key Principle

Wanderers is **not a social network**. It is a **real-world coordination engine**. Success = real meetups. Every technical decision should support getting people off their phones and meeting in real life.

---

## Implementation Order (Scaffold)

1. Next.js project + Supabase client
2. Database schema in Supabase
3. Auth flow (Supabase Auth, `@uwaterloo.ca` only)
4. Bubble creation API
5. Bubble discovery (nearby, non-expired)
6. Join logic
7. Realtime chat (unlock at 3–5 members)
8. Meetup photo + Wander Moment (Cloudinary)
9. Optional connections

**First Cursor command:** *Create the folder architecture for this project.* Then implement step-by-step.
