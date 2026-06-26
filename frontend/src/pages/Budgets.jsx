import { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Health", "Education", "Rent", "Utilities", "Other"];

const CATEGORY_COLORS = {
    Food: "#34D399",
    Transport: "#10B981",
    Shopping: "#059669",
    Entertainment: "#6EE7B7",
    Health: "#047857",
    Education: "#A7F3D0",
    Rent: "#10B981",
    Utilities: "#34D399",
    Other: "#6EE7B7",
};

export default function Budgets() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ category: "Food", monthlyLimit: "" });

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        try {
            const { data } = await api.get("/budgets");
            setBudgets(data.budgets);
        } catch (err) {
            toast.error("Failed to load budgets");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/budgets", form);
            toast.success("Budget created!");
            setShowForm(false);
            setForm({ category: "Food", monthlyLimit: "" });
            fetchBudgets();
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this budget?")) return;
        try {
            await api.delete(`/budgets/${id}`);
            toast.success("Budget deleted!");
            fetchBudgets();
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const getBarColor = (percentage) => {
        if (percentage >= 100) return "bg-red-500";
        if (percentage >= 80) return "bg-yellow-500";
        return "bg-[#10B981]";
    };

    const getStatusText = (percentage) => {
        if (percentage >= 100) return "Exceeded";
        if (percentage >= 80) return "Near limit";
        return "On track";
    };

    const getStatusColor = (percentage) => {
        if (percentage >= 100) return "text-red-500 dark:text-red-400";
        if (percentage >= 80) return "text-yellow-500 dark:text-yellow-400";
        return "text-[#10B981]";
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] px-4 md:px-8 py-6 pb-12">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">Budgets</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set monthly limits for each category</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-[#059669] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#047857] transition shadow-sm hover:shadow-md"
                    >
                        <span className="text-lg leading-none">+</span> New Budget
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1e1e1e] rounded-2xl p-6 hover:border-[#34D399] dark:hover:border-[#34D399]/30 transition">
                        <h2 className="text-gray-900 dark:text-white font-semibold tracking-tight text-lg mb-4">Create Budget</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 flex-wrap">
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                                <select
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition"
                                >
                                    {CATEGORIES.map(c => (
                                        <option key={c} className="bg-white dark:bg-[#141414]">{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Monthly Limit (₹)</label>
                                <input
                                    required
                                    type="number"
                                    value={form.monthlyLimit}
                                    onChange={e => setForm({ ...form, monthlyLimit: e.target.value })}
                                    className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    placeholder="e.g. 5000"
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <button type="submit" className="bg-[#10B981] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#059669] transition shadow-sm hover:shadow-md">
                                    Save
                                </button>
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="border border-gray-300 dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 px-6 py-2.5 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-white transition">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Budget Cards */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-10 h-10 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading budgets...</p>
                        </div>
                    </div>
                ) : budgets.length === 0 ? (
                    <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1e1e1e] rounded-2xl p-12 text-center hover:border-[#34D399] dark:hover:border-[#34D399]/30 transition">
                        <p className="text-gray-700 dark:text-gray-300 text-lg font-medium mb-1">No budgets set yet</p>
                        <p className="text-gray-500 dark:text-gray-500 text-sm">Create a budget to track your spending limits</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {budgets.map(budget => {
                            const percentage = Math.min(budget.percentage, 100);
                            const isExceeded = budget.percentage >= 100;
                            return (
                                <div key={budget._id} className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1e1e1e] rounded-2xl p-6 hover:border-[#34D399] dark:hover:border-[#34D399]/30 transition">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium text-white"
                                                style={{ backgroundColor: CATEGORY_COLORS[budget.category] || "#6B7280" }}
                                            >
                                                {budget.category?.[0] || "#"}
                                            </div>
                                            <h3 className="font-medium text-gray-900 dark:text-white text-lg">{budget.category}</h3>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(budget._id)}
                                            className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 text-sm transition p-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Amounts */}
                                    <div className="flex justify-between text-sm mb-3">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Spent</p>
                                            <p className="text-lg font-light tracking-tight text-gray-900 dark:text-white">₹{budget.spent?.toLocaleString() || 0}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Limit</p>
                                            <p className="text-lg font-light tracking-tight text-gray-900 dark:text-white">₹{budget.monthlyLimit?.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-100 dark:bg-[#1a1a1a] rounded-full h-2 mb-2 overflow-hidden">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-700 ${getBarColor(budget.percentage)}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-medium ${getStatusColor(budget.percentage)}`}>
                                                {getStatusText(budget.percentage)}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-500">
                                                {budget.percentage}% used
                                            </span>
                                        </div>
                                        <span className={`text-xs font-medium ${isExceeded ? 'text-red-500 dark:text-red-400' : 'text-[#10B981]'}`}>
                                            {isExceeded ? 'Over budget' : `₹${budget.remaining?.toLocaleString()} remaining`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
