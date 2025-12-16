const Comment = require("../models/Comment");
const Experience = require("../models/Experience");
const Reward = require("../models/Reward");
const User = require("../models/User");

/**
 * Add comment
 */
exports.addComment = async (req, res) => {
  try {
    const { text, isAnonymous } = req.body;
    const { experienceId } = req.params;

    if (!text)
      return res.status(400).json({ message: "Comment cannot be empty" });

    const comment = await Comment.create({
      text,
      experience: experienceId,
      author: req.userId,
      isAnonymous,
    });

    // increase comment count
    await Experience.findByIdAndUpdate(experienceId, {
      $inc: { commentCount: 1 },
    });

    // optional reward
    await Reward.create({
      user: req.userId,
      action: "COMMENT",
      points: 1,
    });

    await User.findByIdAndUpdate(req.userId, {
      $inc: { points: 1 },
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error("ADD COMMENT ERROR:", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

/**
 * Get comments for an experience
 */
exports.getComments = async (req, res) => {
  try {
    const { experienceId } = req.params;

    const comments = await Comment.find({ experience: experienceId })
      .populate("author", "email role")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

/**
 * Delete comment (author or admin)
 */
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment)
      return res.status(404).json({ message: "Comment not found" });

    if (
      comment.author.toString() !== req.userId &&
      req.userRole !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    await Experience.findByIdAndUpdate(comment.experience, {
      $inc: { commentCount: -1 },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete comment" });
  }
};
