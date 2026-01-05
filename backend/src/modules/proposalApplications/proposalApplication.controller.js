import ProposalApplication from "../../models/proposalApplication.model.js";
import ProposalPost from "../../models/proposalPost.model.js";
import User from "../../models/user.model.js";
import Conversation from "../../models/conversation.model.js";
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


        // 5. Update status of all accepted requests to 'group_formed'
        await ProposalApplication.updateMany(
            { _id: { $in: acceptedRequests.map(r => r._id) } },
            { $set: { status: "group_formed" } }
        );


        // 6. Update ProposalPost status to 'group_formed'
        await ProposalPost.findByIdAndUpdate(proposalPostId, { $set: { status: "group_formed" } });


        res.status(201).json({
            message: "Group formed successfully",
            conversation: newConversation
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



