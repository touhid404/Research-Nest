import express from "express";
import cors from "cors";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { config } from "./config/config.js";
import { connectDB } from "./config/db.js";
import { userRoutes } from "./modules/users/user.routes.js";
import { proposalPostRoutes } from "./modules/proposalPosts/post.routes.js";
const app = express();
const port = config.port;
// Set frontend url can be multiple
const allowedOrigins = [
  "http://localhost:5173",
  "https://research-nest.netlify.app",
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
// land api
app.get('/', (req, res) => {
    res.send('welcome to research nest')
})
// Auth routes
app.use("/api/auth", authRoutes);
// User routes
app.use('/api/users',userRoutes);
// Proposal post API
app.use('/api/posts',proposalPostRoutes);

app.listen(port, () => {
    console.log(`Research Nest Server running on port ${port}`);
    connectDB();
});
