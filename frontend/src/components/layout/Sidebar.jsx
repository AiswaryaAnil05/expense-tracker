import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useState, useEffect } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";

const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/expenses", label: "Expenses" },
    { path: "/budgets", label: "Budgets" },
    { path: "/profile", label: "Profile" },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
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
        <div className="w-64 bg-white dark:bg-[#0d0d0d] border-r border-gray-200 dark:border-[#1e1e1e] flex flex-col h-screen sticky top-0 z-30">
            {/* Logo - Clean typography */}
            <div className="px-6 py-6 border-b border-gray-200 dark:border-[#1e1e1e]">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                    Expenzo
                </h1>
            </div>

            {/* User info */}
            <div className="px-4 py-4 border-b border-gray-200 dark:border-[#1e1e1e]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#1a1a1a] flex items-center justify-center text-gray-600 dark:text-gray-400 font-medium text-xs flex-shrink-0">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    {/* Notification Bell */}
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={async () => { await fetchNotifications(); setShowNotifications(!showNotifications); if (unreadCount > 0) markAllRead(); }}
                            className="relative p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition"
                        >
                            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Dropdown */}
                        {showNotifications && (
                            <div className="absolute left-0 top-10 w-72 bg-white dark:bg-[#141414] rounded-xl shadow-2xl border border-gray-200 dark:border-[#1e1e1e] z-[9999] overflow-hidden">
                                <div className="p-3 border-b border-gray-200 dark:border-[#1e1e1e] flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Notifications</p>
                                    {notifications.length > 0 && (
                                        <button 
                                            onClick={markAllRead}
                                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-56 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No notifications</p>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n._id} className={`p-3 border-b border-gray-200 dark:border-[#1a1a1a] flex items-start justify-between gap-2 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition ${!n.isRead ? "bg-gray-50 dark:bg-[#1a1a1a]" : ""}`}>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">{n.message}</p>
                                                <button 
                                                    onClick={() => deleteNotification(n._id)} 
                                                    className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-300 text-sm flex-shrink-0 transition"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Nav links - Green dot indicator instead of bg */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
                {navItems.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setShowNotifications(false)}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                                isActive
                                    ? "text-gray-900 dark:text-white font-medium"
                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                            {/* Green dot indicator */}
                            <span className={`w-1.5 h-1.5 rounded-full transition-all ${isActive ? 'bg-[#059669]' : 'bg-transparent'}`} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom section */}
            <div className="px-3 py-3 border-t border-gray-200 dark:border-[#1e1e1e] space-y-0.5">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-white transition"
                >
                    <span className="flex items-center gap-2.5">
                        {isDark ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                        {isDark ? "Light" : "Dark"}
                    </span>
                    <div className={`w-8 h-4 rounded-full transition-colors ${isDark ? 'bg-[#059669]' : 'bg-gray-300 dark:bg-gray-600'} relative flex-shrink-0`}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${isDark ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                    </div>
                </button>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-gray-200 transition"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </button>
            </div>
        </div>
    );
}