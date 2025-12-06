import { checkExistUser, createUser } from "./auth.service.js";

export const signUp = async (req, res) => {
  try {
    const { uid, name, email } = req.body;

    // Validate required fields
    if (!uid || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "UID, name, and email are required",
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
    const user = await createUser({ uid, name, email });

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

// Other endpoints
export const login = async (req, res) => {
  res.send("Login endpoint");
};

export const googleLogin = async (req, res) => {
  res.send("Google Login endpoint");
};

export const logout = async (req, res) => {
  res.send("Logout endpoint");
};

export const forgotPassword = async (req, res) => {
  res.send("Forgot Password endpoint");
};

export const resetPassword = async (req, res) => {
  res.send("Reset Password endpoint");
};
