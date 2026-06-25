import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";

const navItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/expenses", label: "Expenses", icon: "💸" },
    { path: "/budgets", label: "Budgets", icon: "🎯" },
    { path: "/profile", label: "Profile", icon: "👤" },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get("/notifications");
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (err) {}
    };

    const markAllRead = async () => {
        try {
            await api.put("/notifications/markallread");
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {}
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {}
    };

    const handleLogout = () => {
        logout();
        toast.success("Logged out");
        navigate("/login");
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-indigo-600">💰 ExpenseTracker Pro</h1>
            </div>

            {/* User info */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                    </div>
                    {/* Notification Bell */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowNotifications(!showNotifications); if (unreadCount > 0) markAllRead(); }}
                            className="relative p-1.5 rounded-lg hover:bg-gray-100 transition"
                        >
                            🔔
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Dropdown */}
                        {showNotifications && (
                            <div className="absolute left-0 top-10 w-72 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                                <div className="p-3 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-900">Notifications</p>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-6">No notifications</p>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n._id} className={`p-3 border-b border-gray-50 flex items-start justify-between gap-2 ${!n.isRead ? "bg-indigo-50" : ""}`}>
                                                <p className="text-xs text-gray-700 flex-1">{n.message}</p>
                                                <button onClick={() => deleteNotification(n._id)} className="text-gray-300 hover:text-gray-500 text-xs flex-shrink-0">✕</button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setShowNotifications(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                            location.pathname === item.path
                                ? "bg-indigo-50 text-indigo-600"
                                : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition"
                >
                    <span>🚪</span> Logout
                </button>
            </div>
        </div>
    );
}