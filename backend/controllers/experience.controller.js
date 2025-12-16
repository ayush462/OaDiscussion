const Experience = require("../models/Experience");
const Reward = require("../models/Reward");
const User = require("../models/User");

exports.createExperience = async (req, res) => {
  try {
    const experience = await Experience.create({
      ...req.body,
      author: req.userId,
    });

    await Reward.create({
      user: req.userId,
      action: "POST_EXPERIENCE",
      points: 10,
    });

    await User.findByIdAndUpdate(req.userId, {
      $inc: { points: 10 },
    });

    res.status(201).json(experience);

  } catch (err) {
    console.error("CREATE EXPERIENCE ERROR:", err);
    res.status(500).json({
      message: "Failed to create experience",
      error: err.message,
    });
  }
};


exports.getExperiences = async (req, res) => {
  const count = await Experience.countDocuments({ author: req.userId });
  const limit = count === 0 ? 3 : 100;

  const data = await Experience.find().sort({ createdAt: -1 }).limit(limit);
  res.json({ locked: count === 0, data });
};

exports.upvote = async (req, res) => {
  const exp = await Experience.findById(req.params.id);

  if (exp.upvotes.includes(req.userId))
    return res.status(400).json({ message: "Already upvoted" });

  exp.upvotes.push(req.userId);
  await exp.save();

  await Reward.create({
    user: exp.author,
    action: "UPVOTE_RECEIVED",
    points: 2
  });

  await User.findByIdAndUpdate(exp.author, { $inc: { points: 2 } });

  res.json({ success: true });
};

exports.report = async (req, res) => {
  const exp = await Experience.findById(req.params.id);
  exp.reports.push(req.userId);
  await exp.save();
  res.json({ success: true });
};

exports.getReported = async (req, res) => {
  const data = await Experience.find({ reports: { $exists: true, $ne: [] } });
  res.json(data);
};
