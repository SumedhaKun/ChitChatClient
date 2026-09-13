# Deployment

ChitChat Client and User Service deploy to [Vercel](https://vercel.com). The
Message Service deploys as a Render web service so it can maintain persistent
WebSocket connections. Preview and production client deploys are handled by
the Vercel GitHub integration; GitHub Actions runs build checks only.

## What runs on each pull request

1. **CI** (`.github/workflows/ci.yml`) — installs dependencies, typechecks, and runs `npm run build`
2. **Vercel** — automatically deploys a preview URL when the repo is connected in the Vercel dashboard

Pushes to `main` deploy to **production** via Vercel.

## Production environment

Set these variables in the Vercel production environment before deploying:

```sh
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MESSAGE_SERVICE_URL=https://your-message-service.onrender.com
NEXT_PUBLIC_MESSAGE_SERVER_URL=wss://your-message-service.onrender.com
NEXT_PUBLIC_USER_SERVICE_URL=https://your-user-service.vercel.app
```

`NEXT_PUBLIC_*` values are embedded during `next build`, so redeploy the client
after changing them. The WebSocket URL must use `wss://` in production and
connects directly to the message service root. Local development defaults to
`ws://localhost:8080`.

On the Vercel User Service, set `CLIENT_ORIGIN` to the production client
origin, without a trailing slash:

```sh
CLIENT_ORIGIN=https://your-client.vercel.app
```

The user service currently allows one client origin. Vercel preview URLs need a
separate backend environment or a deliberate CORS configuration change before
they can call it from the browser.

In the Supabase dashboard, set the production Vercel origin as the Site URL and
allow this OAuth callback URL:

```text
https://your-client.vercel.app/auth/callback
```

## Vercel setup

Connect the repo in the [Vercel dashboard](https://vercel.com/new). Vercel will
detect the Next.js project and create preview deployments for pull requests
automatically.

Optional local linking:

```bash
npm i -g vercel
vercel login
vercel link
```

## Deployment order

1. Apply the user-service and message-service database migrations manually.
2. Deploy the User Service to Vercel and confirm its `/health` endpoint.
3. Deploy the Message Service Render Blueprint and confirm its `/health`
   endpoint.
4. Set both backend service URLs in the client Vercel environment.
5. Set the User Service's `CLIENT_ORIGIN` and the Supabase URL allowlist.
6. Redeploy the Vercel client.
7. Smoke-test authentication, REST calls, and WebSocket reconnect behavior.

Free Render services spin down after 15 minutes without inbound traffic and can
take about a minute to wake. Upgrade the message service to an always-on plan
before depending on real-time availability.

## Local production build

```bash
npm ci
npm run build
npm start
```
