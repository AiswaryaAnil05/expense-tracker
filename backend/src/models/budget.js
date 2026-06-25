const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        enum: ["Food", "Transport", "Shopping", "Entertainment", "Health", "Education", "Rent", "Utilities", "Other"],
    },
    monthlyLimit: {
        type: Number,
        required: [true, "Monthly limit is required"],
        min: [1, "Budget must be greater than 0"]
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    }
}, { timestamps: true });


budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);