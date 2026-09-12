# Deployment

ChitChat Client deploys to [Vercel](https://vercel.com) with GitHub Actions for CI and preview/production deploys.

## What runs on each pull request

1. **CI** (`.github/workflows/ci.yml`) — installs dependencies and runs `npm run build`
2. **Vercel Deploy** (`.github/workflows/vercel-deploy.yml`) — builds and deploys a preview URL, then comments the link on the PR

Pushes to `main` deploy to **production**.

## One-time Vercel setup

### 1. Create a Vercel project

```bash
npm i -g vercel
vercel login
vercel link
```

When prompted:
- **Set up and deploy?** Yes
- **Which scope?** Your account or team
- **Link to existing project?** No (first time)
- **Project name?** `chitchat-client` (or similar)
- **Directory?** `./`

This creates `.vercel/project.json` locally (gitignored).

### 2. Add GitHub secrets

From `.vercel/project.json`:

```json
{
  "orgId": "team_xxxx",
  "projectId": "prj_xxxx"
}
```

Create a Vercel token at [vercel.com/account/tokens](https://vercel.com/account/tokens), then add these repository secrets at **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|-------|
| `VERCEL_TOKEN` | Your Vercel API token |
| `VERCEL_ORG_ID` | `orgId` from `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `projectId` from `.vercel/project.json` |

Using GitHub CLI:

```bash
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID
```

### 3. Push and open a pull request

Once secrets are configured, every PR will:
- Run the build check
- Deploy a Vercel preview
- Post the preview URL as a PR comment

## Alternative: Vercel GitHub integration

Instead of the GitHub Actions deploy workflow, you can connect the repo directly in the [Vercel dashboard](https://vercel.com/new). Vercel will automatically create preview deployments for pull requests.

If you use the dashboard integration, disable or delete `.github/workflows/vercel-deploy.yml` to avoid duplicate deployments.

## Local production build

```bash
npm ci
npm run build
npm start
```
