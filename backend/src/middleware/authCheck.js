import admin from "../config/firebase.js";

const authCheck = () => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        return res.status(401).send({ message: "unauthorized access" });
      }

      const idToken = token.split(" ")[1];
      const decoded = await admin.auth().verifyIdToken(idToken);

      const user = {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
      };

      req.user = user;

      // console.log("User from auth:", user);

      next();
    } catch (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
  };
};

export default authCheck;
