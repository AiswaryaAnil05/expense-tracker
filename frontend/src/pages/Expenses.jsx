import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [filter, setFilter] = useState({ category: "", startDate: "", endDate: "" });
    const [form, setForm] = useState({ title: "", amount: "", category: "Food", date: "", notes: "" });
    const location = useLocation();  //new


    useEffect(() => {
    fetchExpenses();
    
    // Check if we should open the form
    if (location.state?.openForm) {
        setShowForm(true);
        setEditingExpense(null);
        setForm({ title: "", amount: "", category: "Food", date: "", notes: "" });
        // Clear the state so it doesn't reopen on refresh
        window.history.replaceState({}, document.title);
    }
}, [location.state]);

    const fetchExpenses = async () => {
        try {
            const params = {};
            if (filter.category) params.category = filter.category;
            if (filter.startDate) params.startDate = filter.startDate;
            if (filter.endDate) params.endDate = filter.endDate;
            const { data } = await api.get("/expenses", { params });
            setExpenses(data.expenses);
        } catch (err) {
            toast.error("Failed to load expenses");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingExpense) {
                await api.put(`/expenses/${editingExpense._id}`, form);
                toast.success("Expense updated!");
            } else {
                await api.post("/expenses", form);
                toast.success("Expense added!");
            }
            setShowForm(false);
            setEditingExpense(null);
            setForm({ title: "", amount: "", category: "Food", date: "", notes: "" });
            fetchExpenses();
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        }
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setForm({
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            date: expense.date?.split("T")[0],
            notes: expense.notes || ""
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this expense?")) return;
        try {
            await api.delete(`/expenses/${id}`);
            toast.success("Deleted!");
            fetchExpenses();
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const handleExport = async () => {
        try {
            const response = await api.get("/expenses/export/csv", { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = "expenses.csv";
            a.click();
            toast.success("Exported!");
        } catch (err) {
            toast.error("Export failed");
        }
    };

    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] px-4 md:px-8 py-6 pb-12">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">Expenses</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400">{expenses.length} expenses found</p>
                            {expenses.length > 0 && (
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#1a1a1a] px-3 py-1 rounded-full">
                                    Total: ₹{totalAmount.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleExport} 
                            className="border border-gray-300 dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 px-4 py-2.5 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-white transition flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export CSV
                        </button>
                        {!showForm && (
                            <button 
                                onClick={() => { setShowForm(true); setEditingExpense(null); setForm({ title: "", amount: "", category: "Food", date: "", notes: "" }); }}
                                className="flex items-center gap-2 bg-[#059669] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#047857] transition shadow-sm hover:shadow-md"
                            >
                                <span className="text-lg leading-none">+</span> Add Expense
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1e1e1e] rounded-2xl p-4 flex flex-wrap gap-3 items-center hover:border-[#34D399] dark:hover:border-[#34D399]/30 transition">
                    <div className="flex-1 min-w-[140px]">
                        <select 
                            value={filter.category} 
                            onChange={e => setFilter({ ...filter, category: e.target.value })}
                            className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition"
                        >
                            <option value="">All Categories</option>
                            {CATEGORIES.map(c => <option key={c} className="bg-white dark:bg-[#141414]">{c}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[130px]">
                        <input 
                            type="date" 
                            value={filter.startDate} 
                            onChange={e => setFilter({ ...filter, startDate: e.target.value })}
                            className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition"
                        />
                    </div>
                    <div className="flex-1 min-w-[130px]">
                        <input 
                            type="date" 
                            value={filter.endDate} 
                            onChange={e => setFilter({ ...filter, endDate: e.target.value })}
                            className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition"
                        />
                    </div>
                    <button 
                        onClick={fetchExpenses} 
                        className="bg-[#059669] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#047857] transition shadow-sm hover:shadow-md"
                    >
                        Apply
                    </button>
                    <button 
                        onClick={() => { setFilter({ category: "", startDate: "", endDate: "" }); fetchExpenses(); }}
                        className="border border-gray-300 dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 px-5 py-2 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-white transition"
                    >
                        Clear
                    </button>
                </div>

                {/* Add/Edit Form */}
                {showForm && (
                    <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1e1e1e] rounded-2xl p-6 hover:border-[#34D399] dark:hover:border-[#34D399]/30 transition">
                        <h2 className="text-gray-900 dark:text-white font-semibold tracking-tight text-lg mb-4">
                            {editingExpense ? "Edit Expense" : "Add New Expense"}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                                <input 
                                    required 
                                    value={form.title} 
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    placeholder="e.g. Lunch at restaurant"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Amount (₹)</label>
                                <input 
                                    required 
                                    type="number" 
                                    value={form.amount} 
                                    onChange={e => setForm({ ...form, amount: e.target.value })}
                                    className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                                <select 
                                    value={form.category} 
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition"
                                >
                                    {CATEGORIES.map(c => <option key={c} className="bg-white dark:bg-[#141414]">{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
                                <input 
                                    type="date" 
                                    value={form.date} 
                                    onChange={e => setForm({ ...form, date: e.target.value })}
                                    className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Notes (optional)</label>
                                <input 
                                    value={form.notes} 
                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                    className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    placeholder="Any additional notes"
                                />
                            </div>
                            <div className="md:col-span-2 flex gap-3">
                                <button type="submit" className="bg-[#10B981] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#059669] transition shadow-sm hover:shadow-md">
                                    {editingExpense ? "Update" : "Add Expense"}
                                </button>
                                <button type="button" onClick={() => { setShowForm(false); setEditingExpense(null); }}
                                    className="border border-gray-300 dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 px-6 py-2.5 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-white transition">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Expenses List */}
                <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1e1e1e] rounded-2xl overflow-hidden hover:border-[#34D399] dark:hover:border-[#34D399]/30 transition">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="w-10 h-10 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Loading expenses...</p>
                            </div>
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-700 dark:text-gray-300 text-lg font-medium mb-1">No expenses found</p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm">Add your first expense to get started</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#1e1e1e]">
                                    <tr>
                                        <th className="text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 px-6 py-3.5">Title</th>
                                        <th className="text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 px-6 py-3.5">Category</th>
                                        <th className="text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 px-6 py-3.5">Date</th>
                                        <th className="text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 px-6 py-3.5">Amount</th>
                                        <th className="text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 px-6 py-3.5">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-[#1a1a1a]">
                                    {expenses.map(exp => (
                                        <tr key={exp._id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition cursor-pointer group">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{exp.title}</p>
                                                {exp.notes && <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{exp.notes}</p>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span 
                                                    className="inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium text-white"
                                                    style={{ backgroundColor: CATEGORY_COLORS[exp.category] || "#6B7280" }}
                                                >
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(exp.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                                                ₹{exp.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleEdit(exp)} 
                                                        className="text-gray-400 dark:text-gray-500 hover:text-[#059669] transition text-sm font-medium opacity-0 group-hover:opacity-100"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(exp._id)} 
                                                        className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition text-sm font-medium opacity-0 group-hover:opacity-100"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
