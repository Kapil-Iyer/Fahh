# Wanderers — Technical Audit for Interview Prep

A concise, technically accurate explanation of how the app works, with focus on backend and AI.

---

## 1. Project Overview

### What Wanderers does
- **Campus social discovery app**: users discover and join real-time activities (“bubbles”)—study sessions, sports, coffee meetups—on a map and in feeds.
- **Flow**: Discover/join bubble → group chat (unlocks at 2 members) → meet up → end event → capture “Wander Moment” (photo with filters) → post to feed → optional “Wanna Wander?” connection requests.

### Problem it solves
- Reduces friction to find and join casual, real-time activities on campus (no long-term commitment; time-bounded bubbles).
- Replaces ad-hoc group chats and DMs with structured activities, chat, and proof-of-meetup (moments).

### Overall architecture
```
Next.js 15 (App Router) frontend
    ↓
Next.js API Routes (serverless)
    ↓
Supabase (Auth, Postgres, Realtime)  +  Cloudinary (media)  +  Gemini API (intent parsing)  +  optional FastAPI ML (recommendations)
```
- **Frontend**: React, TypeScript, Tailwind, shadcn/ui.
- **Backend**: Next.js API routes only; no separate backend server.
- **Auth & DB**: Supabase (GoTrue + Postgres).
- **AI**: Google Gemini for natural-language → structured bubble fields (create flow).
- **Recommendations**: Optional external FastAPI service (K-means), or DB fallback.
- **Media**: Cloudinary for Wander Moment uploads and transforms.

---

## 2. Folder Structure

### Frontend (pages & components)
| Path | Purpose |
|------|--------|
| `src/app/page.tsx` | Landing; renders `AuthModal` (login/signup or skip). |
| `src/app/home/page.tsx` | Home feed: “Upcoming for you”, filter chips, “Active Nearby”, Recent Moments. |
| `src/app/map/page.tsx` | Map view; opens `MapOverlay` (map + bubble list, join). |
| `src/app/messages/page.tsx` | Conversations list (joined bubbles). |
| `src/app/chat/[id]/page.tsx` | Single chat (bubble or mock); fetches messages from API, sends via POST. |
| `src/app/my-bubbles/page.tsx` | User’s created/joined bubbles. |
| `src/app/profile/page.tsx` | Profile. |
| `src/app/onboarding/page.tsx` | Onboarding (interests, etc.). |
| `src/app/auth/callback/page.tsx` | Magic-link callback: sets session, ensure-profile, redirect to /home. |
| `src/components/ui/AuthModal.tsx` | Login/signup UI; when OTP disabled, skip (anonymous + ensure-profile). |
| `src/components/ui/CreateBubbleModal.tsx` | Create bubble: “smart” input → Gemini parse-intent; submit → POST /api/bubbles. |
| `src/components/MapOverlay.tsx` | Map + bubble list; join → POST /api/bubbles/join, then navigate to chat. |
| `src/components/EndEventModal.tsx` | End event: photo, filter, caption → POST /api/media/upload, then confirm. |
| `src/contexts/ConversationsContext.tsx` | List of joined bubbles/conversations. |
| `src/contexts/ConnectionsContext.tsx` | Connection requests (Wanna Wander). |

### Backend (API routes)
| Path | Purpose |
|------|--------|
| `src/app/api/auth/login/route.ts` | POST; Supabase `signInWithOtp` (magic link). |
| `src/app/api/auth/signup/route.ts` | POST; same, for signup. |
| `src/app/api/auth/verify/route.ts` | POST; verify OTP, upsert `public.users`, return session. |
| `src/app/api/auth/ensure-profile/route.ts` | POST; ensure auth user has row in `public.users` (e.g. after anonymous). |
| `src/app/api/bubbles/route.ts` | POST; create bubble (auth + ensureUser), insert creator into bubble_members. |
| `src/app/api/bubbles/join/route.ts` | POST; join bubble (auth + ensureUser, expiry/max_members checks). |
| `src/app/api/bubbles/list/route.ts` | GET; open/active, non-expired bubbles + member count. |
| `src/app/api/bubbles/mine/route.ts` | GET; bubbles user joined (auth). |
| `src/app/api/bubbles/[id]/route.ts` | GET; single bubble info (activity, members_count). |
| `src/app/api/bubbles/[id]/messages/route.ts` | GET/POST; list/send messages (auth + member). |
| `src/app/api/bubbles/[id]/confirm/route.ts` | POST; set bubble status expired (auth + member). |
| `src/app/api/media/upload/route.ts` | POST; Cloudinary upload, insert `meetup_photos` (auth + member). |
| `src/app/api/moments/route.ts` | GET; list meetup_photos for feed. |
| `src/app/api/ai/parse-intent/route.ts` | POST; Gemini: natural language → activity, zone, start_time, etc. |
| `src/app/api/recommendations/route.ts` | GET; optional FastAPI /recommend or DB fallback. |
| `src/app/api/seed-demo-bubbles/route.ts` | POST; create sample bubbles (auth). |

