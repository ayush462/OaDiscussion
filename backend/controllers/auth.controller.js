const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mailer = require("../config/mail");

const sendOtp = async (email, otp) => {
  await mailer.sendMail({
    to: email,
    subject: "Your OTP Code",
    html: `<h2>${otp}</h2><p>Valid for 5 minutes</p>`
  });
};

exports.signup = async (req, res) => {
  const { email, password } = req.body;

  if (await User.findOne({ email }))
    return res.status(400).json({ message: "User exists" });

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ email, password: hashed });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60000)
  });

  await sendOtp(email, otp);
  res.json({ message: "OTP sent" });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = await Otp.findOne({ email, otp });

  if (!record || record.expiresAt < Date.now())
    return res.status(400).json({ message: "Invalid OTP" });

  await User.updateOne({ email }, { isVerified: true });
  await Otp.deleteMany({ email });

  res.json({ message: "Verified" });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.isVerified)
    return res.status(400).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });

  res.json({ token });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.deleteMany({ email });
  await Otp.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60000)
  });

  await sendOtp(email, otp);
  res.json({ message: "OTP sent" });
};

exports.resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  const record = await Otp.findOne({ email, otp });

  if (!record || record.expiresAt < Date.now())
    return res.status(400).json({ message: "Invalid OTP" });

  const hashed = await bcrypt.hash(password, 10);
  await User.updateOne({ email }, { password: hashed });
  await Otp.deleteMany({ email });

  res.json({ message: "Password reset successful" });
};
