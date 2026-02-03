# FictionForge

A modern web fiction platform built with Next.js, Supabase, and Tailwind CSS.

## Features

- 📖 Beautiful reading experience with dark mode
- ✍️ Rich text editor with LitRPG stat boxes
- 👥 Author profiles and story management
- 💬 Chapter comments with sorting
- ❤️ Chapter likes for reader feedback
- 📢 Author announcements (without breaking bookmarks)
- 📚 Personal library with reading lists

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **Editor**: Tiptap (coming soon)

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/onedollarbanana/FictionForge.git
cd FictionForge
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup, profile)
│   ├── auth/              # Auth callbacks
│   ├── browse/            # Story discovery
│   └── author/            # Author dashboard (protected)
├── components/            # React components
│   └── ui/               # shadcn/ui components
└── lib/                  # Utilities and hooks
    ├── supabase/         # Supabase clients
    └── hooks/            # Custom React hooks
```

## Testing

```bash
npm test
```

## Deployment

This project is configured for deployment on Vercel. Push to main and Vercel will automatically deploy.

## License

MIT
