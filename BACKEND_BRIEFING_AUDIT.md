# Wanderers — Complete Frontend Audit & Backend Briefing

**Purpose:** Brief backend developer on everything built, for API integration.  
**App:** Wanderers — *Find your people. Start something.*  
**Stack:** Next.js (App Router), React, Tailwind CSS

---

# PART 1: SIMPLE OVERVIEW (Product Understanding)

## What Wanderers Is

A meetup app where users discover nearby activities (“bubbles”), join them, meet people, and capture moments. It is **not** a social feed with likes/comments — Moments are **proof of meetup**, not engagement content.

## User Journey (A to Z)

1. **Land** → Sign Up or Log In  
2. **Verify** → OTP (optional; can Skip → Onboarding)  
3. **Onboarding** → Pick interests  
4. **Home** → See bubbles, filter, see connection requests, see confirmed events, see Moments  
5. **Discover** → View map, browse activities, Join Bubble  
6. **Connect** → Accept/Reject requests, Connect from profiles, “Wanna Wander?” after events  
7. **Chat** → Messages list; group chat unlocks when 2+ people have joined the bubble  
8. **End Event** → Take photo, add filter/caption, Save or Post moment, connect with people (“Future Wanderers?”)  
9. **Profile** → Stats, interests, past bubbles

---

# PART 2: FEATURES IN SIMPLE TERMS

| Feature | What it does (simple) |
|---------|------------------------|
| **Auth** | Sign up, log in, OTP verify, skip to onboarding |
| **Onboarding** | Choose interests (chips + custom) → Confirm → Home |
| **Bubbles** | Activities with activity name, zone, start time, duration, members count, time remaining |
| **Bubble creation** | Form: activity, zone, start time, duration, max members, description |
| **Map** | Map + list of bubbles; Join Bubble adds to “Confirmed to attend” and Messages |
| **Moments** | Meetup proof: photo, activity, zone, caption, participants, timestamp. **No likes or comments.** |
| **Connections** | Connect, Pending, Connected; Accept/Reject requests; Connect from profile = accept if they sent you a request |
| **Connection requests** | List excludes people you’re already connected with |
| **Chat** | Opens when 2 users have joined the bubble (not 3) |
| **End Event** | Two steps: (1) Capture photo + filter + caption → Save/Post, (2) Future Wanderers with “Wanna Wander?” |
| **Profile** | Stats, interests, past bubbles, Connect/Disconnect/Pending from overlay |
| **My Bubbles** | Bubbles you’re in, with filters |

---

# PART 3: TECHNICAL AUDIT

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing + AuthModal |
| `/home` | Main feed, bubbles, Moments, connection requests, confirmed to attend |
| `/profile` | User profile |
| `/map` | Redirect to `/home` + open MapOverlay |
| `/messages` | Conversation list |
| `/chat/[id]` | Chat view |
| `/onboarding` | Interest selection |
| `/my-bubbles` | My bubbles |
| 404 | Not found |

---

## API Routes (Existing)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/signup` | Sign up (mock) |
| POST | `/api/auth/login` | Log in (mock) |
| GET | `/api/recommendations` | Stub — returns `{ recommended_bubbles: [] }` |

---

## Data Structures (Backend Schema Reference)

### Bubble (activity)

```ts
{
  id: string;
  emoji: string;
  title: string;
  category: string;
  zone?: string;           // e.g. "PAC", "DC", "SLC"
  joined: number;
  maxPeople: number;
  startingIn: string;      // e.g. "15 mins"
  duration: string;        // e.g. "1 hr"
  distance?: string;
  description: string;
  lat?: number;
  lng?: number;
  creator: string;
  creatorAvatar: string;
  participants?: { id: string; name: string; avatar: string; }[];
}
```

### Create Bubble Payload

```json
{
  "activity": "Basketball",
  "zone": "PAC",
  "start_time": "2026-03-07T19:00:00Z",
  "duration_minutes": 60,
  "max_members": 6,
  "description": "Pickup game"
}
```

### FeedPost / Moment (meetup proof)

```ts
{
  id: string;
  username: string;
  userAvatar: string;
  imageUrl?: string;
  activity?: string;
  zone?: string;
  participants?: { name: string; avatar: string; }[];
  caption: string;
  timestamp: string;
}
```

