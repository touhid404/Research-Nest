import { updateUserInDB } from "./user.service.js";


export const getAllUsers = ()=>{

}


export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params; // assuming userId is in URL params
    const updateData = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required to update",
      });
    }

    const updatedUser = await updateUserInDB(userId, updateData);

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
