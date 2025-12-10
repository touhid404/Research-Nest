import { checkExistUser, createUser, createUserManually } from "./auth.service.js";

// Other endpoints
export const signUp = async (req, res) => {
  try {
    const { uid, name, email, gender, occupation, interests } = req.body;
    
    // Validate required fields
    if (!uid || !name || !email || !gender || !occupation || !interests) {
      return res.status(400).json({
        success: false,
        message: "UID, name, email, gender, occupation, and interests are required",
      });
    }
    // Check if user already exists
    const existUser = await checkExistUser(uid, email);
    if (existUser) {
      return res.status(409).json({
        success: false,
        message: "User with this UID or email already exists",
      });
    }

    // Create new user
    const user = await createUserManually({ uid, name, email, gender, occupation, interests });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { uid, name, email ,photoURL} = req.body;
    
    // Validate required fields
    if (!uid || !name || !email || !photoURL) {
      return res.status(400).json({
        success: false,
        message: "UID, name, email, and photoURL are required",
      });
    }
    // Check if user already exists
    const existUser = await checkExistUser(uid, email);
    if (existUser) {
      return res.status(200).json({
        success: true,
        message: "User with this UID or email already exists",
      });
    }

    // Create new user
    const user = await createUser({ uid, name, email,photoURL });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
