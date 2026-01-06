# Research-Nest

A collaborative research platform. This project consists of a React-based frontend and a Node.js/Express-based backend.

## Project Idea

Research-Nest is designed to bridge the gap between researchers by providing a centralized, collaborative environment. It allows users to share research papers, propose new research ideas, apply for collaborative positions, and work together in real-time virtual workspaces. The goal is to streamline the research process and foster global scientific collaboration.

## Main Features

- **Real-time Collaborative Workspace:** Integrated virtual environment using Yjs and WebSockets for synchronous document editing and brainstorming.
- **Research Proposal System:** Users can post research proposals, allowing others to view and apply to join the research team.
- **Paper Hub:** A dedicated space for uploading, discovering, and discussing research papers and publications.
- **Real-time Messaging:** Secure communication channels for team members to coordinate their work.
- **Notification System:** Instant alerts for proposal applications, new messages, and workspace updates.
- **User Profiles & Portfolio:** Showcasing researcher expertise, contributions, and active projects.

## Project Structure

```text
Research-Nest/
├── frontend/     # React + Vite Application
└── backend/      # Node.js + Express Server
```

## Tech Stack

### Frontend
- **Framework:** [React](https://reactjs.org/) (v19)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [DaisyUI](https://daisyui.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching:** [TanStack Query](https://tanstack.com/query/latest)
- **Other Tools:** Axios, Framer Motion, React Router, Socket.io-client, Firebase.

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Web Framework:** [Express](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) (via Mongoose)
- **Real-time / Collaboration:** Socket.io, Yjs, y-websocket, lib0
- **Storage:** Firebase Admin, Multer
- **Other Tools:** dotenv, cors, nodemon.