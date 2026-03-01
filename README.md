# Research-Nest

**Bridging the Gap Between Collaborative Research and AI-Powered Insights.**

Research-Nest is a cutting-edge, real-time collaboration platform designed for the modern researcher. It provides a unified ecosystem for document co-authoring, research discovery, automated meeting management, and intelligent networking.

## Key Features

### Collaborative Paper Hub
*   **Discovery & Sharing**: A centralized repository to upload, discover, and discuss research papers with **Infinite Scroll** for a seamless browsing experience.
*   **Unified Action System**: Manage your publications with a professional, unified menu for editing, hiding, deleting, and sharing.
*   **Flexible Submissions**: Share full PDF documents or provide just metadata (Title, Abstract, DOI) for quick dissemination of ongoing research.
*   **Public/Archived States**: Control the visibility of your papers with instant "Hide/Show" functionality.

### Intelligent Workspace & Editor
*   **Real-time Co-authoring**: Powered by **Yjs** and **Tiptap**, enabling synchronous document editing with multi-user presence and caret tracking.
*   **Format Flexibility**: Export your work to **PDF** or **DOCX** formats with a single click.
*   **Workspace Management**: Dedicated spaces for projects including shared documents, resource storage, and integrated calendars.

### AI-Powered Research Assistance
*   **AI Metadata Extraction**: Automagically scan and pre-fill paper details (Title, Abstract, co-authors) using LLM-powered OCR.
*   **Intelligent Summarization**: Generate concise summaries, action items, and decision logs from brainstorms and meetings.
*   **Semantic Search**: Advanced filtering by research domains, publication years, and content types.

### Networking & Proposals
*   **Proposal Feed**: Post research ideas or find collaborators with a high-performance, **Infinite Scrolling** feed.
*   **Secure Real-time Messaging**: Built-in communication channels for project coordination and team discussions.
*   **Request PDF Workflow**: Seamlessly request full papers from authors who haven't publicly shared their documents.

---

## Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) & [TanStack Query v5](https://tanstack.com/query/latest)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [DaisyUI 5](https://daisyui.com/)
- **Real-time**: [Yjs](https://yjs.dev/), [Socket.io](https://socket.io/), & [Stream Video SDK](https://getstream.io/video/)
- **Editor**: [Tiptap](https://tiptap.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Backend
- **Engine**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)
- **Auth & Storage**: [Firebase](https://firebase.google.com/)
- **AI Models**: Support for **Groq** (LLaMA 3) & **xAI (Grok)**
- **Real-time**: [Socket.io](https://socket.io/)

Developed with ❤️ by the Research-Nest Team.
