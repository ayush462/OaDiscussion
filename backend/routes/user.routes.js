const router = require("express").Router();
const ctrl = require("../controllers/user.controller");

router.get("/leaderboard", ctrl.leaderboard);

module.exports = router;
