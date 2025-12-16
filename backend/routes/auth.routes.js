const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const ctrl = require("../controllers/auth.controller");

router.post("/signup", ctrl.signup);
router.post("/verify-otp", ctrl.verifyOtp);
router.post("/login", ctrl.login);
router.post("/forgot-password", ctrl.forgotPassword);
router.post("/reset-password", ctrl.resetPassword);

router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET);
    res.redirect(`http://localhost:5173/oauth-success?token=${token}`);
  }
);

module.exports = router;
