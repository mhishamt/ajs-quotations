# AJS Quotation System — Deployment Guide
# Time needed: ~20 minutes | Cost: FREE

---

## STEP 1 — Create Supabase Database (5 min)

1. Go to https://supabase.com → Click "Start your project" → Sign up free
2. Click "New Project" → Name it `ajs-quotations` → Set a DB password → Create
3. Wait ~2 minutes for it to set up
4. Go to **SQL Editor** (left sidebar) → Click "New Query"
5. Open the file `supabase_schema.sql` from this folder → Copy ALL content → Paste → Click **Run**
6. You should see "Success. No rows returned"

Now get your keys:
- Go to **Project Settings** → **API**
- Copy **Project URL** → save it (looks like `https://xxxx.supabase.co`)
- Copy **anon public** key → save it (long string starting with `eyJ...`)

---

## STEP 2 — Deploy to Vercel (10 min)

### Option A: Via GitHub (Recommended)

1. Create free account at https://github.com
2. Create new repository → Name it `ajs-quotations` → Public
3. Upload ALL files from this folder to the repository
4. Go to https://vercel.com → Sign up with GitHub
5. Click "Add New Project" → Import your `ajs-quotations` repo
6. Click **Deploy** (default settings are fine)

### Option B: Via Vercel CLI (Technical)

```bash
npm install -g vercel
cd ajs-quotations
vercel deploy
```

---

## STEP 3 — Add Environment Variables (3 min)

After deploying to Vercel:
1. Go to your project on vercel.com
2. Click **Settings** → **Environment Variables**
3. Add these 3 variables:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon key |
| `JWT_SECRET` | Any long random string e.g. `AJS@Quotation#2025!SecretKey` |

4. Click **Save** → Go to **Deployments** → Click **Redeploy**

---

## STEP 4 — First Login

Your app is now live at: `https://your-project.vercel.app`

**Default admin credentials:**
- Username: `admin`
- Password: `Admin@AJS2025`

⚠️ **IMPORTANT:** Change the admin password immediately after first login!
Click the 🔑 key icon in the sidebar → Change Password

---

## STEP 5 — Add Your Team Users

1. Log in as admin
2. Click **👥 Users** in the sidebar
3. Click **Add User** → Fill in details → Choose role and branch access
4. Share the URL and credentials with your team

---

## User Roles

| Role | Can Do |
|------|--------|
| **Admin** | Everything — create/view/delete quotations, manage users |
| **User** | Create and view quotations (no delete, no user management) |

## Branch Access

You can restrict users to specific branches:
- `All Branches` — sees everything
- `Main Company Only` — only sees main company quotations
- `AJS Cooling Solutions Only` — only sees cooling branch
- etc.

---

## Custom Domain (Optional, Free)

If you have `ajsksa.com` already:
1. In Vercel → Settings → Domains → Add `quotations.ajsksa.com`
2. Go to your domain registrar → Add a CNAME record pointing to Vercel
3. Done — your team accesses via `quotations.ajsksa.com`

---

## Quotation Number Prefixes

| Branch | Prefix | Example |
|--------|--------|---------|
| Main Company | QT | QT-2025-001 |
| AJS Cooling Solutions | QT-CS | QT-CS-2025-001 |
| Dora Laundry Services | QT-DL | QT-DL-2025-001 |
| AJS General Contracting | QT-GC | QT-GC-2025-001 |

---

## Need Help?

If you get stuck on any step, message the details and I'll help resolve it.
