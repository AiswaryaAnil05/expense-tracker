const express = require("express");
const router = express.Router();
const { getNotifications, markAllRead, deleteNotification } = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getNotifications);
router.put("/markallread", markAllRead);
router.delete("/:id", deleteNotification);

module.exports = router;