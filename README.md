# 🍛 MakanMana

> Your AI-powered food plug for discovering the best makan spots in Malaysia 🇲🇾

A modern, conversational food recommendation app that helps you find authentic Malaysian restaurants using AI and real Google Maps reviews. Just ask naturally in Manglish, and we'll hook you up with the best spots!

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🤖 AI-powered chat recommendations using Google Gemini
- 📍 Location-based restaurant search
- 🔍 Real Google Maps reviews via SerpAPI
- 💰 Budget & cuisine filters
- ⭐ AI-powered vibe analysis
- 🖼️ AI-generated food images
- 🔖 Save favorite spots
- 🌙 Dark mode support
- 📱 Fully responsive design

## 🚀 Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **AI:** Google Gemini 2.0 Flash
- **APIs:** SerpAPI (Google Maps search & reviews)
- **UI:** shadcn/ui components

## 🛠️ Quick Start

1. **Install dependencies:**
```bash
bun install
```

2. **Set up environment variables:**
Create `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

3. **Set Supabase secrets:**
- `GEMINI_API_KEY` - Google Gemini API key
- `SERPAPI_KEY` - SerpAPI key

4. **Deploy Edge Functions:**
```bash
supabase functions deploy
```

5. **Run dev server:**
```bash
bun run dev
```

## 📁 Project Structure

```
makanmana/
├── src/
│   ├── components/     # UI components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom hooks
│   └── integrations/   # Supabase client
├── supabase/
│   ├── functions/     # Edge Functions
│   └── migrations/    # Database migrations
└── public/            # Static assets
```

## 🔧 Edge Functions

- **`chat`** - Main AI chat assistant (Gemini 2.0 Flash)
- **`vibecheck`** - Restaurant vibe analysis (Gemini 2.0 Flash)
- **`generate-food-image`** - AI food image generation (Gemini 2.0 Flash)
- **`generate-comment`** - Manglish comments generator

## 🗄️ Database

- `profiles` - User profiles
- `bookmarks` - Saved restaurants
- All tables have Row Level Security (RLS) enabled

## 🎨 Design

Malaysian hawker center vibes with:
- **Sambal Red** - Primary color
- **Pandan Green** - Secondary accents
- **Nasi Cream** - Warm backgrounds
- **Poppins** font - Casual, friendly typography

## 🐛 Troubleshooting

**Edge Function errors?**
- Check Supabase Dashboard → Edge Functions → Logs
- Verify API keys in Secrets
- Check rate limits

**Database errors?**
- Ensure migrations are applied
- Check RLS policies
- Verify user authentication

## 📦 Deployment

Recommended: **Vercel** or **Netlify**

Set environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Build command: `bun run build`
Output: `dist/`

## 👥 Team

**Amirah** 
- Supabase Edge Functions development
- Google Gemini API integration
- SerpAPI integration for Google Maps
- AI prompt engineering

**Syahirah**
- Frontend & AI Groq Integration
- React application architecture
- UI/UX design & implementation
- Responsive design & theming

Built together for **Cursor Hackathon 2025** 🇲🇾

## 📄 License

MIT License

## 🙏 Acknowledgments

- Powered by [Google Gemini](https://ai.google.dev/), [SerpAPI](https://serpapi.com/), and [Supabase](https://supabase.com/)
- Design inspired by Malaysian hawker centers

---

Made with ❤️ in Malaysia
