const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const authCtrl = require("../controllers/auth.controller");

/* EMAIL AUTH */
router.post("/signup", authCtrl.signup);
router.post("/verify-otp", authCtrl.verifyOtp);
router.post("/login", authCtrl.login);
router.post("/forgot-password", authCtrl.forgotPassword);
router.post("/reset-password", authCtrl.resetPassword);

/* GOOGLE AUTH */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email, 
        role: req.user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,        // REQUIRED on Render (HTTPS)
      sameSite: "none",    // REQUIRED for Vercel ↔ Render
      maxAge: 24 * 60 * 60 * 1000,
    });

    // ✅ Redirect WITHOUT token in URL
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success`);
  }

);

module.exports = router;
