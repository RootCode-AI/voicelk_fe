<div align="center">
  <h1>VoiceLK Frontend</h1>
  <p>Sinhala-English code-switched text-to-speech powered by neural speech synthesis</p>

  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</div>

---

## Overview

VoiceLK provides a conversational interface for Sinhala-English code-switched text-to-speech, with text normalization, grapheme-to-phoneme processing and VITS-based speech synthesis. The application features:

- **Authentication** — Sign in / Sign up with email or Google
- **Home / Chat** — Submit topics and receive AI responses with Sinhala TTS audio
- **History** — Browse past interactions grouped by date
- **Profile** — Manage account settings and toggle dark mode
- **Help** — FAQ accordion, category cards, and a contact support form
- **Global error handling** — Toast notifications for API and runtime errors

---

## Tech Stack

| | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Styling | CSS-in-JS + Tailwind CSS 4 |
| Icons | Lucide React |
| Linting | Oxlint |

---

## Project Structure

```
voicelk_fe/
├── public/
├── src/
│   ├── assets/
│   │   ├── images/           # Static images
│   │   └── styles/           # Global styles
│   ├── components/
│   │   ├── common/           # Common components (e.g., ErrorBoundary)
│   │   └── layout/           # Layout components (e.g., MainLayout)
│   ├── context/              # React context (e.g., ErrorContext)
│   ├── features/
│   │   └── auth/             # Feature specific components (e.g., AuthPage)
│   ├── hooks/                # Custom React hooks
│   ├── pages/
│   │   ├── Chat/             # Chat interface
│   │   ├── Help/             # Help centre
│   │   ├── History/          # Interaction history
│   │   ├── Home/             # Home prompt input
│   │   ├── Profile/          # User profile & settings
│   │   └── Settings/         # Settings page
│   ├── routes/               # Application routes
│   ├── services/             # API & third-party services (api.js, firebase.js)
│   ├── store/                # Global state management
│   ├── utils/                # Utility functions and constants
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## Getting Started

**Prerequisites:** Node.js >= 18, npm >= 9

```bash
git clone https://github.com/RootCode-AI/voicelk_fe.git
cd voicelk_fe
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Scripts

```bash
npm run dev       # Start dev server with HMR
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run Oxlint
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8000
```

> Variables must be prefixed with `VITE_` to be exposed to the browser. If unset, requests default to relative paths.



## Contributing

```bash
# 1. Create your branch
git checkout -b YourName/dev-v1.0

# 2. Commit your changes
git commit -m "feat: description of your change"

# 3. Push and open a PR
git push origin YourName/dev-v1.0
```

---

<div align="center">
  <sub>Built by <strong>RootCode AI</strong> &nbsp;|&nbsp; <a href="https://github.com/RootCode-AI/voicelk_fe">GitHub</a></sub>
</div>

## SEO and social previews

The public app address defaults to `https://chat.voicelk.dev`. Set
`VITE_SITE_URL` in the build environment if the production origin changes; it must
be an HTTP(S) origin without a path, credentials, query or fragment. Rebuild after
changing it. The app and the product website (`https://voicelk.dev`) have separate
canonical URLs.

The build includes:

- `/sitemap.xml`: the single public app URL. Chat, History, Profile and Settings
  are internal views, not separate URLs or public conversations to index.
- `/robots.txt`: allows crawling and advertises the app sitemap.
- `/llms.txt`: a public product summary and useful links, sourced from
  `seo/llms.txt`. This is an AI-reading aid, not a guaranteed ranking signal.
- `/og.png`: the branded 1731 x 909 PNG for code-switched speech synthesis, sourced from `public/og.png`.
  Open Graph and Twitter large-image cards reference its absolute URL.
- Canonical, title, description, and WebSite / WebApplication structured data in
  the initial HTML. `seo/site.js` keeps the homepage title consistent after React
  loads, while other app views retain their own tab titles.

SEO text files are also available through the Vite development server. In
production, run `npm start` after building. The production server serves these
files with their real content types, redirects `/index.html` to `/`, and returns
404 for nonexistent URLs instead of indexing duplicate copies of the app.

Run `npm run test:seo` to build and verify metadata, configurable canonical URLs,
PNG dimensions, technical product positioning, sitemap contents, and real HTTP responses without backend access.
The optional sitemap `lastmod` is omitted because build time is not necessarily
the date of a content change.

After deployment, open these URLs and submit the app sitemap to both Google
Search Console and Bing Webmaster Tools:

- https://chat.voicelk.dev/sitemap.xml
- https://chat.voicelk.dev/robots.txt
- https://chat.voicelk.dev/llms.txt
- https://chat.voicelk.dev/og.png

A verified domain property for `voicelk.dev` in Google Search Console covers its
subdomains; otherwise add and verify `https://chat.voicelk.dev/` as a URL-prefix
property. Request indexing of the homepage after deployment. Search engines
control indexing and ranking; social services may cache image previews.

References: [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
[Google site names](https://developers.google.com/search/docs/appearance/site-names),
and the [llms.txt proposal](https://llmstxt.org/).
