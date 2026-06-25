import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import api from "../utils/api";
import toast from "react-hot-toast";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const { data } = await api.get("/expenses/analytics/summary");
            setSummary(data.summary);
        } catch (err) {
            toast.error("Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full text-gray-400">
            Loading dashboard...
        </div>
    );

    const trendData = summary?.monthlyTrend?.map(item => ({
        name: MONTHS[item._id.month - 1],
        amount: item.total
    })) || [];

    const categoryData = summary?.byCategory?.map(item => ({
        name: item._id,
        value: item.total
    })) || [];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Your spending overview for this month</p>
                </div>
                <Link
                    to="/expenses"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                >
                    + Add Expense
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total This Month</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">₹{summary?.monthlyTotal?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-400 mt-2">All categories combined</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Biggest Category</p>
                    <p className="text-3xl font-bold text-indigo-600 mt-1">{summary?.biggestCategory || "None"}</p>
                    <p className="text-xs text-gray-400 mt-2">Where you spend the most</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Daily Average</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">₹{summary?.avgDaily?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-400 mt-2">Average spend per day</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Line Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Monthly Trend</h2>
                    {trendData.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-12">No data yet</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={trendData}>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(val) => `₹${val}`} />
                                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Pie Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Spending by Category</h2>
                    {categoryData.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-12">No data yet</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {categoryData.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val) => `₹${val}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Category breakdown table */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Category Breakdown</h2>
                {categoryData.length === 0 ? (
                    <p className="text-gray-400 text-sm">No expenses this month. <Link to="/expenses" className="text-indigo-600">Add one →</Link></p>
                ) : (
                    <div className="space-y-3">
                        {categoryData.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-sm text-gray-600 w-28">{item.name}</span>
                                <div className="flex-1 bg-gray-100 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full"
                                        style={{
                                            width: `${(item.value / summary.monthlyTotal) * 100}%`,
                                            backgroundColor: COLORS[index % COLORS.length]
                                        }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-20 text-right">₹{item.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}