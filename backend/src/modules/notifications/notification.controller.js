import Notification from '../../models/notification.model.js';
import User from '../../models/user.model.js';

// Get all notifications for the current user
export const getUserNotifications = async (req, res) => {
    try {
        const uid = req.headers['x-user-id'];
        if (!uid) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const notifications = await Notification.find({ recipient: user._id })
            .populate('sender', 'name username photoURL') // Populate sender details (photoURL is the field in User model)
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
    try {
        const uid = req.headers['x-user-id'];
        if (!uid) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { id } = req.params;
        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: user._id }, // Ensure ownership
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
    try {
        const uid = req.headers['x-user-id'];
        if (!uid) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await Notification.updateMany(
            { recipient: user._id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
