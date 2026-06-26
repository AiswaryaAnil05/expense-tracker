import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [nameForm, setNameForm] = useState({ name: user?.name || "" });
    const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [loadingName, setLoadingName] = useState(false);
    const [loadingPass, setLoadingPass] = useState(false);

    const handleNameUpdate = async (e) => {
        e.preventDefault();
        setLoadingName(true);
        try {
            const { data } = await api.put("/auth/updateprofile", { name: nameForm.name });
            updateUser(data.user);
            toast.success("Name updated!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update");
        } finally {
            setLoadingName(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passForm.newPassword !== passForm.confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }
        if (passForm.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        setLoadingPass(true);
        try {
            await api.put("/auth/updateprofile", {
                currentPassword: passForm.currentPassword,
                newPassword: passForm.newPassword
            });
            toast.success("Password updated!");
            setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update password");
        } finally {
            setLoadingPass(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] px-4 md:px-8 py-6 pb-12">
            <div className="max-w-2xl mx-auto space-y-6">
                
                {/* Header */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">Profile</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account settings</p>
                </div>

                {/* Avatar Card */}
                <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1e1e1e] rounded-2xl p-6 flex items-center gap-4 hover:border-[#34D399] dark:hover:border-[#34D399]/30 transition">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-[#1a1a1a] flex items-center justify-center text-gray-600 dark:text-gray-400 font-medium text-lg flex-shrink-0">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white text-lg">{user?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                        <span className="inline-block text-xs font-medium text-[#059669] bg-emerald-50 dark:bg-[#059669]/10 px-2.5 py-0.5 rounded-full mt-1">
                            Active
                        </span>
                    </div>
                </div>

                {/* Update Name */}
                <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1e1e1e] rounded-2xl p-6 hover:border-[#34D399] dark:hover:border-[#34D399]/30 transition">
                    <h2 className="text-gray-900 dark:text-white font-semibold tracking-tight text-lg mb-4">Update Name</h2>
                    <form onSubmit={handleNameUpdate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                            <input
                                required
                                value={nameForm.name}
                                onChange={e => setNameForm({ name: e.target.value })}
                                className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                placeholder="Enter your full name"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loadingName}
                            className="bg-[#059669] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#047857] transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loadingName ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Saving...
                                </span>
                            ) : "Save Name"}
                        </button>
                    </form>
                </div>

                {/* Update Password */}
                <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1e1e1e] rounded-2xl p-6 hover:border-[#34D399] dark:hover:border-[#34D399]/30 transition">
                    <h2 className="text-gray-900 dark:text-white font-semibold tracking-tight text-lg mb-4">Change Password</h2>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Current Password</label>
                            <input
                                required
                                type="password"
                                value={passForm.currentPassword}
                                onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })}
                                className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                placeholder="Enter current password"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                            <input
                                required
                                type="password"
                                value={passForm.newPassword}
                                onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
                                className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                placeholder="Enter new password (min 6 characters)"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
                            <input
                                required
                                type="password"
                                value={passForm.confirmPassword}
                                onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                                className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                placeholder="Confirm your new password"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loadingPass}
                            className="bg-[#059669] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#047857] transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loadingPass ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Updating...
                                </span>
                            ) : "Update Password"}
                        </button>
                    </form>
                </div>

                {/* Account Stats */}
                <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1e1e1e] rounded-2xl p-6 hover:border-[#34D399] dark:hover:border-[#34D399]/30 transition">
                    <h2 className="text-gray-900 dark:text-white font-semibold tracking-tight text-lg mb-4">Account Info</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-[#1a1a1a]">
                            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Email</span>
                            <span className="text-sm text-gray-900 dark:text-white">{user?.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-[#1a1a1a]">
                            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Member Since</span>
                            <span className="text-sm text-gray-900 dark:text-white">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { 
                                    day: "numeric", 
                                    month: "long", 
                                    year: "numeric" 
                                }) : "N/A"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#059669]">
                                <span className="w-1.5 h-1.5 bg-[#059669] rounded-full animate-pulse"></span>
                                Active
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}