# 🎮 ClipDex

> **Your gaming highlights, unified and organized.**

ClipDex is a modern web platform that allows gamers to connect their video platforms (YouTube, Twitch, Vimeo) and showcase all their clips in one beautiful portfolio. Think of it as Linktree for gaming content, where you control your videos and ClipDex organizes them.

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-316192?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

![ClipDex Banner](https://via.placeholder.com/1200x400/1a1a2e/eaeaea?text=ClipDex+-+Showcase+Your+Best+Moments)

---

## ✨ Features

- 🎯 **Personal Gaming Portfolio** - Every user gets their own public URL (`clipdex.gg/username`)
- 🎮 **Multi-Game Support** - Organize clips by game with tags and descriptions
- 🔐 **Discord Authentication** - Quick login with your Discord account
- 📹 **YouTube Integration** - Unlimited storage using YouTube as backend
- 🎨 **Clean UI** - Beautiful, responsive interface built with Tailwind CSS
- 📊 **Stats Tracking** - View counts and engagement metrics
- 🔍 **Search & Filter** - Find clips by game, tags, or username
- 🚀 **Zero Installation** - Fully web-based, no downloads required

---

## 🎯 The Problem

As a gamer, you probably have:
- Dozens of gameplay clips scattered across your PC
- No easy way to share your best moments with friends or recruiters
- Clips uploaded to YouTube that get lost in your channel
- No centralized place to showcase your gaming achievements

**ClipDex solves this** by giving you a clean, organized portfolio specifically designed for gaming content.

---

## 🏗️ How It Works

```
┌─────────────┐
│   User      │  1. Login with Discord
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  ClipDex    │  2. Upload your clips
│  Frontend   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Next.js    │  3. Processes & uploads to YouTube
│   API       │     (with randomized title for privacy)
└──────┬──────┘
       │
       ├────────────────────┐
       ▼                    ▼
┌─────────────┐    ┌──────────────┐
│  YouTube    │    │ PostgreSQL   │
│  (Storage)  │    │ (Metadata)   │
└─────────────┘    └──────────────┘
       │                    │
       └────────┬───────────┘
                ▼
         ┌─────────────┐
         │   Public    │  4. Share your profile
         │   Profile   │     clipdex.gg/yourname
         └─────────────┘
```

### Why YouTube as Storage?

- ✅ **Free unlimited storage**
- ✅ **Global CDN** for fast streaming
- ✅ **Automatic transcoding** to multiple qualities
- ✅ **Reliable infrastructure**
- ✅ **No bandwidth costs** for us

Videos are uploaded with randomized titles to a shared ClipDex YouTube channel, making them impossible to find without your profile link. All readable metadata (title, description, tags) lives in our database.

---

## 🚀 Tech Stack

**Frontend:**
- [Next.js 14+](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Shadcn/ui](https://ui.shadcn.com/) - UI components

**Backend:**
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) - Serverless functions
- [NextAuth.js](https://next-auth.js.org/) - Authentication (Discord OAuth)
- [Prisma](https://www.prisma.io/) - Database ORM
- [PostgreSQL](https://www.postgresql.org/) - Database
- [YouTube Data API v3](https://developers.google.com/youtube/v3) - Video uploads

**Infrastructure:**
- [Vercel](https://vercel.com/) - Hosting & deployment
- [Supabase](https://supabase.com/) - PostgreSQL hosting (or Railway/Neon)

---

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or hosted)
- Google Cloud Project with YouTube Data API v3 enabled
- Discord Application for OAuth
- YouTube channel (for storing clips)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/clipdex.git
cd clipdex
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/clipdex"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-string-here"

# Discord OAuth
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# YouTube API
YOUTUBE_CLIENT_ID="your-google-client-id"
YOUTUBE_CLIENT_SECRET="your-google-client-secret"
YOUTUBE_REFRESH_TOKEN="your-refresh-token"
YOUTUBE_CHANNEL_ID="your-channel-id"
```

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔧 Configuration Guides

<details>
<summary><b>Setting up Discord OAuth</b></summary>

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 section
4. Add redirect URL: `http://localhost:3000/api/auth/callback/discord`
5. Copy Client ID and Client Secret to `.env`

</details>

<details>
<summary><b>Setting up YouTube API</b></summary>

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Download credentials and add to `.env`
7. Run the OAuth flow once to get a refresh token

See [docs/youtube-setup.md](docs/youtube-setup.md) for detailed instructions.

</details>

---

## 📁 Project Structure

```
clipdex/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages
│   ├── (dashboard)/       # User dashboard
│   ├── [username]/        # Public profiles
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── clip-card.tsx     # Clip display component
│   └── upload-modal.tsx  # Upload interface
├── lib/                   # Utilities
│   ├── prisma.ts         # Prisma client
│   ├── youtube.ts        # YouTube API wrapper
│   └── auth.ts           # NextAuth config
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
└── types/                # TypeScript types
```

---

## 🎨 Screenshots

### Landing Page
> *Coming soon - in development*

### User Profile
> *Coming soon - in development*

### Dashboard
> *Coming soon - in development*

---

## 🗺️ Roadmap

### Phase 1: MVP (Current) ✅
- [x] Project setup
- [x] Discord authentication
- [ ] YouTube upload integration
- [ ] Basic clip CRUD
- [ ] Public profiles
- [ ] Responsive UI

### Phase 2: Enhanced UX
- [ ] Tag autocomplete
- [ ] Global search
- [ ] View count sync from YouTube
- [ ] Custom thumbnails
- [ ] Featured clips
- [ ] SEO optimization

### Phase 3: Video Editor 🔮
- [ ] Clip trimming
- [ ] Multi-clip joining
- [ ] FFmpeg.wasm integration
- [ ] Upload queue

### Phase 4: Community Features 🔮
- [ ] Like/favorite system
- [ ] Comments
- [ ] Trending page
- [ ] Follow system
- [ ] Notifications

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Guidelines

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by the need for better gaming clip organization
- Built with amazing open-source tools
- Thanks to the gaming community for feedback and support

---

## 📧 Contact

**Project Maintainer:** [Your Name](https://github.com/yourusername)

**Project Link:** [https://github.com/yourusername/clipdex](https://github.com/yourusername/clipdex)

**Live Demo:** Coming soon!

---

<div align="center">

### ⭐ Star this repo if you find it useful!

Made with ❤️ by gamers, for gamers.

[Report Bug](https://github.com/yourusername/clipdex/issues) · [Request Feature](https://github.com/yourusername/clipdex/issues)

</div>