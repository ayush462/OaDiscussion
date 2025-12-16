const User = require("../models/User");

exports.leaderboard = async (req, res) => {
  const users = await User.find()
    .sort({ points: -1 })
    .limit(10)
    .select("email points");

  res.json(users);
};
