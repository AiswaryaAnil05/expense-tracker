const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Amount cannot be negative"]
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        enum: ["Food", "Transport", "Shopping", "Entertainment", "Health", "Education", "Rent", "Utilities", "Other"],
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);