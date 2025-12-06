import express from "express";
import cors from "cors";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { config } from "./config/config.js";
import { connectDB } from "./config/db.js";
import { userRoutes } from "./modules/users/user.routes.js";
import { proposalPostRoutes } from "./modules/proposalPosts/post.routes.js";
const app = express();
const port = config.port;
app.use(cors());
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
