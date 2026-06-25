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
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-500 text-sm mt-1">Manage your account settings</p>
            </div>

            {/* Avatar */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="font-semibold text-gray-900 text-lg">{user?.name}</p>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                </div>
            </div>

            {/* Update Name */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Update Name</h2>
                <form onSubmit={handleNameUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            required
                            value={nameForm.name}
                            onChange={e => setNameForm({ name: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loadingName}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loadingName ? "Saving..." : "Save Name"}
                    </button>
                </form>
            </div>

            {/* Update Password */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Change Password</h2>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                            required
                            type="password"
                            value={passForm.currentPassword}
                            onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            required
                            type="password"
                            value={passForm.newPassword}
                            onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            required
                            type="password"
                            value={passForm.confirmPassword}
                            onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loadingPass}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loadingPass ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}