import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
                <div className="w-12 h-12 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
            </div>
        </div>
    );
    return user ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] relative overflow-hidden">
        <div className="hidden md:flex flex-shrink-0">
            <Sidebar />
        </div>
        <main className="flex-1 min-w-0 overflow-y-auto relative z-10">
            {children}
        </main>
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
