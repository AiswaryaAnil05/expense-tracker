const Expense = require("../models/expense");
const Budget = require("../models/budget");
const Notification = require("../models/notification");

// @route   GET /api/expenses
const getExpenses = async (req, res, next) => {
    try {
        const { category, startDate, endDate, minAmount, maxAmount, page = 1, limit = 10 } = req.query;

        const filter = { user: req.user._id };

        if (category) filter.category = category;
        if (minAmount || maxAmount) {
            filter.amount = {};
            if (minAmount) filter.amount.$gte = Number(minAmount);
            if (maxAmount) filter.amount.$lte = Number(maxAmount);
        }
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const total = await Expense.countDocuments(filter);
        const expenses = await Expense.find(filter)
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({
            success: true,
            count: expenses.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            expenses
        });
    } catch (err) {
        next(err);
    }
};

// @route   GET /api/expenses/:id
const getExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!expense) {
            return res.status(404).json({ success: false, message: "Expense not found" });
        }

        res.json({ success: true, expense });
    } catch (err) {
        next(err);
    }
};

// @route   POST /api/expenses
const createExpense = async (req, res, next) => {
    try {
        const { title, amount, category, date, notes } = req.body;

        const expense = await Expense.create({
            user: req.user._id,
            title,
            amount,
            category,
            date,
            notes
        });

        // Check budget after creating expense
        await checkBudgetAndNotify(req.user._id, category);

        res.status(201).json({ success: true, expense });
    } catch (err) {
        next(err);
    }
};

// @route   PUT /api/expenses/:id
const updateExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!expense) {
            return res.status(404).json({ success: false, message: "Expense not found" });
        }

        res.json({ success: true, expense });
    } catch (err) {
        next(err);
    }
};

// @route   DELETE /api/expenses/:id
const deleteExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!expense) {
            return res.status(404).json({ success: false, message: "Expense not found" });
        }

        res.json({ success: true, message: "Expense deleted" });
    } catch (err) {
        next(err);
    }
};

// @route   GET /api/expenses/analytics/summary
const getSummary = async (req, res, next) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Total spent this month
        const monthlyResult = await Expense.aggregate([
            { $match: { user: req.user._id, date: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // Spending by category this month
        const byCategory = await Expense.aggregate([
            { $match: { user: req.user._id, date: { $gte: startOfMonth } } },
            { $group: { _id: "$category", total: { $sum: "$amount" } } },
            { $sort: { total: -1 } }
        ]);

        // Monthly trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyTrend = await Expense.aggregate([
            { $match: { user: req.user._id, date: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { month: { $month: "$date" }, year: { $year: "$date" } },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const monthlyTotal = monthlyResult[0]?.total || 0;
        const biggestCategory = byCategory[0]?._id || "None";

        // Average daily spend this month
        const daysInMonth = now.getDate();
        const avgDaily = monthlyTotal / daysInMonth;

        res.json({
            success: true,
            summary: {
                monthlyTotal,
                biggestCategory,
                avgDaily: Math.round(avgDaily),
                byCategory,
                monthlyTrend
            }
        });
    } catch (err) {
        next(err);
    }
};

// @route   GET /api/expenses/export/csv
const exportCSV = async (req, res, next) => {
    try {
        const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });

        const headers = ["Title", "Amount", "Category", "Date", "Notes"];
        const rows = expenses.map(e => [
            e.title,
            e.amount,
            e.category,
            new Date(e.date).toLocaleDateString(),
            e.notes || ""
        ]);

        const csv = [headers, ...rows].map(row => row.join(",")).join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=expenses.csv");
        res.send(csv);
    } catch (err) {
        next(err);
    }
};

// Internal helper — checks budget and creates notification if needed
const checkBudgetAndNotify = async (userId, category) => {
    try {
        const now = new Date();
        const budget = await Budget.findOne({
            user: userId,
            category,
            month: now.getMonth() + 1,
            year: now.getFullYear()
        });

        if (!budget) return;

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const result = await Expense.aggregate([
            { $match: { user: userId, category, date: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const spent = result[0]?.total || 0;
        const percentage = (spent / budget.monthlyLimit) * 100;

        if (percentage >= 100) {
            await Notification.create({
                user: userId,
                message: `⚠️ You have exceeded your ${category} budget of ₹${budget.monthlyLimit} this month!`,
                type: "danger"
            });
        } else if (percentage >= 80) {
            await Notification.create({
                user: userId,
                message: `🔔 You've used ${Math.round(percentage)}% of your ${category} budget this month.`,
                type: "warning"
            });
        }
    } catch (err) {
        console.error("Budget check error:", err.message);
    }
};

module.exports = { getExpenses, getExpense, createExpense, updateExpense, deleteExpense, getSummary, exportCSV };