### Database integration
- **Client**: `src/lib/supabase.ts` — browser Supabase client (anon key).
- **Admin**: `src/lib/supabaseAdmin.ts` — `getSupabaseAdmin()` (service role), server-only, for RLS bypass in API routes.
- **Auth helper**: `src/lib/auth.ts` — `getAuthUser(request)` reads Bearer token, calls `supabase.auth.getUser(token)`.
- **User sync**: `src/lib/ensureUser.ts` — `ensureUserInPublic(admin, user)` upserts `public.users` (needed for FKs: bubble_members, bubbles.creator_id).

### AI integration
- **Gemini client**: `src/lib/gemini.ts` — `getGeminiModel()` (server-only; `GEMINI_API_KEY`, `GEMINI_MODEL` default `gemini-2.5-flash`).
- **Usage**: Only in `src/app/api/ai/parse-intent/route.ts` (see §3).

---

## 3. Gemini Integration

### Where Gemini is called
- **Single place**: `POST /api/ai/parse-intent` (`src/app/api/ai/parse-intent/route.ts`).
- **Trigger**: Create Bubble modal “smart” input: user types e.g. “coffee near SLC tonight” and hits parse; frontend calls this API.

### What the prompt looks like
- System-style prompt in code:
  - Role: “You are an intent parser for a university meetup app.”
  - Task: “Extract structured data from the user text.”
  - Output: “Return ONLY valid JSON with these fields (use null if missing): activity, zone, start_time (ISO 8601 or time; assume today if only time), duration_minutes (default 60), max_members, description.”
  - Constraint: “Return nothing but the JSON object, no markdown or explanation.”
- User input is appended: `User input: "${text}"`.

### What Gemini does (and does not do)
- **Does**: Natural language → structured JSON for **creating a bubble** (activity, zone, start_time, duration_minutes, max_members, description). Used to pre-fill the Create Bubble form.
- **Does not**: Recommendations, icebreakers, or chat. “Recommended for you” is served by the **FastAPI K-means** service (when `RECOMMENDATIONS_API_URL` is set) or by a DB fallback (open/active bubbles). Icebreakers in chat are not implemented via Gemini in this codebase.

### Logic flow
1. User types in CreateBubbleModal smart input → clicks parse (or similar).
2. Frontend: `POST /api/ai/parse-intent` with body `{ text }`.
3. API: `getGeminiModel()` → `model.generateContent(prompt)` with the fixed prompt + user text.
4. API: Parse model response as JSON (strip markdown if present), validate types, return `{ success, data: { activity, zone, start_time, duration_minutes, max_members, description } }`.
5. Frontend: Fills form fields from `data`; user can edit and submit → `POST /api/bubbles`.

---

## 4. Supabase Architecture

### Authentication
- **Provider**: Supabase Auth (GoTrue). Email OTP (magic link or code); optional anonymous sign-in.
- **Flow**: Login/signup → `signInWithOtp` (or skip → `signInAnonymously`). Magic link redirects to `/auth/callback`; callback calls `getSession`, `ensure-profile`, then redirects to /home.
- **API auth**: Protected routes read `Authorization: Bearer <access_token>` and use `getAuthUser(request)` (which uses `supabase.auth.getUser(token)`). No admin client for auth checks.
- **Profile sync**: After auth, `ensureUserInPublic` (or `/api/auth/ensure-profile`) upserts `public.users` so `bubbles.creator_id` and `bubble_members.user_id` FKs are valid. Anonymous users get a placeholder email (`anon-<id>@placeholder.local`).

### Database tables
- **users** — id (FK to auth.users), email, name, campus_verified.
- **bubbles** — id, creator_id (→ users), activity, zone, time_window, start_time, duration_minutes, max_members, expires_at, status (open | active | expired).
- **bubble_members** — bubble_id, user_id; creator auto-added on create.
- **messages** — id, bubble_id, user_id, content, created_at.
- **connections** — requester_id, receiver_id, status (e.g. pending).
- **meetup_photos** — id, bubble_id, user_id, cloudinary_url, created_at.

RLS is enabled; API routes use `getSupabaseAdmin()` for writes/reads that need to bypass RLS (e.g. listing bubbles, inserting messages, ensure-user).

### Realtime
- **messages** table is in the `supabase_realtime` publication so clients can subscribe to new rows.
- **Doc pattern** (in API README): `supabase.channel('messages:' + bubbleId).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'bubble_id=eq.' + bubbleId }, callback).subscribe()`. Chat page fetches messages via REST and could add this subscription for live updates.

---

## 5. Request Flow (examples)

### Create bubble (with Gemini)
1. User opens Create Bubble modal, types “coffee near SLC tonight” in smart input, triggers parse.
2. Frontend → `POST /api/ai/parse-intent` with `{ text }`.
3. API → Gemini with prompt + text → parse JSON → return `{ activity, zone, start_time, duration_minutes, max_members, description }`.
4. Frontend fills form; user may edit; submits.
5. Frontend → `POST /api/bubbles` with body (Bearer token). API: getAuthUser → ensureUserInPublic → insert bubble → insert bubble_members (creator) → return bubble.
6. UI updates (e.g. close modal, refresh list).

### Join bubble and open chat
1. User sees bubbles on map or list → clicks Join.
2. Frontend → `POST /api/bubbles/join` with `{ bubble_id }` (Bearer). API: getAuthUser → ensureUserInPublic → validate bubble (exists, not expired, not full) → insert bubble_members → optionally set bubble status to active if members ≥ 2.
3. Frontend adds bubble to ConversationsContext, navigates to `/chat/bubble-<id>`.
4. Chat page: GET `/api/bubbles/<id>` for header, GET `/api/bubbles/<id>/messages` for messages (Bearer). Sends via POST same route. (Realtime subscription can be added for live messages.)

### Wander Moment (end event + photo)
1. User ends event in UI → EndEventModal: capture/choose photo, optional filter and caption.
2. Frontend → `POST /api/media/upload` with `{ bubble_id, image (base64), activity, location, date, memberCount, filterStyle }` (Bearer). API: getAuthUser → check bubble_members → Cloudinary upload (transform) → insert meetup_photos (cloudinary_url).
3. Optional: `POST /api/bubbles/<id>/confirm` to set bubble status expired.
4. Feed: GET `/api/moments` returns meetup_photos; frontend displays in Recent Moments.

### Recommendations (“Upcoming for you”)
1. Home page loads → GET `/api/recommendations?user_id=<id>` (optional).
2. If `RECOMMENDATIONS_API_URL` set: API fetches open bubbles from DB, POSTs to FastAPI `/recommend` with user_id and activities, maps response to `recommended_bubbles`.
3. Else: API returns open/active bubbles from DB as fallback.
4. Frontend displays in “Upcoming for you”.

---

## 6. What I Built (developer-owned pieces)

From the codebase, the developer likely implemented:

- **Backend**: All Next.js API routes (auth, bubbles, messages, media, moments, parse-intent, recommendations, seed); auth helper (`getAuthUser`), ensure-user helper, Supabase admin usage.
- **AI**: Gemini integration for **intent parsing only** (parse-intent route + prompt design); no Gemini for recommendations or chat icebreakers.
- **Product flow**: Create/join bubble, chat (REST; realtime pattern documented), end event, Wander Moment upload (Cloudinary + DB), ensure-user so anonymous/OTP users have `public.users` rows.
- **Frontend wiring**: AuthModal (OTP vs skip), CreateBubbleModal (smart input → parse-intent → create), MapOverlay (list/join → chat), chat page (messages API), EndEventModal (upload + confirm), Home (recommendations + moments APIs).
- **Optional ML**: Integration with external FastAPI recommender (RECOMMENDATIONS_API_URL); fallback when not set.

---

## 7. Simple Interview Explanation

**Short (2–3 sentences):**  
“Wanderers is a campus social app we built for [hackathon]: users discover and join time-bounded activities—bubbles—on a map, chat in a group, and cap it off with a ‘Wander Moment’ photo on the feed. The stack is Next.js and Supabase for auth and data, with Gemini used only to turn natural language into structured bubble fields when creating an activity, and an optional K-means service for ‘Recommended for you.’ We kept auth and backend in Next.js API routes and Supabase so the demo was simple to run and deploy.”

---

## 8. Possible Improvements

- **Realtime chat**: Subscribe to `messages` in the chat page so new messages appear without refresh.
- **Gemini**: Add icebreaker or meetup-suggestion generation when a bubble hits 2 members (e.g. system message in chat).
- **Auth**: Re-enable OTP with a verified sender (e.g. Brevo or Resend with a domain) so @uwaterloo.ca magic links deliver reliably; keep anonymous as optional.
- **Recommendations**: Move from synthetic K-means to a model trained on real user/bubble interactions if data is available.
- **Rate limits & validation**: Add rate limiting on create/join and stricter input validation; consider server-side max_members and expiry checks in a transaction.
- **RLS**: Define proper RLS policies so direct Supabase client access is safe and admin is only used where necessary.
- **Testing**: Add API and E2E tests for auth, create/join, messages, and media upload flows.
