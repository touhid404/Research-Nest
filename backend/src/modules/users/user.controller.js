import { getAllUsersInDB, updateUserInDB } from "./user.service.js";


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
