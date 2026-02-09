import ProposalPost from "../../models/proposalPost.model.js";
import User from "../../models/user.model.js";
import Paper from "../../models/paper.model.js";

export const globalSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim() === "") {
            return res.status(200).json({
                success: true,
                data: {
                    posts: [],
                    users: [],
                    papers: []
                }
            });
        }

        const query = q.trim();
        const regex = new RegExp(query, "i");

        const [posts, users, papers] = await Promise.all([
            // Search Proposal Posts
            ProposalPost.find({
                status: "published",
                $or: [
                    { title: regex },
                    { description: regex },
                    { researchTopic: regex },
                    { interests: regex }
                ]
            })
                .select("title description researchTopic interests ownerUid createdAt")
                .limit(5)
                .lean(),

            // Search Users
            User.find({
                $or: [
                    { name: regex },
                    { username: regex },
                    { occupation: regex },
                    { researchInterests: regex }
                ]
            })
                .select("name username photoURL occupation researchInterests uid")
                .limit(5)
                .lean(),

            // Search Papers
            Paper.find({
                status: "published",
                $or: [
                    { title: regex },
                    { abstract: regex },
                    { researchDomain: regex },
                    { tags: regex },
                    { "user.name": regex }
                ]
            })
                .select("title abstract researchDomain tags user.name createdAt")
                .limit(5)
                .lean()
        ]);

        return res.status(200).json({
            success: true,
            data: {
                posts,
                users,
                papers
            }
        });

    } catch (error) {
        console.error("Global search error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during search"
        });
    }
};
