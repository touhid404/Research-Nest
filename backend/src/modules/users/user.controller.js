import User from "../../models/user.model.js";
import { getAllUsersInDB, getUserByUidFromDB, updateUserInDB } from "./user.service.js";


export const getAllUsers = async (req, res) => {
    try {
        const users = await getAllUsersInDB();

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


export const getUserByUid = async (req, res) => {
    try {
        const { uid } = req.params;

        if (!uid) {
            return res.status(400).json({
                success: false,
                message: "uid is required",
            });
        }

        const user = await getUserByUidFromDB(uid);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const updateUser = async (req, res) => {
    try {
        const { uid } = req.params; // assuming userId is in URL params
        const updateData = req.body;

        if (!uid) {
            return res.status(400).json({
                success: false,
                message: "uid is required to update",
            });
        }

        const updatedUser = await updateUserInDB(uid, updateData);

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const checkUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const { uid } = req.query; // current user uid to ignore during check

        if (!username) {
            return res.status(400).json({ success: false, message: "Username is required" });
        }

        const existingUser = await User.findOne({ username: username.toLowerCase() });

        if (!existingUser || (uid && existingUser.uid === uid)) {
            return res.status(200).json({
                success: true,
                available: true,
                message: "Username is available"
            });
        }

        // Generate suggestions if taken
        const suggestions = [];
        let baseName = username.toLowerCase();

        // Try to get the user's real name for better suggestions
        if (uid) {
            const userForName = await User.findOne({ uid });
            if (userForName && userForName.name) {
                // Remove spaces and special characters from name, lowercase it
                baseName = userForName.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            }
        }

        const bases = [
            baseName,
            baseName + "_",
            baseName + "-"
        ];

        const suffixes = [
            Math.floor(Math.random() * 1000),
            "research",
            "nest",
            "pro",
            "dev",
            "scholar"
        ];

        for (const base of bases) {
            for (const suffix of suffixes) {
                const suggestion = `${base}${suffix}`.toLowerCase();
                if (suggestions.length < 5) {
                    // Check if this suggestion is available
                    const taken = await User.findOne({ username: suggestion });
                    if (!taken && suggestion !== username.toLowerCase()) {
                        suggestions.push(suggestion);
                    }
                }
            }
            if (suggestions.length >= 5) break;
        }

        return res.status(200).json({
            success: true,
            available: false,
            message: "Username is already taken",
            suggestions
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
