const Experience = require("../models/Experience");
const Reward = require("../models/Reward");
const User = require("../models/User");

/* ============================
   CREATE EXPERIENCE
============================ */
exports.createExperience = async (req, res) => {
  try {
    let { topics, questionPatterns, ...rest } = req.body;

    // ✅ Normalize topics
    const topicsArray = Array.isArray(topics)
      ? topics
          .flatMap(t => t.split(/[,\s]+/))
          .map(t => t.trim().toUpperCase())
          .filter(Boolean)
      : typeof topics === "string"
      ? topics
          .split(/[,\s]+/)
          .map(t => t.trim().toUpperCase())
          .filter(Boolean)
      : [];

    // ✅ Normalize question patterns
    const questionPatternsArray = Array.isArray(questionPatterns)
      ? questionPatterns
          .flatMap(p => p.split(/[,\s]+/))
          .map(p => p.trim().toUpperCase())
          .filter(Boolean)
      : typeof questionPatterns === "string"
      ? questionPatterns
          .split(/[,\s]+/)
          .map(p => p.trim().toUpperCase())
          .filter(Boolean)
      : [];

    const experience = await Experience.create({
      ...rest,
      topics: topicsArray,                     // ✅ ALWAYS ARRAY
      questionPatterns: questionPatternsArray, // ✅ ALWAYS ARRAY
      author: req.userId,
    });

    // 🎁 reward for posting
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

/* ============================
   GET EXPERIENCES
============================ */
exports.getExperiences = async (req, res) => {
  try {
    const count = await Experience.countDocuments({ author: req.userId });
    const limit = count === 0 ? 3 : 100;

    const data = await Experience.find()
      .populate("author", "email role points")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      locked: count === 0,
      data,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch experiences" });
  }
};

/* ============================
   UPVOTE EXPERIENCE
============================ */
exports.upvote = async (req, res) => {
  try {
    const exp = await Experience.findById(req.params.id);

    if (exp.upvotes.includes(req.userId)) {
      return res.status(400).json({ message: "Already upvoted" });
    }

    exp.upvotes.push(req.userId);
    await exp.save();

    // 🎁 reward author
    await Reward.create({
      user: exp.author,
      action: "UPVOTE_RECEIVED",
      points: 2,
    });

    await User.findByIdAndUpdate(exp.author, {
      $inc: { points: 2 },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Upvote failed" });
  }
};

/* ============================
   REPORT EXPERIENCE
============================ */
exports.report = async (req, res) => {
  try {
    const exp = await Experience.findById(req.params.id);

    exp.reports.push(req.userId);
    await exp.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Report failed" });
  }
};

/* ============================
   GET REPORTED (ADMIN)
============================ */
exports.getReported = async (req, res) => {
  try {
    const data = await Experience.find({
      reports: { $exists: true, $ne: [] },
    }).populate("author", "email role points");

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};
