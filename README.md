# Research-Nest

A collaborative research platform designed to bridge the gap between researchers with real-time tools and AI-powered insights.

## Core Features

### Real-time Collaboration
- **Interactive Workspace:** Synchronous document editing and brainstorming using Yjs and WebSockets.
- **Collaborative Paper Hub:** Centralized system for uploading, discovering, and discussing research publications.

### AI-Powered Capabilities
- **Meeting Summarizer:** Automatic generation of summaries, action items, and decision logs from chats.
- **Paper Summarizer:** AI-driven extraction of abstracts and conclusions from research papers.
- **Intelligent Spellcheck:** Strategic spell correction for research documentation.

### Networking & Proposals
- **Research Proposal System:** Post research ideas or apply to join existing collaborative teams.
- **Secure Messaging:** Real-time communication channels for project coordination.
- **Notification Engine:** Instant updates on proposal status, messages, and workspace activity.

### Researcher Portfolios
- **Professional Profiles:** Showcase expertise, contributions, and active projects.

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
# Configure .env file
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Configure .env file
npm run dev
```

### 3. AI API Setup
Research-Nest uses external LLMs for features like meeting summarization and intelligent spellcheck. It supports **Groq** (recommended for speed) and **xAI (Grok)**.

#### Obtaining an API Key
- **Groq (Free Tier available):**
  1. Go to the [Groq Cloud Console](https://console.groq.com/).
  2. Sign up or log in.
  3. Navigate to **API Keys** and click **Create API Key**.
  4. Copy your key (starts with `gsk_`).

- **xAI Grok:**
  1. Go to the [x.AI Console](https://console.x.ai/).
  2. Sign up or log in.
  3. Create a new API key (starts with `xai-`).

#### Configuration
In your `backend/.env` file, add your key:
```env
GROQ_API_KEY=your_api_key_here
```
*(The system automatically detects the provider based on the key's prefix.)*

## Tech Stack
- **Frontend:** React, Tailwind CSS, DaisyUI, Zustand, TanStack Query, Yjs.
- **Backend:** Node.js, Express, MongoDB, Socket.io, Firebase, Groq/Grok API, Stream Chat.