**No likes or comments.** Moments = meetup proof only.

### BubbleConversation (joined bubble in Messages)

```ts
{
  id: string;              // "bubble-{bubbleId}"
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  memberNames?: string[];
  duration?: string;
  zone?: string;
  participants?: { id: string; name: string; avatar: string; }[];
  joined?: number;         // chat unlocks when >= 2
}
```

### ConnectionRequest

```ts
{ id: string; name: string; avatar: string; }
```

### UserProfile

```ts
{
  id: string;
  name: string;
  avatar: string;
  connections: number;
  eventsAttended: number;
  personalityTraits: string[];
  interests: string[];
  pastBubbles: { title: string; emoji: string; category: string }[];
}
```

### Message

```ts
{ id: string; text: string; sender: "me" | "other"; time: string; }
```

---

## Contexts (Global State)

| Context | State | Actions |
|---------|-------|---------|
| **ConnectionsContext** | `connectedIds`, `pendingIds`, `connectionRequests`, `filteredConnectionRequests` | `addConnection`, `removeConnection`, `addPendingRequest`, `acceptRequest`, `acceptRequestByProfileId`, `rejectRequest`, `isConnected`, `isPending`, `hasIncomingRequest`, `getConnectedFriends` |
| **ConversationsContext** | `joinedConversations`, `conversations` | `addBubbleConversation`, `removeBubbleFromJoined` |
| **ProfileOverlayContext** | `selectedProfile` | `openProfile`, `closeProfile` |
| **MapOverlayContext** | `isOpen` | `openMap`, `closeMap` |

---

## Critical Business Rules

| Rule | Description |
|------|-------------|
| **Chat unlock** | Group chat opens when **2** users have joined (not 3) |
| **Connection requests** | Do not show people already connected |
| **Connect = Accept** | If user has an incoming request, Connect on profile = Accept |
| **Moments** | No likes, no comments — meetup proof only |
| **user_vector** | Frontend does **not** compute or send `user_vector` — backend handles this |
| **Recommendations** | Frontend calls `/api/recommendations`; backend/ML returns `{ recommended_bubbles: [] }` |

---

## Forms & Fields

| Form | Location | Fields | Submit Action |
|------|----------|--------|---------------|
| Sign Up | AuthModal | name, email, password, confirm | POST /api/auth/signup |
| Login | AuthModal | email, password | POST /api/auth/login |
| Verify | AuthModal | otp (6 digits) | Navigate |
| Create Bubble | CreateBubbleModal | activity, zone, start_time, duration_minutes, max_members, description | **Needs POST /api/bubbles** |
| Onboarding | Onboarding | interests (chips + custom) | Navigate |
| End Event – Post | EndEventModal | photo, filter, caption | Adds to feed (needs POST /api/feed or similar) |
| Chat message | Chat | message | **Needs POST /api/conversations/:id/messages** |
| Profile interests | Profile | interests | Local only (needs PATCH /api/users/me) |

---

## Recommended API Endpoints for Backend

| Operation | Method | Route |
|-----------|--------|-------|
| List bubbles | GET | `/api/bubbles` (with filters/query) |
| Create bubble | POST | `/api/bubbles` |
| Join bubble | POST | `/api/bubbles/:id/join` |
| Get recommendations | GET | `/api/recommendations` |
| List conversations | GET | `/api/conversations` |
| Get messages | GET | `/api/conversations/:id/messages` |
| Send message | POST | `/api/conversations/:id/messages` |
| List moments | GET | `/api/feed` or `/api/moments` |
| Create moment | POST | `/api/feed` or `/api/moments` |
| Get user profile | GET | `/api/users/:id` |
| Get user by name | GET | `/api/users/by-username/:name` |
| Update user | PATCH | `/api/users/me` |
| Connections | GET | `/api/connections` |
| Add connection | POST | `/api/connections` |
| Remove connection | DELETE | `/api/connections/:id` |
| Connection requests | GET | `/api/connection-requests` |
| Accept request | POST | `/api/connection-requests/:id/accept` |
| Reject request | POST | `/api/connection-requests/:id/reject` |

---

## Constants (Candidates for Backend)

