import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['proposal_request', 'proposal_accepted', 'proposal_declined', 'workspace_invite', 'task_assigned', 'meeting_scheduled', 'meeting_started'],
        required: true
    },
    message: { type: String, required: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId, required: true },
    relatedModel: { type: String, enum: ['ProposalPost', 'Workspace', 'Task', 'Meeting'], required: true },
    actionStatus: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
