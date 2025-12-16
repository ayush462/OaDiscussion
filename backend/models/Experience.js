const mongoose = require("mongoose");   // ✅ MISSING LINE

const experienceSchema = new mongoose.Schema(
  {
    company: String,
    role: String,

    oaPlatform: String,
    difficulty: String,

    questionsCount: Number,
    topics: [String],

    experienceText: String,
    rating: Number,
    year: Number,

    isAnonymous: { type: Boolean, default: false },

    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Experience", experienceSchema);
