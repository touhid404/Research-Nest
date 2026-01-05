import User from "../../models/user.model.js";

export const getAllUsersInDB = async () => {
    const users = await User.find();
    return users;
};

export const getUserByUidFromDB = async (uid) => {
    const user = await User.findOne({ uid });
    return user;
};

export const updateUserInDB = async (uid, updateData) => {
    const allowedFields = [
        "username",
        "name",
        "bio",
        "photoURL",
        "gender",
        "occupation",
        "researchInterests",
        "links",
        "experience",
        "education",
    ];

    const filteredData = {};

    Object.keys(updateData).forEach((key) => {
        if (allowedFields.includes(key)) {
            if (key === "links" && typeof updateData.links === "object") {
                filteredData.links = { ...updateData.links };
            } else {
                filteredData[key] = updateData[key];
            }
        }
    });

    if (Object.keys(filteredData).length === 0) {
        throw new Error("No valid fields provided to update");
    }

    const updatedUser = await User.findOneAndUpdate(
        { uid },       // search by uid (string)
        { $set: filteredData },
        { new: true }
    );

    if (!updatedUser) {
        throw new Error("User not found");
    }

    return updatedUser;
};
