# VoteForFeature

**Developer showcase & community review platform.** Developers list their apps, the community explores, rates, and requests features — all in one place.

🔗 **Live:** [vote-for-feature.vercel.app](https://vote-for-feature.vercel.app)

---

## What is it?

VoteForFeature has two core flows:

**1. URL Explorer (Homepage)**
Enter any website URL — the platform creates a shared community space for that domain. Anyone can browse feature requests and reviews for that product without the owner needing to list it publicly.

**2. Community Showcase (`/community`)**
Developers who explicitly list their apps appear here. Other developers and users can discover them, leave star ratings with written reviews, and submit feature requests with upvotes.

---

## Features

### For Developers
- List your app in the community showcase
- Receive star ratings and written reviews from real users
- Feature request board with upvote/downvote system
- Roadmap view — filter requests by status (Pending, Planned, In Progress, Shipped, Rejected)
- Toggle app visibility (public community listing vs. private URL-only access)
- **Truncated reviews** — community members see full reviews; as the product owner you see a preview and can unlock the full text (monetization hook for future)

### For Community Members
- GitHub OAuth sign-in
- Customizable profile: bio, avatar picker (boring-avatars presets, DiceBear styles, or custom URL)
- **Rank system** based on review quality:
  | Rank | Score threshold |
  |---|---|
  | 🔵 Newcomer | 0–9 |
  | 🟢 Reviewer | 10–29 |
  | 🌟 Trusted | 30–74 |
  | 🔶 Expert | 75–149 |
  | 💎 Elite | 150+ |
  
  Score = `likes × 3 − dislikes + reviewCount`
- Like / dislike reviews from other users — feeds their rank score
- Feature requests: submit, upvote/downvote, comment

### UI & Design
- Samsung-inspired design system: lacivert (#1428a0), Galaxy gradient (#3b57fe → #9a9af8)
- Outfit font (geometric sans-serif)
- Canvas-based splash screen animation — "VoteForFuture" → the 'u' falls → "VoteForFeature"
- Premium card hover effects, pill buttons, backdrop blur navbar
- Fully responsive

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth v5 (GitHub OAuth) |
| ORM | Prisma 7 |
| Database | Neon (serverless PostgreSQL) |
| Avatars | boring-avatars + DiceBear |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Database Schema

```
User          — id, name, email, image, bio, role
Product       — id, name, slug, domain (unique), isPublic, category, techStack[]
Review        — rating (1-5), content, @@unique([productId, authorId])
ReviewLike    — type (LIKE/DISLIKE), @@unique([reviewId, userId])
ReviewUnlock  — owner unlocks a truncated review, @@unique([reviewId, userId])
FeatureRequest — title, description, status, category, pinned
Vote          — type (UP/DOWN), @@unique([featureId, userId])
Comment       — content, featureId, authorId
```

---

## Local Development

**Prerequisites:** Node.js 20+, a Neon (or any PostgreSQL) database, GitHub OAuth App

```bash
# 1. Clone
git clone https://github.com/EmreYalavuc/VoteForFeature.git
cd VoteForFeature

# 2. Install dependencies
npm install

# 3. Environment variables
cp .env.example .env
# Fill in: DATABASE_URL, AUTH_SECRET, AUTH_GITHUB_ID, AUTH_GITHUB_SECRET

# 4. Push schema to database
npx prisma migrate deploy

# 5. Generate Prisma client
npx prisma generate

# 6. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon recommended) |
| `AUTH_SECRET` | Random 32-byte base64 string — `openssl rand -base64 32` |
| `AUTH_GITHUB_ID` | GitHub OAuth App Client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App Client Secret |
| `AUTH_TRUST_HOST` | Set to `true` on Vercel |

### GitHub OAuth App setup

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Homepage URL: `http://localhost:3000`
3. Callback URL: `http://localhost:3000/api/auth/callback/github`
4. For production, add: `https://your-domain.vercel.app/api/auth/callback/github`

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage — URL explorer
│   ├── community/page.tsx          # Public developer showcase
│   ├── products/[slug]/page.tsx    # Product detail + reviews + features
│   ├── products/[slug]/roadmap/    # Feature roadmap view
│   ├── profile/[id]/page.tsx       # User profile — bio, rank, reviews, apps
│   ├── dashboard/page.tsx          # Owner dashboard
│   └── api/
│       ├── products/               # CRUD + visibility toggle
│       ├── products/[slug]/reviews/
│       ├── products/[slug]/features/
│       ├── reviews/[id]/like/      # Like/dislike toggle
│       ├── reviews/[id]/unlock/    # Owner unlocks truncated review
│       ├── users/[id]/bio/         # Profile bio update
│       └── users/[id]/avatar/      # Avatar URL update
├── components/
│   ├── layout/                     # Navbar, splash-wrapper
│   ├── ui/                         # Button, Avatar, Stars, RankBadge, etc.
│   ├── products/                   # ProductCard, ReviewCard, ReviewSection, UrlBar
│   ├── features/                   # FeatureCard, FeatureFilters, NewFeatureDialog
│   └── profile/                    # BioEditor, AvatarPicker
├── lib/
│   ├── auth.ts                     # NextAuth config
│   ├── prisma.ts                   # Prisma client singleton
│   └── utils.ts                    # calculateRank, extractDomain, slugify, etc.
└── types/index.ts                  # Shared TypeScript types
```

---

## Deployment

The app is deployed on Vercel with automatic deployments on every push to `master`. Database migrations are run manually via `npx prisma migrate deploy` before deploying breaking schema changes.

---

## Roadmap

- [ ] Review unlock payments (Stripe)
- [ ] File upload for avatars (Vercel Blob)
- [ ] Product screenshots gallery
- [ ] Email notifications for feature request updates
- [ ] Admin moderation panel
- [ ] Topic/tag filtering in community

---

## License

MIT
