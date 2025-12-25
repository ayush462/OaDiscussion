const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    // ✅ 1. Read token from COOKIE first, then HEADER
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;

    // ✅ 3. Get role (needed for admin routes)
    const user = await User.findById(decoded.id).select("role");
    req.userRole = user?.role || "user";

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
