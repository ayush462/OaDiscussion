const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin");
const ctrl = require("../controllers/experience.controller");

router.post("/", auth, ctrl.createExperience);
router.get("/", auth, ctrl.getExperiences);
router.post("/:id/upvote", auth, ctrl.upvote);
router.post("/:id/report", auth, ctrl.report);
router.get("/admin/reported", auth, admin, ctrl.getReported);

module.exports = router;
