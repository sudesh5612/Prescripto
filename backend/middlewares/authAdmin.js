import jwt from "jsonwebtoken";

// admin authentication middleware
const authAdmin = (req, res, next) => {
  try {
    const { atoken } = req.headers;

    if (!atoken) {
      return res.json({ success: false, message: "Not Authorized, token missing" });
    }

    const decoded = jwt.verify(atoken, process.env.JWT_SECRET);

    // Optional: extra check that email matches ADMIN_EMAIL
    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return res.json({ success: false, message: "Not Authorized, Login Again" });
    }

    req.admin = decoded; // attach payload to request
    next();
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Not Authorized, Login Again" });
  }
};

export default authAdmin;
