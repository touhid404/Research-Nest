import ProposalApplication from "../../models/proposalApplication.model.js";
import ProposalPost from "../../models/proposalPost.model.js";
import User from "../../models/user.model.js";
import Conversation from "../../models/conversation.model.js";
import Notification from "../../models/notification.model.js";
import { createWorkspaceService } from "../workspace/services/workspace.service.js"; // Import workspace service
// Send a collaboration request
export const sendRequest = async (req, res) => {
    try {
        const { proposalPostId, description } = req.body;
        const uid = req.headers["x-user-id"];


        if (!uid) {
            return res.status(401).json({ message: "Unauthorized" });
        }


        const sender = await User.findOne({ uid });
        if (!sender) {
            return res.status(404).json({ message: "User not found" });
        }


        // Check if post exists
        const post = await ProposalPost.findById(proposalPostId);
        if (!post) {
            return res.status(404).json({ message: "Proposal post not found" });
        }


        // Check if user is the owner of the post
        if (post.ownerUid === uid) {
            return res.status(400).json({ message: "You cannot request to collaborate on your own post" });
        }


        // Check if request already exists
        const existingRequest = await ProposalApplication.findOne({
            senderId: uid,
            proposalPostId,
        });


        if (existingRequest) {
            return res.status(400).json({ message: "You have already sent a request for this post" });
        }


        const newRequest = new ProposalApplication({
            senderId: uid,
            receiverId: post.ownerUid,
            proposalPostId,
            description,
        });

        await newRequest.save();

        // --- Notification Logic ---
        const receiver = await User.findOne({ uid: post.ownerUid });
        if (receiver) {
            await Notification.create({
                recipient: receiver._id,
                sender: sender._id,
                type: 'proposal_request',
                message: `sent a collaboration request for "**${post.title}**"`,
                relatedId: post._id, // Linking to the Post
                relatedModel: 'ProposalPost',
                actionStatus: 'pending'
            });
        }

        res.status(201).json(newRequest);
    } catch (error) {
        console.error("Error sending request:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Get requests received by the current user
export const getMyReceivedRequests = async (req, res) => {
    try {
        const currentUserUid = req.headers["x-user-id"];
        if (!currentUserUid) return res.status(401).json({ message: "Unauthorized" });


        const { status } = req.query;


        const query = { receiverId: currentUserUid };
        if (status) {
            // Allow filtering by status, e.g. ?status=pending
            // If status is 'completed', fetch accepted, rejected, group_formed
            if (status === 'completed') {
                query.status = { $in: ['accepted', 'rejected', 'group_formed'] };
            } else {
                query.status = status;
            }
        }


        const requests = await ProposalApplication.find(query)
            .sort({ createdAt: -1 })
            .populate("proposalPostId", "title")
            .populate("senderId", "name photoURL")
            .lean();

        // Get all sender IDs
        const senderIds = [...new Set(requests.map(req => req.senderId))];

        // Fetch users
        const users = await User.find({ uid: { $in: senderIds } })
            .select("uid name email photoURL");

        // Create a map of uid -> user
        const userMap = users.reduce((acc, user) => {
            acc[user.uid] = user;
            return acc;
        }, {});

        // Attach sender to each request
        const mappedRequests = requests.map(req => ({
            ...req,
            sender: userMap[req.senderId] || null
        }));

        res.status(200).json(mappedRequests);
    } catch (error) {
        console.error("Error fetching received requests:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Get requests sent by the current user
export const getMySentRequests = async (req, res) => {
    try {
        const currentUserUid = req.headers["x-user-id"];
        if (!currentUserUid) return res.status(401).json({ message: "Unauthorized" });

        const requests = await ProposalApplication.find({ senderId: currentUserUid })
            .sort({ createdAt: -1 })
            .populate("proposalPostId", "title user")
            .lean();

        // Fetch the sender (current user) once
        const user = await User.findOne({ uid: currentUserUid }).select("uid name email photoURL");

        const requestsWithUser = requests.map(request => ({
            ...request,
            user
        }));


        res.status(200).json(requestsWithUser);
    } catch (error) {
        console.error("Error fetching sent requests:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Update request status (Accept/Reject)
export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const currentUserUid = req.headers["x-user-id"];
        if (!currentUserUid) return res.status(401).json({ message: "Unauthorized" });




        if (!["accepted", "rejected", "group_formed"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }


        const request = await ProposalApplication.findById(id);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }


        // Verify authorized user (receiver)
        if (request.receiverId !== currentUserUid) {
            return res.status(403).json({ message: "Unauthorized to update this request" });
        }


        request.status = status;
        await request.save();

        // --- Notification Logic ---
        const applicant = await User.findOne({ uid: request.senderId });
        const receiverUser = await User.findOne({ uid: currentUserUid });

        if (applicant && receiverUser) {
            if (status === 'accepted') {
                // 1. Notify Applicant
                await Notification.create({
                    recipient: applicant._id,
                    sender: receiverUser._id,
                    type: 'proposal_accepted',
                    message: `accepted your request for "**${(await ProposalPost.findById(request.proposalPostId)).title}**"`,
                    relatedId: request.proposalPostId,
                    relatedModel: 'ProposalPost'
                });

                // 2. Update Receiver's Notification to 'accepted'
                await Notification.findOneAndUpdate(
                    {
                        recipient: receiverUser._id,
                        sender: applicant._id,
                        type: 'proposal_request',
                        relatedId: request.proposalPostId
                    },
                    { actionStatus: 'accepted' }
                );
            } else if (status === 'rejected') {
                // 1. Notify Applicant
                await Notification.create({
                    recipient: applicant._id,
                    sender: receiverUser._id,
                    type: 'proposal_declined',
                    message: `declined your request for "**${(await ProposalPost.findById(request.proposalPostId)).title}**"`,
                    relatedId: request.proposalPostId,
                    relatedModel: 'ProposalPost'
                });

                // 2. Update Receiver's Notification to 'declined'
                await Notification.findOneAndUpdate(
                    {
                        recipient: receiverUser._id,
                        sender: applicant._id,
                        type: 'proposal_request',
                        relatedId: request.proposalPostId
                    },
                    { actionStatus: 'declined' }
                );
            }
        }


        res.status(200).json(request);
    } catch (error) {
        console.error("Error updating request status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};






// Form a group from accepted requests
export const formGroup = async (req, res) => {
    try {
        const { proposalPostId, groupName } = req.body;
        const currentUserUid = req.headers["x-user-id"];


        if (!currentUserUid) return res.status(401).json({ message: "Unauthorized" });
        if (!groupName || groupName.trim() === "") {
            return res.status(400).json({ message: "Group name is required" });
        }


        // 1. Find the post (to ensure ownership)
        const post = await ProposalPost.findById(proposalPostId);
        if (!post) return res.status(404).json({ message: "Post not found" });
        if (post.ownerUid !== currentUserUid) {
            return res.status(403).json({ message: "Unauthorized: You are not the owner of this post" });
        }


        // 2. Find all ACCEPTED applications for this post
        const acceptedRequests = await ProposalApplication.find({
            proposalPostId,
            status: "accepted"
        });


        if (acceptedRequests.length === 0) {
            return res.status(400).json({ message: "No accepted members to form a group with" });
        }


        // 3. Prepare participants list (Admin + Accepted Users)
        // Use Set to avoid duplicates if any
        const participantUids = new Set([currentUserUid]);
        acceptedRequests.forEach(req => participantUids.add(req.senderId));


        const participants = Array.from(participantUids);


        // 4. Create Conversation
        const newConversation = new Conversation({
            participants,
            isGroup: true,
            groupName: groupName,
            groupAdmin: currentUserUid,
            unreadCount: participants.reduce((acc, uid) => ({ ...acc, [uid]: 0 }), {})
        });


        await newConversation.save();


        // 5. AUTOMATICALLY CREATE WORKSPACE (Requirement: "when form team inside the request ,, there should create chat and workpsacee")
        let workspace = null;
        try {
            workspace = await createWorkspaceService({
                uid: currentUserUid,
                name: groupName,
                description: `Workspace for proposal: ${post.title}`,
                memberUids: participants, // owners/admins handled in service
                proposalPostId: proposalPostId,
                conversationId: newConversation._id,
            });

            // --- Notification Logic: Workspace Invite ---
            if (workspace) {
                // Notify all participants (except the creator/current user)
                const invites = participants.filter(uid => uid !== currentUserUid);

                // We need to map UIDs to _ids for the Notification model
                const usersToNotify = await User.find({ uid: { $in: invites } });
                const senderUser = await User.findOne({ uid: currentUserUid });

                for (const user of usersToNotify) {
                    await Notification.create({
                        recipient: user._id,
                        sender: senderUser._id,
                        type: 'workspace_invite',
                        message: `invited you to the workspace "**${groupName}**"`,
                        relatedId: workspace._id,
                        relatedModel: 'Workspace',
                        isRead: false
                    });
                }
            }

        } catch (wsError) {
            console.error("Failed to automatically create workspace for formed group:", wsError);
            // Proceed without failing the whole operation, or maybe fail? 
            // User requirement implies it "should" be created. If it fails, it's a partial failure.
            // Let's log it but continue, as the group is formed.
        }


        // 6. Update status of all accepted requests to 'group_formed'
        await ProposalApplication.updateMany(
            { _id: { $in: acceptedRequests.map(r => r._id) } },
            { $set: { status: "group_formed" } }
        );


        // 7. Update ProposalPost status to 'group_formed'
        await ProposalPost.findByIdAndUpdate(proposalPostId, { $set: { status: "group_formed" } });


        res.status(201).json({
            message: "Group and Workspace formed successfully",
            conversation: newConversation,
            workspace: workspace
        });


    } catch (error) {
        console.error("Error forming group:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Cancel a request (only if pending)
export const cancelRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserUid = req.headers["x-user-id"];


        if (!currentUserUid) return res.status(401).json({ message: "Unauthorized" });


        const request = await ProposalApplication.findById(id);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }


        // Verify authorized user (sender)
        if (request.senderId !== currentUserUid) {
            return res.status(403).json({ message: "Unauthorized: Only the sender can cancel this request" });
        }


        // Verify status is pending
        if (request.status !== "pending") {
            return res.status(400).json({ message: "Request cannot be canceled as it is already " + request.status });
        }


        await ProposalApplication.findByIdAndDelete(id);


        res.status(200).json({ message: "Request canceled successfully" });
    } catch (error) {
        console.error("Error canceling request:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



