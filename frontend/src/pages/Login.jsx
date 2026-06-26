import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form.email, form.password);
            toast.success("Welcome back!");
            navigate("/");
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-700/10 dark:bg-emerald-700/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-400/5 dark:bg-emerald-400/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl shadow-2xl w-full max-w-md p-8 hover:border-[#34D399] dark:hover:border-[#34D399]/30 transition">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-[#059669]/20 rounded-2xl mb-4">
                        <span className="text-2xl font-bold text-[#059669]">E</span>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Expenzo</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                        <input
                            type="password"
                            required
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#059669] text-white py-2.5 rounded-xl font-medium hover:bg-[#047857] transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Signing in...
                            </span>
                        ) : "Sign In"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-[#059669] font-medium hover:text-[#047857] transition">
                            Register
                        </Link>
                    </p>
                </div>

                {/* Demo Credentials */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center mb-2">Demo Credentials</p>
                    <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-500">
                        <span><span className="text-gray-700 dark:text-gray-400">Email:</span> demo@gmail.com</span>
                        <span><span className="text-gray-700 dark:text-gray-400">Password:</span> 123456</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
