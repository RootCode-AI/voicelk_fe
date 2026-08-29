<div align="center">
  <h1>VoiceLK Frontend</h1>
  <p>AI-powered Sinhala text-to-speech learning platform for O/Level ICT students</p>

  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</div>

---

## Overview

VoiceLK allows students to type or paste ICT-related topics and receive AI-generated Sinhala audio responses. The application features:

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
