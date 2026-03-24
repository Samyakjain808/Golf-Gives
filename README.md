# GolfGives ⛳❤️

**GolfGives** is a modern, full-stack subscription platform that combines golf performance tracking, charitable giving, and a monthly prize draw engine. Subscribers log their Stableford scores to enter monthly draws, while a portion of their subscription directly supports verified Irish charities.

Built as part of a technical assignment based on the Digital Heroes PRD.

---

## ✨ Features

- **Subscription System:** Secure monthly (€15) or yearly (€150) subscriptions via **Stripe Checkout** and Webhooks.
- **Score Tracking:** Users log their Stableford scores (1–45). The system maintains a rolling window of the 5 most recent scores, which act as the user's draw entry numbers.
- **Charity Integration:** Users select a charity to support and dedicate a minimum of 10% (up to 50%) of their subscription fee. Includes a standalone direct donation flow.
- **Draw Engine:** Automated monthly draws with a defined prize pool split (40% for 5 matches, 35% for 4 matches, 25% for 3 matches) and jackpot rollover logic.
- **Winner Verification:** Winners are notified and can upload proof for admin verification and payout tracking.
- **Admin Dashboard:** Comprehensive admin suite for managing users, running draw simulations, publishing draws, verifying winners, and viewing financial analytics.
- **Premium UI/UX:** Built with a custom "Deep Forest & Gold" design system, featuring glassmorphism elements, responsive layouts, and smooth animations.

---

## 🛠 Tech Stack

- **Framework:** [Next.js (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + Custom CSS Design System
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth)
- **Payments:** [Stripe](https://stripe.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Emails:** [Resend](https://resend.com/) (Ready for integration)
- **Deployment:** Vercel (Recommended)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn
- A [Supabase](https://supabase.com/) account
- A [Stripe](https://stripe.com/) account

### 2. Environment Variables
Clone the `.env.example` file to create your local environment file:

```bash
cp .env.example .env.local
```

Fill in the required variables in `.env.local`:
- **Supabase:** Find these in your project settings (API).
- **Stripe:** Get your publishable/secret keys from the Stripe Dashboard. Create two Products (Monthly and Yearly) and copy their Price IDs.
- **Resend:** (Optional) Add your Resend API key for email notifications.

### 3. Database Setup
1. Go to your Supabase project dashboard.
2. Navigate to the **SQL Editor**.
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`.
4. Run the SQL script to create all necessary tables, RLS policies, and seed data (charities and the draw configuration).

### 4. Installation
Install the project dependencies:

```bash
npm install
```

### 5. Running the Development Server
Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🗄️ Project Structure

- `/app`: Next.js App Router pages and API routes.
  - `/admin`: Admin dashboard pages (protected).
  - `/api`: API endpoint handlers (Stripe webhooks, score submission, admin actions).
  - `/dashboard`: Subscriber dashboard pages (protected).
- `/lib`: Core platform logic, utility functions, and database clients.
  - `draw-engine.ts`: Logic for simulating and publishing monthly draws.
  - `stripe.ts`: Stripe SDK initialization.
  - `supabase/`: Supabase client configurations (Server, Client, Admin).
- `/supabase/migrations`: SQL scripts for database initialization.

---

## 🔒 Testing Admin Features
To access the Admin Dashboard at `/admin`, you must have the `admin` role.
1. Sign up for an account via the normal flow.
2. Go to your Supabase **Table Editor**.
3. Open the `profiles` table.
4. Locate your user row and change the `role` column from `subscriber` to `admin`.
5. Log back into the app.

---

## 💳 Stripe Webhook Testing
To locally test Stripe webhooks (e.g., successful subscriptions):
1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Authenticate and forward events to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
3. Copy the webhook signing secret output by the command and add it as `STRIPE_WEBHOOK_SECRET` in your `.env.local`.