- **Activity options:** Basketball, Study, Gaming, Coffee, Volleyball, Soccer, Swimming, LeetCode, Hike, Board Games, Open Mic  
- **Zone options:** PAC, DC, SLC, EV3, MC, Columbia Fields, Laurel Creek  
- **Filter chips:** Happening Now, Starting Soon, Sports, Casual, Study, Music, Gaming, Outdoors  
- **Interest options:** 20 interest chips  
- **Personality traits:** 8 traits  

---

## Mock Helpers to Replace

| Helper | Current | Replace With |
|--------|---------|--------------|
| `getProfileByName(name, avatar?)` | mockUserProfiles lookup | `GET /api/users/by-username/:name` |
| `getProfileById(id)` | mockUserProfiles lookup | `GET /api/users/:id` |
| `getOrCreateProfile(name, avatar?)` | Fallback create | Backend create/fetch logic |

---

## UI Components by Page

| Page | Components |
|------|------------|
| Landing | AuthModal |
| Home | BubbleCard, FeedPost, CreateBubbleModal, EndEventModal, ProfileLink, filter chips |
| Map | MapOverlay, bubbles on map, activity list |
| Messages | Conversation list |
| Chat | Message bubbles, member names, send input |
| Profile | Stats, interests, past bubbles |
| Onboarding | Interest chips, custom input |
| My Bubbles | BubbleCard, filter chips |
| BottomNav | Tabs, connected friends (sidebar on desktop) |

---

## Home Page Section Order (Target)

1. Recommended  
2. Nearby Now  
3. Starting Soon  
4. Wander Moments  

---

## End Event Flow (Technical Detail)

When user taps **End Event** on a confirmed bubble:

1. **ConversationsContext** provides: `participants`, `duration`, `zone`, `name`, `joined`
2. **Step 1 — Capture**
   - Take photo (camera) or pick from device
   - Filters: Polaroid, Vintage, Scipia
   - Caption input
   - Actions: **Save to device** (download only) or **Save and post** (add to feed + proceed)
3. **Step 2 — Future Wanderers?**
   - List of `participants` from the event
   - Each name is clickable → opens ProfileOverlay
   - "Wanna Wander?" → `addPendingRequest(id)` (sends connect request)
4. On modal close: `removeBubbleFromJoined(bubbleId)` removes from Confirmed to attend

**Moment created on Save and post:**
```json
{
  "username": "current user name",
  "userAvatar": "current user avatar",
  "imageUrl": "data URL or Cloudinary URL",
  "activity": "from bubble name/title",
  "zone": "from bubble",
  "participants": "[{ name, avatar }]",
  "caption": "user caption"
}
```

---

## Key File Reference

| File | Purpose |
|------|---------|
| `src/lib/mockData.ts` | Types and mock data (bubbles, feed, profiles, interests) |
| `src/contexts/ConnectionsContext.tsx` | Connections, requests, `filteredConnectionRequests`, accept/connect |
| `src/contexts/ConversationsContext.tsx` | Joined bubbles, `participants`, `removeBubbleFromJoined` |
| `src/components/EndEventModal.tsx` | Two-step End Event flow |
| `src/components/FeedPost.tsx` | Moment display (no likes/comments) |
| `src/components/ui/CreateBubbleModal.tsx` | Create bubble form |
| `src/components/ProfileOverlay.tsx` | Connect / Disconnect / Pending |
| `src/app/chat/[id]/page.tsx` | Chat; `joined >= 2` unlocks input |
| `src/app/api/recommendations/route.ts` | Stub for ML recommendations |

---

## DO NOT Build Yet (per audit)

- `user_vector` logic on frontend  
- Friend recommendations  
- Likes/comments on Moments  
- Any ML logic on frontend  

---

## Summary for Backend Developer

**Build APIs for:**

1. Auth (signup, login — already stubbed)  
2. Bubbles (CRUD, join, schema above)  
3. Conversations and messages  
4. Feed/Moments (create, list — no likes/comments)  
5. Users (profile, by-id, by-username, update)  
6. Connections and connection requests  
7. Recommendations (stub exists; wire to ML service)  

**Important rules:**

- Moments = meetup proof (photo, activity, zone, caption, participants)  
- Chat unlocks at 2 members  
- Connection requests exclude already-connected users  
- Frontend does not send `user_vector`  
