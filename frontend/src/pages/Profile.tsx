import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { User, Mail, Edit2, Save, X } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate password fields if user is trying to change password
      if (formData.newPassword || formData.currentPassword) {
        if (!formData.currentPassword) {
          toast.error("Current password is required to change password");
          setLoading(false);
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error("New passwords do not match");
          setLoading(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          toast.error("New password must be at least 6 characters");
          setLoading(false);
          return;
        }
      }

      const updateData: any = {
        name: formData.name,
      };

      if (formData.newPassword && formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      await api.put("/users/profile", updateData);

      setUser({ ...user!, name: formData.name });
      toast.success("Profile updated successfully! 🎉");
      setFormData({
        name: formData.name,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Profile
          </h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center space-x-2"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {user?.name}
              </h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full px-4 py-2 bg-gray-600 text-gray-400 border border-gray-600 rounded-lg cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-4">Change Password (Optional)</h4>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white transition flex items-center justify-center space-x-2 ${loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? "Saving..." : "Save Changes"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Display Name</p>
                  <p className="font-semibold text-white">{user?.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-semibold text-white">{user?.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
