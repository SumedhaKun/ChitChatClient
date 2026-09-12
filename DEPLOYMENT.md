# Deployment

ChitChat Client deploys to [Vercel](https://vercel.com). Preview and production deploys are handled by the Vercel GitHub integration; GitHub Actions runs build checks only.

## What runs on each pull request

1. **CI** (`.github/workflows/ci.yml`) — installs dependencies, typechecks, and runs `npm run build`
2. **Vercel** — automatically deploys a preview URL when the repo is connected in the Vercel dashboard

Pushes to `main` deploy to **production** via Vercel.

## Message server WebSocket

In production, the client connects to:

```
wss://chit-chat-client-zeta.vercel.app/api/server
```

On Vercel preview/production deployments this is detected automatically from the current host. Local dev defaults to `ws://localhost:8080` (run `ChitChatMessageService` separately).

Override with `NEXT_PUBLIC_MESSAGE_SERVER_URL` if needed.

## Vercel setup

Connect the repo in the [Vercel dashboard](https://vercel.com/new). Vercel will detect the Next.js project and create preview deployments for pull requests automatically.

Optional local linking:

```bash
npm i -g vercel
vercel login
vercel link
```

## Local production build

```bash
npm ci
npm run build
npm start
```
