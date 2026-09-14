# ChitChat Client

A modern, real-time messaging application built with Next.js and Supabase Auth, backed by a set of microservices for users, messages, and delivery.

**Live demo:** [chit-chat-client-zeta.vercel.app](https://chit-chat-client-zeta.vercel.app/)

## Features

- 💬 Real-time messaging over a WebSocket delivery service (live message delivery, typing indicators, online/offline presence)
- 🔐 Authentication via Supabase (email/password), with an onboarding flow for new accounts
- 👥 User search and one-on-one conversation creation
- 👨‍👩‍👧 Group conversation creation with multiple members
- ✅ Read receipts (last-seen message tracking per conversation)
- 🔍 Search bar to filter contacts/conversations
- 👤 Public contact profile pages and an editable "my profile" page
- 🐛 In-app bug report widget
- 📱 Fully responsive, dark-themed UI
- ⚡ Built with Next.js 16, React 18, TypeScript, and Tailwind CSS

## Architecture

ChitChat Client is the frontend for a small distributed system:

| Service | Role |
|---|---|
| **Client** (this repo) | Next.js app: UI, auth flows, and orchestration between the other services |
| [**User Service**](https://github.com/SumedhaKun/ChitChatUserService) | Manages user profiles and search (`NEXT_PUBLIC_USER_SERVICE_URL`) |
| [**Message Service**](https://github.com/SumedhaKun/ChitChatMessageService) | Validates and publishes conversations and messages, sent via REST (`NEXT_PUBLIC_MESSAGE_SERVICE_URL`) |
| [**Delivery Service**](https://github.com/SumedhaKun/ChitChatDeliveryService) | Real-time delivery of messages, typing events, and presence over WebSocket (`NEXT_PUBLIC_DELIVERY_SERVICE_URL`) |
| **Supabase** | Handles authentication (email/password) and session management + Stores the message and user data |

If the message/user services or Supabase aren't configured, the app can fall back to local mock data (see `data/`) for local development.

## Quick Start

### Prerequisites
- Node.js 18.17+ and npm
- A Supabase project (for auth) — optional for pure frontend/mock development
- The User, Message, and Delivery services running locally or reachable remotely (optional for mock mode)

### Installation

```bash
git clone https://github.com/SumedhaKun/ChitChatClient.git
cd ChitChatClient
npm install
cp .env.example .env.local   # fill in your Supabase and service URLs
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment variables

Configured in `.env.local` (see `.env.example`):

```bash
# Local dev (defaults used by npm run dev if unset)
NEXT_PUBLIC_DELIVERY_SERVICE_URL=ws://localhost:8082
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:8081
NEXT_PUBLIC_MESSAGE_SERVICE_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Production values must be set explicitly — see DEPLOYMENT.md
```

`NEXT_PUBLIC_*` values are embedded at build time, so redeploy after changing them in production.

## Project Structure

```
ChitChatClient/
├── app/
│   ├── page.tsx                    # Main chat page (conversations, messages, delivery)
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── register/page.tsx           # Sign up / sign in (email + Google OAuth)
│   ├── onboarding/page.tsx         # First-time profile setup after signup
│   ├── profile/page.tsx            # View/edit your own profile
│   ├── contact/[username]/page.tsx # Public profile page for a contact
│   ├── auth/callback/route.ts      # Supabase OAuth callback handler
│   └── api/dev/signup/route.ts     # Dev-only helper endpoint for creating test users
├── components/
│   ├── Header.tsx                  # Top navigation and profile avatar
│   ├── Sidebar.tsx                 # Conversation list, search, unread badges
│   ├── ChatWindow.tsx              # Message display, input, typing indicator
│   ├── MessageBubble.tsx           # Individual message styling
│   ├── UserSearch.tsx              # Search for users to start a conversation
│   ├── CreateGroupModal.tsx        # Group conversation creation
│   └── BugReport.tsx               # In-app bug report widget
├── hooks/
│   ├── useDeliveryService.ts       # WebSocket connection, presence, incoming messages/typing
│   └── useOutgoingTyping.ts        # Debounced outgoing typing signal
├── lib/
│   ├── conversations.ts            # Conversation helpers (naming, sorting, snippets)
│   ├── messages.ts                 # Message helpers (unread counts, display formatting)
│   ├── messageService.ts           # Message Service REST client
│   ├── userService.ts              # User Service REST client
│   ├── deliveryService.ts          # Delivery Service WebSocket client
│   ├── authErrors.ts               # Shared auth-error detection across services
│   ├── users.ts                    # Local user resolution helpers
│   └── supabase/                   # Supabase client/server/admin factories
├── data/                           # Mock users/conversations/messages for local/offline dev
├── types/                          # Shared TypeScript types
└── package.json
```

## Key Features

**Messaging**
- Real-time delivery via WebSocket, with REST fallback for sending
- Chronological message display with timestamps
- Auto-scroll to latest message
- Typing indicators (outgoing, debounced; incoming, live)
- Read receipts based on each participant's last-seen message
- Enter to send, Shift+Enter for new line

**Contacts & Conversations**
- Search users to start a new direct conversation
- Create group conversations with multiple members
- Online/offline presence, updated live over the delivery WebSocket
- Public contact profile pages
- Search/filter your conversation list

**Auth & Profiles**
- Email/password sign-in via Supabase
- Guided onboarding to set up name and username on first login
- Editable personal profile page

**Other**
- In-app bug report widget
- Dark-themed, fully responsive UI

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 18 + Tailwind CSS
- **Language**: TypeScript
- **Auth**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **Real-time**: Native WebSocket client to a dedicated Delivery Service
- **Backend**: Companion User, Message, and Delivery services (deployed separately — see `DEPLOYMENT.md`)

## Deployment

The client deploys to Vercel; the Message Service is HTTP-only, and the Delivery Service runs on Render to support persistent WebSocket connections. Full setup, environment variables, and deployment order are documented in [`DEPLOYMENT.md`](./DEPLOYMENT.md).

## Future Enhancements

- File/image sharing
- Push notifications

## License

MIT License - feel free to use this project!

## Author

Sumedha Kundurthi
