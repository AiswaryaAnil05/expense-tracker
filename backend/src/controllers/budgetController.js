const Budget = require("../models/budget");
const Expense = require("../models/expense");

// @route   GET /api/budgets
const getBudgets = async (req, res, next) => {
    try {
        const now = new Date();
        const month = Number(req.query.month) || now.getMonth() + 1;
        const year = Number(req.query.year) || now.getFullYear();

        const budgets = await Budget.find({ user: req.user._id, month, year });

        // For each budget, calculate how much has been spent
        const budgetsWithSpending = await Promise.all(budgets.map(async (budget) => {
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0);

            const result = await Expense.aggregate([
                {
                    $match: {
                        user: req.user._id,
                        category: budget.category,
                        date: { $gte: startOfMonth, $lte: endOfMonth }
                    }
                },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);

            const spent = result[0]?.total || 0;
            const percentage = Math.round((spent / budget.monthlyLimit) * 100);

            return {
                ...budget.toObject(),
                spent,
                percentage,
                remaining: Math.max(0, budget.monthlyLimit - spent)
            };
        }));

        res.json({ success: true, budgets: budgetsWithSpending });
    } catch (err) {
        next(err);
    }
};

// @route   POST /api/budgets
const createBudget = async (req, res, next) => {
    try {
        const { category, monthlyLimit } = req.body;
        const now = new Date();

        const existing = await Budget.findOne({
            user: req.user._id,
            category,
            month: now.getMonth() + 1,
            year: now.getFullYear()
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: `Budget for ${category} already exists this month. Update it instead.`
            });
        }

        const budget = await Budget.create({
            user: req.user._id,
            category,
            monthlyLimit,
            month: now.getMonth() + 1,
            year: now.getFullYear()
        });

        res.status(201).json({ success: true, budget });
    } catch (err) {
        next(err);
    }
};

// @route   PUT /api/budgets/:id
const updateBudget = async (req, res, next) => {
    try {
        const budget = await Budget.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { monthlyLimit: req.body.monthlyLimit },
            { new: true, runValidators: true }
        );

        if (!budget) {
            return res.status(404).json({ success: false, message: "Budget not found" });
        }

        res.json({ success: true, budget });
    } catch (err) {
        next(err);
    }
};

// @route   DELETE /api/budgets/:id
const deleteBudget = async (req, res, next) => {
    try {
        const budget = await Budget.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!budget) {
            return res.status(404).json({ success: false, message: "Budget not found" });
        }

        res.json({ success: true, message: "Budget deleted" });
    } catch (err) {
        next(err);
    }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget };