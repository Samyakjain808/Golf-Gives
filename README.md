# GolfGives 🏌️ — Golf Charity Subscription Platform

A production-ready full-stack web application where golfers subscribe monthly, submit scores, enter a monthly prize draw, and support their chosen Irish charity.

**Live:** [golf-gives-delta.vercel.app](https://golf-gives-delta.vercel.app)

---

## Features

- **Golf Score Tracking** — Submit up to 5 scores per month (1–45 range) to enter the draw
- **Monthly Prize Draw** — Automated draw engine matches 5 random numbers against eligible subscriber scores
- **Charity Support** — Choose from 8 Irish charities to receive a portion of subscription revenue
- **Stripe Subscriptions** — Monthly (€15) and Yearly (€150) plans via Stripe Checkout
- **Admin Dashboard** — Manage draws, verify winners, view users and analytics
- **Email Notifications** — Welcome emails, draw results, and winner alerts via Resend

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database & Auth | Supabase (PostgreSQL + Row Level Security) |
| Payments | Stripe (Subscriptions + Webhooks) |
| Email | Resend |
| Deployment | Vercel |
| Language | TypeScript |

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/Samyakjain808/Golf-Gives.git
cd Golf-Gives
npm install
```

### 2. Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...

RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Run the migrations in Supabase SQL Editor in order:

1. `supabase/migrations/001_initial_schema.sql` — Tables, RLS policies, triggers, seed charities
2. `supabase/migrations/002_rls_patch.sql` — Additional RLS policy fixes

Then run the RLS recursion fix (required):

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

ALTER POLICY "Admin full access profiles" ON profiles USING (is_admin());
ALTER POLICY "Admin full access subscriptions" ON subscriptions USING (is_admin());
ALTER POLICY "Admin full access scores" ON scores USING (is_admin());
ALTER POLICY "Admin full access charities" ON charities USING (is_admin());
ALTER POLICY "Admin read all selections" ON user_charity_selections USING (is_admin());
ALTER POLICY "Admin full access draws" ON draws USING (is_admin());
ALTER POLICY "Admin full access entries" ON draw_entries USING (is_admin());
ALTER POLICY "Admin full access prizes" ON prizes USING (is_admin());
ALTER POLICY "Admin full access winners" ON winners USING (is_admin());
ALTER POLICY "Admin full access contributions" ON charity_contributions USING (is_admin());
ALTER POLICY "Admin full access config" ON draw_config USING (is_admin());
```

### 4. Run Locally

```bash
npm run dev
```

---

## Stripe Setup

1. Create Monthly and Yearly subscription products in the Stripe Dashboard
2. Copy the Price IDs into your env vars
3. Add a webhook endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
4. Listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
5. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`

---

## Vercel Deployment

Add all environment variables from `.env.local` to your Vercel project settings, then redeploy. Required variables on Vercel:

- `SUPABASE_SERVICE_ROLE_KEY` ← critical for webhook to write to database
- `STRIPE_WEBHOOK_SECRET` ← must match the Stripe dashboard endpoint secret
- `RESEND_API_KEY` ← for email notifications (optional — platform works without it)

---

## Admin Setup

To grant admin access, update the `role` column in the `profiles` table:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

Then access `/admin` on the live site.

---

## Draw Flow (Admin)

1. Navigate to **Admin → Draws**
2. Select a month and click **+ Create draw**
3. Click **Simulate** — runs the draw engine and marks draw as `simulated`
4. Review the drawn numbers and results
5. Click **Publish** — notifies winners, makes results visible in Draw History

Eligibility: subscriber must have `status = 'active'` and at least 5 scores submitted that month.

---

## Project Structure

```
app/
├── (public)         landing, pricing, charities, how-it-works, donate
├── auth/            login, signup
├── dashboard/       subscriber dashboard
├── admin/           draws, winners, users, analytics
├── api/
│   ├── stripe/      checkout, webhook
│   ├── admin/       draws CRUD, simulate, publish
│   └── scores/      score management
lib/
├── supabase/        server + admin clients
├── stripe.ts        stripe client
├── email.ts         resend email templates
└── draw-engine.ts   prize draw logic
supabase/
└── migrations/      SQL schema files
```
