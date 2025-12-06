import User from "../../models/user.model.js";


export const checkExistUser = async (uid, email) => {
  return await User.findOne({ $or: [{ uid }, { email }] });
};


export const createUser = async ({ uid, name, email }) => {
  const newUser = new User({
    uid,
    name,
    email,
  });
  return await newUser.save();
};
