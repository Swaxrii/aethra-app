# Aethra

A modern, AI-powered chat assistant built with **Next.js 16**. Aethra features a fully working authentication system, persistent conversation history, project management, and an AI backend powered by NVIDIA NIM — all wrapped in a polished dark interface.

## Features

- **AI Chat with Streaming** — responses stream token by token for a smooth, live experience.
- **Two AI Modes**
  - `Aethra 1.0` — fast and concise (Meta Llama 3.1 8B Instruct).
  - `Aethra 1.1` — deep reasoning for highly precise answers (NVIDIA Nemotron Reasoning).
- **Stop Generation** — interrupt the AI at any time to save tokens; partial output is preserved.
- **Formatted Markdown Replies** — headings, lists, bold, tables, and code blocks render natively, with a one-click **Copy Code** button.
- **Authentication** — register and login with hashed passwords (`bcrypt`), stored in a local JSON database.
- **Persistent Sessions** — stay logged in across reloads via `localStorage`.
- **Projects & Recents** — every conversation is saved permanently; recently accessed ones surface in the sidebar within a 24-hour window.
- **Settings** — edit your profile and fine-tune AI behavior (model, creativity, response length).
- **Conversation Export** — download any chat as a standalone HTML file.
- **Search** — quick access to recent projects and pages (CTRL+M).

## Tech Stack

| Layer      | Technology                                                        |
| ---------- | ----------------------------------------------------------------- |
| Framework  | [Next.js 16](https://nextjs.org/) (App Router)                    |
| Language   | JavaScript (ES Modules, JSX)                                      |
| UI         | React 19, Tailwind CSS v4                                          |
| Styling    | Custom CSS animations + Tailwind utilities                         |
| AI Backend | NVIDIA NIM (OpenAI-compatible API)                                |
| Auth       | `bcryptjs` password hashing, JSON file storage                     |
| Markdown   | `react-markdown` + `remark-gfm`                                    |

## Prerequisites

- **Node.js 18.18 or later** (tested on v24)
- **npm** (or your package manager of choice)
- A **NVIDIA NIM API key** from [build.nvidia.com](https://build.nvidia.com)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a file named `.env.local` in the project root:

```bash
NVIDIA_API_KEY=your-nvidia-nim-api-key
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b
```

| Variable            | Required | Description                                                        |
| ------------------- | -------- | ------------------------------------------------------------------ |
| `NVIDIA_API_KEY`    | Yes      | Your NVIDIA NIM API key.                                           |
| `NVIDIA_BASE_URL`   | No       | NIM API endpoint. Defaults to the NVIDIA hosted API.               |
| `NVIDIA_MODEL`      | No       | Fallback model used when no Aethra version is matched.             |

> The `.env*` files are ignored by Git. Never commit your API key.

### 3. Run in development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production build

```bash
npm run build
npm run start
```

## Project Structure

```
aethra-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/       # Login endpoint
│   │   │   │   ├── register/    # Registration endpoint
│   │   │   │   └── update/      # Profile update endpoint
│   │   │   └── chat/            # AI chat (streaming) endpoint
│   │   ├── auth/                # Login / Register page
│   │   ├── chat/[id]/           # Individual conversation page
│   │   ├── projects/            # All projects page
│   │   ├── settings/            # Profile + AI preferences
│   │   ├── globals.css          # Global styles
│   │   └── animations.css       # CSS animations
│   ├── components/
│   │   ├── Sidebar.jsx          # Navigation + recents + context menu
│   │   ├── SearchModal.jsx      # Global search (CTRL+M)
│   │   ├── AuthGuard.jsx        # Route protection
│   │   ├── Markdown.jsx         # Markdown + code block renderer
│   │   └── Icons.jsx            # Shared SVG icon set
│   └── lib/
│       ├── store.js             # Project / message persistence
│       ├── session.js           # Session + preference helpers
│       ├── ai.js                # AI streaming client
│       └── userDb.js            # JSON database + password hashing
├── data/
│   └── users.json               # User store (created at runtime)
├── public/
└── package.json
```

## How Data Is Stored

- **Users** are stored in `data/users.json`, created on first run. Passwords are hashed with `bcrypt` (10 rounds).
- **Conversations & projects** live in the browser's `localStorage` under the `aethra_projects` key.
- **Session & preferences** are kept in `localStorage` as well.

> Because conversations are stored client-side and users server-side, all data is local to your browser and machine — no external database required.

## Scripts

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start the development server      |
| `npm run build`   | Create a production build         |
| `npm run start`   | Run the production server         |
| `npm run lint`    | Run ESLint                        |

## License

This project is provided for public reference and demonstration. You are free to explore, learn from, and adapt it for your own projects.
