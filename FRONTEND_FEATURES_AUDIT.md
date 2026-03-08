# Wanderers — Frontend Features Audit & Brief

**App:** Wanderers — *Find your people. Start something.*  
**Stack:** Next.js (App Router), React, Tailwind CSS

---

## PART 1: Visual & Simple Overview

### What the app does (user-facing)

**Landing**
- Splash/landing page with Sign Up and Log In
- Opens a modal to create account or sign in
- After verify (OTP), you go to onboarding or home

**Home**
- Shows nearby activities (bubbles) in a horizontal list
- Filter by “Happening Now”, “Starting Soon”, or category (Sports, Study, etc.)
- Recent Moments feed — posts with photos, likes, comments
- Sidebar: Connection requests (people who want to connect), Accept/Reject
- Confirmed to attend — events you joined, each with duration and an End Event button
- Floating “Start Something” button to create a new bubble

**Map**
- Opens as a floating card (top: map, bottom: activity list)
- Bubbles shown on map by location
- Hover → “Join Bubble” appears; click to join
- Joined events show up in Confirmed to attend and in Messages

**End Event flow** (when you tap End on a confirmed event)
1. **Card 1 — Capture**
   - Take a photo or pick from device
   - 3 filter buttons: Polaroid, Vintage, Scipia
   - Caption field
   - “Save to device” — download photo, then next step
   - “Save and post” — add to feed and go to next step
2. **Card 2 — Future Wanderers?**
   - List of people from the event
   - Click name → profile
   - “Wanna Wander?” → send connect request

**Connections**
- Click names (feed, connection requests, Future Wanderers) → profile overlay
- Profile: Connect (if new) → Pending → Connected; Disconnect if already connected
- Connect from profile when someone already requested you = accept
- Connection requests list hides people you’re already connected with

**Profile**
- Your stats (connections, events attended)
- Interests, personality traits
- Past Bubbles
- Log Out

**Messages**
- List of conversations (DMs + bubble group chats)
- Click a conversation → chat screen
- Add comment on feed posts

**My Bubbles**
- List of bubbles you’re in, with category filters

**Create Bubble**
- Modal: title, category, location, max people, when, description

---

## PART 2: Technical Overview

### Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing + AuthModal |
| `/home` | Main feed, bubbles, connection requests, feed posts |
| `/profile` | User profile |
| `/map` | Redirects to `/home` and opens map overlay |
| `/messages` | Conversation list |
| `/chat/[id]` | Chat view |
| `/onboarding` | Interest selection |
| `/my-bubbles` | My bubbles with filters |

### Contexts (global state)

| Context | Responsibility |
|---------|----------------|
| **ConnectionsContext** | `connectedIds`, `pendingIds`, `connectionRequests`, `filteredConnectionRequests`, `isConnected`, `isPending`, `addConnection`, `removeConnection`, `addPendingRequest`, `acceptRequest`, `acceptRequestByProfileId`, `hasIncomingRequest`, `getConnectedFriends` |
| **ConversationsContext** | `conversations`, `joinedBubbles`, `addBubbleConversation`, `removeBubbleFromJoined` (stores participants, duration) |
| **ProfileOverlayContext** | `selectedProfile`, `openProfile`, `closeProfile` |
| **MapOverlayContext** | `isOpen`, `openMap`, `closeMap` |

### Main components

| Component | Role |
|-----------|------|
| **AuthModal** | Sign Up / Log In / OTP verify, uses `/api/auth/signup`, `/api/auth/login` |
| **CreateBubbleModal** | Bubble creation form (no API wiring yet) |
| **EndEventModal** | Two-step: photo + caption + filters → Save/Post → people list with “Wanna Wander?” |
| **MapOverlay** | Map + bubbles list, Join Bubble |
| **ProfileOverlay** | Profile modal with Connect / Disconnect / Pending |
| **ProfileLink** | Clickable name that opens ProfileOverlay |
| **BottomNav** | Sidebar (desktop) + bottom tabs (mobile), connected friends |
| **BubbleCard** | Activity card, View Map button |
| **FeedPost** | Feed item with image, likes, comments, caption |

### Data flow

- **Bubbles** → `mockBubbles` (with `duration`, `participants`)
- **Feed posts** → `feedPosts` state (initialized from `mockFeedPosts`), `addPost` from EndEventModal
- **Connections** → ConnectionsContext (mock `connectionRequests`, `connectedIds`, `pendingIds`)
- **Joined bubbles** → ConversationsContext, with `participants` for End Event people list

### Behaviors

- **Connect / Pending / Accept**
  - Connect → `addPendingRequest` → Pending
  - Accept from requests list → `acceptRequest`
  - Connect on profile when they have incoming request → `acceptRequestByProfileId`
- **End Event** → Opens EndEventModal, removes bubble from `joinedBubbles` on close
- **Save and post** → Adds post with optional `imageUrl` to feed
- **Connection requests** → Rendered from `filteredConnectionRequests` (excludes already connected)

### APIs used

- `POST /api/auth/signup`
- `POST /api/auth/login`
- (Others still mock)

---

## PART 3: Feature checklist (for briefing)

**Auth & onboarding**
- [x] Sign Up / Log In modal
- [x] OTP verification
- [x] Onboarding with interest selection

**Bubbles**
- [x] Bubbles list with filters
- [x] Map overlay with Join Bubble
- [x] Create Bubble modal (UI only)
- [x] My Bubbles page
- [x] Confirmed to attend list with duration

**End Event flow**
- [x] End button on confirmed events
- [x] Take photo or choose image
- [x] Caption
- [x] Filters: Polaroid, Vintage, Scipia
- [x] Save to device / Save and post
- [x] Future Wanderers list with “Wanna Wander?” and profile links

**Connections**
- [x] Profile overlay from name clicks
- [x] Connect / Disconnect / Pending states
- [x] Accept from requests list
- [x] Accept via Connect on profile (incoming request)
- [x] Connection requests filtered to exclude connected

**Feed**
- [x] Recent Moments feed
- [x] Posts with image, caption, likes, comments
- [x] Add new post from End Event flow

**Messages & chat**
- [x] Conversation list
- [x] Chat view
- [x] Bubble group chats after join

**Profile**
- [x] Profile page (stats, interests, past bubbles)
- [x] Profile overlay for other users

---

Use this for handoffs, onboarding, and prompting (e.g. for ChatGPT).
