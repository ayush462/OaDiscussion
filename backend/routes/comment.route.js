const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const commentController = require("../controllers/comment.controller");

router.post("/:experienceId", auth, commentController.addComment);
router.get("/:experienceId", commentController.getComments);
router.delete("/:commentId", auth, commentController.deleteComment);

module.exports = router;
