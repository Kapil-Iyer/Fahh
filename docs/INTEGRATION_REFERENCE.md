# API Integration Reference

Quick index for where mock data and API integration points live. Use this during the integration phase.

## Data Sources

| What | Location | Replace With |
|------|----------|--------------|
| **All mock data** | `src/lib/mockData.ts` | Supabase / API |
| **Bubbles** | mockBubbles | GET /api/bubbles, POST /api/bubbles |
| **Conversations** | mockConversations | GET /api/conversations |
| **Feed posts** | mockFeedPosts | GET /api/feed (meetup_photos) |
| **User profiles** | mockUserProfiles | GET /api/users/:id |
| **Connections** | mockConnectedFriends | GET /api/connections |
| **Connection requests** | mockConnectionRequests | GET /api/connection-requests |
| **Messages** | mockMessages | GET /api/conversations/:id/messages |

## Contexts (State Management)

| Context | File | API Integration |
|---------|------|-----------------|
| **ConnectionsContext** | `src/contexts/ConnectionsContext.tsx` | Connections, connection requests, accept/reject |
| **ConversationsContext** | `src/contexts/ConversationsContext.tsx` | Chat list, joined bubbles |
| **ProfileOverlayContext** | `src/contexts/ProfileOverlayContext.tsx` | Profile lookup (getOrCreateProfile) |
| **MapOverlayContext** | `src/contexts/MapOverlayContext.tsx` | UI only, no API |

## Pages

| Page | File | Key Data |
|------|------|----------|
| Landing | `src/app/page.tsx` | AuthModal → /api/auth/* |
| Onboarding | `src/app/onboarding/page.tsx` | interestOptions, save interests |
| Home | `src/app/home/page.tsx` | mockBubbles, mockFeedPosts, connectionRequests, joinedBubbles |
| Profile | `src/app/profile/page.tsx` | connectionsCount, personalityTraits, mockBubbles |
| Messages | `src/app/messages/page.tsx` | useConversations().conversations |
| Chat | `src/app/chat/[id]/page.tsx` | mockMessages, conversations |
| My Bubbles | `src/app/my-bubbles/page.tsx` | mockBubbles (filtered - replace with user's bubbles) |
| Map | `src/app/map/page.tsx` | Redirects + opens MapOverlay |

## Components

| Component | File | Integration Notes |
|-----------|------|-------------------|
| MapOverlay | `src/components/MapOverlay.tsx` | mockBubbles, addBubbleConversation on join |
| ProfileOverlay | `src/components/ProfileOverlay.tsx` | ConnectionsContext connect/disconnect |
| BubbleCard | `src/components/ui/BubbleCard.tsx` | Bubble data |
| FeedPost | `src/components/FeedPost.tsx` | Feed post data, like, comment |
| CreateBubbleModal | `src/components/ui/CreateBubbleModal.tsx` | Form → POST /api/bubbles |
| BottomNav | `src/components/ui/BottomNav.tsx` | getConnectedFriends() |
| AuthModal | `src/components/ui/AuthModal.tsx` | /api/auth/signup, /api/auth/login |
| ProfileLink | `src/components/ProfileLink.tsx` | openProfile(name, avatar) |

## API Routes

| Route | File | Status |
|-------|------|--------|
| POST /api/auth/login | `src/app/api/auth/login/route.ts` | Mock - always succeeds |
| POST /api/auth/signup | `src/app/api/auth/signup/route.ts` | Mock - always succeeds |

## Database (Supabase)

- Client: `src/lib/supabase.ts`
- Tables per PROJECT_BRAIN.md: users, bubbles, bubble_members, messages, connections, meetup_photos
