# SmartCard - Digital Business Cards with NFC & QR

A complete SaaS platform for creating, sharing, and tracking digital business cards using NFC technology and QR codes. Built with Next.js, Neon PostgreSQL, NextAuth, and Stripe.

## Features

### Core Features
- 🎴 **Digital Business Cards** - Create customizable business cards with your professional info
- 📱 **QR Code Generation** - Auto-generate unique QR codes for each card
- 🔗 **Link Sharing** - Share profiles via direct links
- 📊 **Real-time Analytics** - Track profile views, QR scans, and NFC taps
- 🌍 **Public Profiles** - Shareable public profile pages
- 💾 **Contact Export** - Visitors can save your contact as vCard

### Plan Features

**Free Plan**
- 1 Business Card
- QR Code Generation
- Basic Analytics (30 days)
- Profile Link Sharing

**Basic Plan ($9/month)**
- Up to 5 Business Cards
- QR Code Generation
- Advanced Analytics (90 days)
- Custom Card Colors
- Priority Email Support

**Pro Plan ($29/month)**
- Unlimited Business Cards
- Advanced Analytics (1 year)
- Custom Card Colors & Fonts
- Team Members (up to 5)
- API Access
- Priority Support

**Premium Plan ($99/month)**
- Unlimited Everything
- Custom Domain Support
- Unlimited Team Collaboration
- Advanced Analytics & Reports
- White-label Options
- 24/7 Dedicated Support

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4, shadcn/ui
- **Database**: Neon (PostgreSQL Serverless)
- **Authentication**: NextAuth.js with Email/Password
- **Payments**: Stripe for subscriptions
- **Charts**: Recharts for analytics visualization
- **QR Codes**: qrcode library

## Project Structure

```
app/
├── (auth)/
│   ├── login/        # Login page
│   └── signup/       # Registration page
├── (dashboard)/
│   ├── dashboard/    # Card management
│   ├── analytics/    # Analytics dashboard
│   ├── settings/     # User settings & subscriptions
│   └── upgrade/      # Upgrade/pricing page
├── api/
│   ├── auth/         # Authentication endpoints
│   ├── cards/        # Card CRUD operations
│   ├── analytics/    # Analytics data
│   ├── checkout/     # Stripe checkout
│   ├── webhooks/     # Stripe webhooks
│   └── user/         # User profile
├── cards/
│   └── [cardId]/qr/  # QR code sharing page
├── u/
│   └── [userId]/     # Public profile pages
└── page.tsx          # Landing page

components/
├── navbar.tsx        # Navigation bar
├── hero.tsx          # Hero section
├── features.tsx      # Features grid
├── pricing.tsx       # Pricing section
├── faq.tsx          # FAQ section
├── footer.tsx       # Footer
└── dashboard-nav.tsx # Dashboard navigation

lib/
├── db.ts            # Database utilities
├── auth.ts          # Authentication functions
├── cards.ts         # Card operations
├── analytics.ts     # Analytics functions
└── subscriptions.ts # Subscription logic
```

## Setup Instructions

### 1. Clone and Install

```bash
npm install
# or
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file with:

```env
# Database (Neon)
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-string-at-least-32-chars

# Stripe (optional, for payments)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Database Setup

The database schema will be created automatically on first connection. Tables include:
- `users` - User accounts
- `business_cards` - Saved cards
- `social_links` - Social media links
- `analytics_events` - View/scan tracking
- `subscriptions` - Plan information

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Pages

### Public Pages
- `/` - Landing page with features, pricing, FAQ
- `/signup` - User registration
- `/login` - User login
- `/u/[userId]` - Public profile page
- `/cards/[cardId]/qr` - QR code sharing page

### Authenticated Pages
- `/dashboard` - Card list and management
- `/dashboard/cards/new` - Create new card
- `/dashboard/cards/[cardId]` - Edit card
- `/dashboard/analytics` - View analytics
- `/dashboard/settings` - Profile and subscription
- `/dashboard/upgrade` - Upgrade plan

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/[...nextauth]` - NextAuth routes

### Cards
- `GET /api/cards` - List user's cards
- `POST /api/cards` - Create card
- `GET /api/cards/[cardId]` - Get card details
- `PUT /api/cards/[cardId]` - Update card
- `DELETE /api/cards/[cardId]` - Delete card

### Analytics
- `GET /api/analytics/[cardId]` - Get card analytics

### Billing
- `POST /api/checkout` - Create checkout session
- `POST /api/webhooks/stripe` - Stripe webhook handler

### User
- `PUT /api/user/profile` - Update user profile

## Features Implementation Status

### Phase 1: Authentication ✅
- Email/password authentication
- Secure password hashing with bcrypt
- NextAuth session management
- Protected routes

### Phase 2: Landing Page ✅
- Hero section with CTA
- Features showcase
- Pricing comparison
- FAQ accordion
- Responsive design

### Phase 3: Dashboard ✅
- Card creation form
- Card listing
- Card editing
- Card deletion
- Live card preview

### Phase 4: Public Profiles ✅
- Public profile pages
- QR code generation and download
- Shareable links
- Contact saving (vCard)
- Social links display

### Phase 5: Analytics ✅
- View tracking
- QR scan tracking
- Location analytics
- Activity timeline
- Charts and trends

### Phase 6: Subscriptions ✅
- Stripe integration
- Checkout flow
- Plan management
- Feature gating
- Webhook handling

## Deployment

### Deploy to Vercel

```bash
vercel
```

Set environment variables in Vercel dashboard:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Future Enhancements

- [ ] NFC card physical fulfillment integration
- [ ] Custom domain support
- [ ] Team collaboration features
- [ ] Advanced styling options
- [ ] Integration with CRM systems
- [ ] Mobile app
- [ ] Video cards
- [ ] Advanced segmentation
- [ ] A/B testing for cards

## Security

- Passwords hashed with bcrypt
- Secure session management with JWT
- CSRF protection via NextAuth
- SQL injection prevention via parameterized queries
- Rate limiting recommended for production
- Environment variables for secrets

## Performance

- Database indexes on frequently queried columns
- Server-side rendering for SEO
- Image optimization
- Code splitting via Next.js
- Caching strategies

## Support

For issues and questions:
- Email: support@smartcard.app
- Documentation: [docs link]

## License

MIT
