import express from "express";
import multer from "multer";
import cors from "cors";
import { createServer } from "http";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { config } from "./config/config.js";
import { connectDB } from "./config/db.js";
import { userRoutes } from "./modules/users/user.routes.js";
import { proposalPostRoutes } from "./modules/proposalPosts/post.routes.js";
import proposalApplicationRoutes from "./modules/proposalApplications/proposalApplication.routes.js";
import { messageRoutes } from "./modules/messages/message.routes.js";
import { initializeServer } from "./lib/initialize.server.js";
import { paperRoutes } from "./modules/papers/paper.routes.js";
import { workspaceRoutes } from "./modules/workspace/workspace.routes.js";
import "./cron/pingSelf.js";
import { aiRoutes } from "./modules/ai-services/ai.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";


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


// Proposal application routes
app.use('/api/requests', proposalApplicationRoutes);

// Paper routes
app.use('/api/papers', paperRoutes);

// Workspace routes
app.use('/api/workspaces', workspaceRoutes);


// Message routes
app.use('/api/messages', messageRoutes);

// AI Routes
app.use('/api/ai', aiRoutes);

// Notification Routes
app.use('/api/notifications', notificationRoutes);




// Initialize WebSocket server
const io = initializeServer(httpServer);
app.set("io", io);

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'File is too large! Maximum limit is 10MB per file.' });
        }
        return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
        // Handle custom filter errors (like "Only PDF files are allowed!")
        return res.status(400).json({ success: false, message: err.message });
    }
    next();
});

connectDB();


httpServer.listen(port, () => {
    console.log(`Research Nest Server running on port ${port}`);
});




export default app;



