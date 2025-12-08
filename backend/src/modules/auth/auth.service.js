import User from "../../models/user.model.js";


export const checkExistUser = async (uid, email) => {
  return await User.findOne({ $or: [{ uid }, { email }] });
};


export const createUser = async ({ uid, name, email,photoURL }) => {
  const newUser = new User({
    uid,
    name,
    email,
    photoURL,
  });
  return await newUser.save();
};

export const createUserManually = async ({ uid, name, email, gender, occupation, interests }) => {
  const newUser = new User({
    uid,
    name,
    email,
    gender,
    occupation,
    researchInterests: interests,
  });
  return await newUser.save();
};

