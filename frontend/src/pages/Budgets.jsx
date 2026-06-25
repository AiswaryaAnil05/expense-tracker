import { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Health", "Education", "Rent", "Utilities", "Other"];

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
        return "bg-green-500";
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
                    <p className="text-gray-500 text-sm mt-1">Set monthly limits for each category</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                >
                    + New Budget
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Create Budget</h2>
                    <form onSubmit={handleSubmit} className="flex gap-4 flex-wrap">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Limit (₹)</label>
                            <input
                                required
                                type="number"
                                value={form.monthlyLimit}
                                onChange={e => setForm({ ...form, monthlyLimit: e.target.value })}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g. 5000"
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                                Save
                            </button>
                            <button type="button" onClick={() => setShowForm(false)}
                                className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Budget Cards */}
            {loading ? (
                <div className="text-center text-gray-400 py-12">Loading...</div>
            ) : budgets.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                    <p className="text-gray-400 text-lg mb-2">No budgets set yet</p>
                    <p className="text-gray-400 text-sm">Create a budget to track your spending limits</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {budgets.map(budget => (
                        <div key={budget._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900">{budget.category}</h3>
                                <button onClick={() => handleDelete(budget._id)}
                                    className="text-red-400 hover:text-red-600 text-sm">Delete</button>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500 mb-2">
                                <span>₹{budget.spent?.toLocaleString()} spent</span>
                                <span>₹{budget.monthlyLimit?.toLocaleString()} limit</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                                <div
                                    className={`h-2.5 rounded-full transition-all ${getBarColor(budget.percentage)}`}
                                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-xs font-medium ${
                                    budget.percentage >= 100 ? "text-red-500" :
                                    budget.percentage >= 80 ? "text-yellow-500" : "text-green-500"
                                }`}>
                                    {budget.percentage}% used
                                </span>
                                <span className="text-xs text-gray-400">
                                    ₹{budget.remaining?.toLocaleString()} remaining
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 