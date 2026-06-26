import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import api from "../utils/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

// Premium green palette - different shades for different elements
const GREENS = {
    light: "#A7F3D0",
    mediumLight: "#6EE7B7",
    medium: "#34D399",
    primary: "#10B981",
    dark: "#059669",
    darkest: "#047857",
};

// Pie chart colors - all greens
const PIE_COLORS = ["#10B981", "#34D399", "#6EE7B7", "#059669", "#A7F3D0", "#047857"];

// Category colors - different green shades
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] px-4 py-3 rounded-xl shadow-2xl">
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{label}</p>
                <p className="text-gray-900 dark:text-white font-semibold text-sm">₹{payload[0].value?.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [summaryRes, expensesRes] = await Promise.all([
                api.get("/expenses/analytics/summary"),
                api.get("/expenses?limit=5")
            ]);
            setSummary(summaryRes.data.summary);
            setRecentExpenses(expensesRes.data.expenses);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[80vh]">
            <div className="text-center">
                <div className="w-10 h-10 border-2 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Loading your dashboard...</p>
            </div>
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

    const now = new Date();
    const greeting = now.getHours() < 12 ? "Good morning ," : now.getHours() < 17 ? "Good afternoon ," : "Good evening ,";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] px-4 md:px-8 py-6 pb-12">

            {/* Header */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <p className="text-s font-medium tracking-wider text-black-400 dark:text-white-500">
                        {greeting}
                    </p>
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white mt-0.5">
                        {user?.name?.split(" ")[0]} !
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Here's your financial overview</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/expenses"
                        className="flex items-center gap-2 bg-[#059669] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#047857] transition shadow-sm hover:shadow-md"
                    >
                        <span className="text-lg leading-none">+</span> Add Expense
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Total Balance - Dark green gradient */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#059669] to-[#047857] rounded-2xl p-6 text-white shadow-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-6 -mb-6"></div>
                    <div className="relative z-10">
                        <p className="text-emerald-200 text-xs font-medium uppercase tracking-wider">Total This Month</p>
                        <p className="text-3xl font-light tracking-tight mt-2">₹{summary?.monthlyTotal?.toLocaleString() || 0}</p>
                        <div className="flex items-center gap-2 mt-3">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">All categories</span>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">This month</span>
                        </div>
                    </div>
                </div>

                {/* Top Category */}
                <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1e1e1e] rounded-2xl p-6 hover:border-[#34D399] dark:hover:border-[#34D399]/30 transition">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Top Category</p>
                    <p className="text-2xl font-light tracking-tight text-gray-900 dark:text-white mt-2">
                        {summary?.biggestCategory || "None"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Highest spending category</p>
                </div>

                {/* Daily Average */}
                <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1e1e1e] rounded-2xl p-6 hover:border-[#34D399] dark:hover:border-[#34D399]/30 transition">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Daily Average</p>
                    <p className="text-2xl font-light tracking-tight text-gray-900 dark:text-white mt-2">
                        ₹{summary?.avgDaily?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Average spend per day</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

                {/* Area Chart */}
                <div className="md:col-span-2 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1e1e1e] rounded-2xl p-6 hover:border-[#34D399] dark:hover:border-[#34D399]/30 transition">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Spending Trend</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Last 6 months</p>
                        </div>
                        <span className="text-xs font-medium text-[#059669] bg-emerald-50 dark:bg-[#059669]/10 px-3 py-1 rounded-full">+12.5%</span>
                    </div>
                    {trendData.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">No data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34D399" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#34D399" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 11, fill: "#9ca3af" }} 
                                    axisLine={{ stroke: "#e5e7eb" }} 
                                    tickLine={{ stroke: "#e5e7eb" }}
                                />
                                <YAxis 
                                    tick={{ fontSize: 11, fill: "#9ca3af" }} 
                                    axisLine={{ stroke: "#e5e7eb" }} 
                                    tickLine={{ stroke: "#e5e7eb" }}
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#10B981"
                                    strokeWidth={2.5}
                                    fill="url(#colorAmount)"
                                    dot={{ fill: "#059669", stroke: "#ffffff", strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: "#047857", stroke: "#ffffff", strokeWidth: 3 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Pie Chart - All greens */}
                <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1e1e1e] rounded-2xl p-6 hover:border-[#34D399] dark:hover:border-[#34D399]/30 transition">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">By Category</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This month</p>
                    {categoryData.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">No data yet</div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={70}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {categoryData.map((_, index) => (
                                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-3">
                                {categoryData.slice(0, 3).map((item, index) => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">₹{item.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Bottom Row */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Recent Expenses */}
                <div className="md:col-span-2 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1e1e1e] rounded-2xl p-6 hover:border-[#34D399] dark:hover:border-[#34D399]/30 transition">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Recent Expenses</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your latest transactions</p>
                        </div>
                        <Link to="/expenses" className="text-sm text-[#059669] hover:text-[#047857] font-medium transition">
                            View all →
                        </Link>
                    </div>
                    {recentExpenses.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-500 text-sm text-center py-8">
                            No expenses yet. <Link to="/expenses" className="text-[#059669] hover:underline">Add one →</Link>
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {recentExpenses.map((exp) => (
                                <div key={exp._id} className="flex items-center justify-between py-3 px-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl hover:bg-gray-100 dark:hover:bg-[#202020] transition cursor-pointer">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div 
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
                                            style={{ backgroundColor: CATEGORY_COLORS[exp.category] || "#6B7280" }}
                                        >
                                            {exp.category?.[0] || "#"}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{exp.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(exp.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </span>
                                                <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                                                <span 
                                                    className="text-xs px-2 py-0.5 rounded-full text-white"
                                                    style={{ backgroundColor: CATEGORY_COLORS[exp.category] || "#6B7280" }}
                                                >
                                                    {exp.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-3">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">-₹{exp.amount.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Category Breakdown */}
                <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1e1e1e] rounded-2xl p-6 hover:border-[#34D399] dark:hover:border-[#34D399]/30 transition">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-5">Spending Breakdown</p>
                    {categoryData.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-500 text-sm text-center py-8">No data yet</p>
                    ) : (
                        <div className="space-y-4">
                            {categoryData.map((item, index) => {
                                const percentage = Math.round((item.value / summary.monthlyTotal) * 100);
                                return (
                                    <div key={item.name}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {percentage}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-[#1a1a1a] rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="h-1.5 rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: PIE_COLORS[index % PIE_COLORS.length]
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
