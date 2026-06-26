// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { Toaster } from "react-hot-toast";
// import { useAuth } from "./context/AuthContext";
// import { ThemeProvider } from "./context/ThemeContext";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import Expenses from "./pages/Expenses";
// import Budgets from "./pages/Budgets";
// import Profile from "./pages/Profile";
// import Sidebar from "./components/layout/Sidebar";

// const ProtectedRoute = ({ children }) => {
//     const { user, loading } = useAuth();
//     if (loading) return (
//         <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-[#0a0a0a]">
//             <div className="text-center">
//                 <div className="w-12 h-12 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//                 <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
//             </div>
//         </div>
//     );
//     return user ? children : <Navigate to="/login" />;
// };

// const AppLayout = ({ children }) => (
//     <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] relative overflow-hidden">
//         <div className="hidden md:flex flex-shrink-0">
//             <Sidebar />
//         </div>
//         <main className="flex-1 min-w-0 overflow-y-auto relative z-10">
//             {children}
//         </main>
//     </div>
// );


// export default function App() {
//     return (
//         <ThemeProvider>
//             <BrowserRouter>
//                 <Toaster 
//                     position="top-right"
//                     toastOptions={{
//                         style: {
//                             background: '#ffffff',
//                             color: '#1a1a1a',
//                             border: '1px solid #e5e5e5',
//                         },
//                     }}
//                 />
//                 <Routes>
//                     <Route path="/login" element={<Login />} />
//                     <Route path="/register" element={<Register />} />
//                     <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
//                     <Route path="/expenses" element={<ProtectedRoute><AppLayout><Expenses /></AppLayout></ProtectedRoute>} />
//                     <Route path="/budgets" element={<ProtectedRoute><AppLayout><Budgets /></AppLayout></ProtectedRoute>} />
//                     <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
//                 </Routes>
//             </BrowserRouter>
//         </ThemeProvider>
//     );
// }

import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Budgets from "./pages/Budgets";
import Profile from "./pages/Profile";
import Sidebar from "./components/layout/Sidebar";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-[#0a0a0a]">
            <div className="text-center">
                <div className="w-12 h-12 border-2 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
            </div>
        </div>
    );
    return user ? children : <Navigate to="/login" />;
};

const BottomNav = () => {
    const location = useLocation();
    const navItems = [
        { path: "/", label: "Home", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )},
        { path: "/expenses", label: "Expenses", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )},
        { path: "/budgets", label: "Budgets", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        )},
        { path: "/profile", label: "Profile", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        )},
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#141414] border-t border-gray-200 dark:border-[#1e1e1e] z-50 px-2 pb-safe">
            <div className="flex items-center justify-around py-2">
                {navItems.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition ${
                                isActive ? "text-[#059669]" : "text-gray-400 dark:text-gray-500"
                            }`}
                        >
                            {item.icon}
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

const AppLayout = ({ children }) => (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] relative overflow-hidden">
        <div className="hidden md:flex flex-shrink-0">
            <Sidebar />
        </div>
        <main className="flex-1 min-w-0 overflow-y-auto relative z-10 pb-16 md:pb-0">
            {children}
        </main>
        <BottomNav />
    </div>
);

export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: '#ffffff',
                            color: '#1a1a1a',
                            border: '1px solid #e5e5e5',
                        },
                    }}
                />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
                    <Route path="/expenses" element={<ProtectedRoute><AppLayout><Expenses /></AppLayout></ProtectedRoute>} />
                    <Route path="/budgets" element={<ProtectedRoute><AppLayout><Budgets /></AppLayout></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}