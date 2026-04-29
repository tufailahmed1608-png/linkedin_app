# Signal — LinkedIn Analytics Tracker

A personal analytics tracker for thought-leadership content. Comments-per-post is the metric that matters.

## Features

- **Dashboard** — log posts, see your north-star metric (comments per post)
- **Insights** — AI-generated pattern analysis from your data
- **Idea Lab** — AI generates 3 post ideas tuned to your voice

Data is stored in your browser's localStorage. No backend database.

---

## Deployment to Vercel — Step by Step

### Step 1: Get an Anthropic API key (5 minutes)

1. Go to https://console.anthropic.com
2. Sign up or log in
3. Go to **Settings → API Keys**
4. Click **Create Key**, give it a name like "Signal App", copy the key
5. **Add at least $5 of credits** (Settings → Billing). Each insight or idea generation costs roughly $0.01–0.03.

### Step 2: Deploy to Vercel (5 minutes)

**Option A — Drag & drop (easiest):**

1. Go to https://vercel.com/signup and sign up (use your GitHub or Google account)
2. Once logged in, click **Add New → Project**
3. Click **Deploy** → look for the option to **upload a folder**
4. Drag this entire `signal-app` folder into Vercel
5. Before clicking Deploy, click **Environment Variables**
6. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** (paste the key from Step 1)
7. Click **Deploy**
8. Wait ~1 minute. You'll get a URL like `signal-app-xxxx.vercel.app`

**Option B — Via GitHub (more polished, takes 10 minutes):**

1. Create a free GitHub account if you don't have one
2. Create a new repository called `signal-app`, upload all these files
3. On Vercel, click **Add New → Project → Import from GitHub**
4. Select your repo
5. Add the `ANTHROPIC_API_KEY` environment variable as in Option A
6. Click Deploy

### Step 3: Use it

Open the URL on your phone, bookmark it to your home screen. Done.

To get a custom domain (e.g. `signal.tufailahmed.com`), add it in Vercel **Project Settings → Domains**. Free.

---

## Local development (optional)

```bash
npm install
# Create a .env.local file with: ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

Note: local dev needs a slightly different setup for the API route. The Vercel deployment handles this automatically.

---

## Cost

- Vercel hosting: **Free** (Hobby plan)
- Anthropic API: **~$0.01–0.03 per AI generation**. For typical use (a few insights and idea generations per week), expect under $5/month.
- Custom domain (optional): ~$10/year

## Privacy

- Your post data is stored in your browser only. It never leaves your device.
- Only the prompt for AI features is sent to Anthropic, via your own API key.
