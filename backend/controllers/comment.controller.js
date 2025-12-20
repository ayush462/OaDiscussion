const Comment = require("../models/Comment");
const Experience = require("../models/Experience");
const Reward = require("../models/Reward");
const User = require("../models/User");

/**
 * ===============================
 * ADD COMMENT OR REPLY
 * ===============================
 */
exports.addComment = async (req, res) => {
  try {
    const { text, isAnonymous, parentComment } = req.body;
    const { experienceId } = req.params;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    // Validate parent comment (for replies)
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return res.status(404).json({ message: "Parent comment not found" });
      }

      // Only 1-level nesting (Instagram style)
      if (parent.parentComment) {
        return res
          .status(400)
          .json({ message: "Nested replies not allowed" });
      }
    }

    const comment = await Comment.create({
      text,
      experience: experienceId,
      author: req.userId,
      isAnonymous: !!isAnonymous,
      parentComment: parentComment || null,
    });

    // Increment counts
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $inc: { replyCount: 1 },
      });
    } else {
      await Experience.findByIdAndUpdate(experienceId, {
        $inc: { commentCount: 1 },
      });
    }

    // Reward system
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
 * ===============================
 * GET COMMENTS (MOST LIKED FIRST)
 * ===============================
 */
exports.getComments = async (req, res) => {
  try {
    const { experienceId } = req.params;

    // fetch all comments
    const all = await Comment.find({ experience: experienceId })
      .populate("author", "email role")
      .sort({ createdAt: 1 })
      .lean();

    // split parents & replies
    const parents = all.filter((c) => !c.parentComment);
    const replies = all.filter((c) => c.parentComment);

    // map replies
    const replyMap = {};
    replies.forEach((r) => {
      const pid = r.parentComment.toString();
      if (!replyMap[pid]) replyMap[pid] = [];
      replyMap[pid].push(r);
    });

    // attach replies
    const result = parents.map((p) => ({
      ...p,
      replies: replyMap[p._id.toString()] || [],
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};
/**
 * ===============================
 * LIKE / UNLIKE COMMENT
 * ===============================
 */
exports.toggleLikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const alreadyLiked = comment.likes.some(
      (id) => id.toString() === userId
    );

    if (alreadyLiked) {
      await Comment.findByIdAndUpdate(commentId, {
        $pull: { likes: userId },
        $inc: { likeCount: -1 },
      });
    } else {
      await Comment.findByIdAndUpdate(commentId, {
        $addToSet: { likes: userId },
        $pull: { dislikes: userId },
        $inc: { likeCount: 1 },
      });
    }

    res.json({
      liked: !alreadyLiked,
    });
  } catch (err) {
    console.error("LIKE COMMENT ERROR:", err);
    res.status(500).json({ message: "Failed to like comment" });
  }
};

/**
 * ===============================
 * DELETE COMMENT (WITH REPLIES)
 * ===============================
 */
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (
      comment.author.toString() !== req.userId &&
      req.userRole !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Delete replies first
    const replyResult = await Comment.deleteMany({
      parentComment: comment._id,
    });

    await Comment.findByIdAndDelete(comment._id);

    // Update counts
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $inc: { replyCount: -1 },
      });
    } else {
      await Experience.findByIdAndUpdate(comment.experience, {
        $inc: { commentCount: -1 },
      });
    }

    res.json({
      success: true,
      repliesDeleted: replyResult.deletedCount,
    });
  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};
