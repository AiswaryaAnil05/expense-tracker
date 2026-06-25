import { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Health", "Education", "Rent", "Utilities", "Other"];

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [filter, setFilter] = useState({ category: "", startDate: "", endDate: "" });
    const [form, setForm] = useState({ title: "", amount: "", category: "Food", date: "", notes: "" });

    useEffect(() => {
        fetchExpenses();
    }, []);

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

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
                    <p className="text-gray-500 text-sm mt-1">{expenses.length} expenses found</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleExport} className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                        Export CSV
                    </button>
                    <button onClick={() => { setShowForm(true); setEditingExpense(null); setForm({ title: "", amount: "", category: "Food", date: "", notes: "" }); }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                        + Add Expense
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 flex-wrap">
                <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <input type="date" value={filter.startDate} onChange={e => setFilter({ ...filter, startDate: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="date" value={filter.endDate} onChange={e => setFilter({ ...filter, endDate: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button onClick={fetchExpenses} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
                    Apply
                </button>
                <button onClick={() => { setFilter({ category: "", startDate: "", endDate: "" }); fetchExpenses(); }}
                    className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                    Clear
                </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">
                        {editingExpense ? "Edit Expense" : "Add New Expense"}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g. Lunch at restaurant" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                            <input required type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Any additional notes" />
                        </div>
                        <div className="md:col-span-2 flex gap-3">
                            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                                {editingExpense ? "Update" : "Add Expense"}
                            </button>
                            <button type="button" onClick={() => { setShowForm(false); setEditingExpense(null); }}
                                className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Expenses List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading...</div>
                ) : expenses.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No expenses found. Add your first one!</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Title</th>
                                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Category</th>
                                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Date</th>
                                <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Amount</th>
                                <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {expenses.map(exp => (
                                <tr key={exp._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-gray-900">{exp.title}</p>
                                        {exp.notes && <p className="text-xs text-gray-400 mt-0.5">{exp.notes}</p>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-medium">{exp.category}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(exp.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                        ₹{exp.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleEdit(exp)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-3">Edit</button>
                                        <button onClick={() => handleDelete(exp._id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}