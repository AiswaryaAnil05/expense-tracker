const express = require("express");
const router = express.Router();
const { getExpenses, getExpense, createExpense, updateExpense, deleteExpense, getSummary, exportCSV } = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/analytics/summary", getSummary);
router.get("/export/csv", exportCSV);
router.get("/", getExpenses);
router.get("/:id", getExpense);
router.post("/", createExpense);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;