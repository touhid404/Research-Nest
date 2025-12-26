import express from "express";
import cors from "cors";
import { createServer } from "http";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { config } from "./config/config.js";
import { connectDB } from "./config/db.js";
import { userRoutes } from "./modules/users/user.routes.js";
import { proposalPostRoutes } from "./modules/proposalPosts/post.routes.js";
import { messageRoutes } from "./modules/messages/message.routes.js";
import { initializeServer } from "./lib/initialize.server.js";

const app = express();
const httpServer = createServer(app);
const port = config.port;

// Set frontend url can be multiple
const allowedOrigins = [
  config.developmentFrontendURL,
  config.productionFrontendURL
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());
// Serve static files from public directory
app.use('/public', express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Land api
app.get('/', (req, res) => {
  res.send('welcome to research nest')
})

// Auth routes
app.use("/api/auth", authRoutes);

// User routes
app.use('/api/users', userRoutes);

// Proposal post API
app.use('/api/posts', proposalPostRoutes);


// Message routes
app.use('/api/messages', messageRoutes);

// Initialize WebSocket server
const io = initializeServer(httpServer);
app.set("io", io);

connectDB();

httpServer.listen(port, () => {
  console.log(`Research Nest Server running on port ${port}`);
});


export default app;
