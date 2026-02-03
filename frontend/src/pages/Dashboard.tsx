import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "../contexts/LocationContext";
import { MapPin, MessageSquare, Users, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const { location } = useLocation();
  const [stats, setStats] = useState({
    sosCount: 0,
    favoritesCount: 0,
    questionsCount: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [sosRes, favRes, qnaRes] = await Promise.all([
        api.get("/sos"),
        api.get("/favorites"),
        api.get("/qna"),
      ]);
      setStats({
        sosCount: sosRes.data.length,
        favoritesCount: favRes.data.length,
        questionsCount: qnaRes.data.length,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-400 mt-2">
            Your safety dashboard
          </p>
        </div>

        {/* Location Status */}
        <div className="bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Current Location
              </h3>
              {location ? (
                <p className="text-gray-400">
                  Lat: {location.latitude.toFixed(4)}, Lon:{" "}
                  {location.longitude.toFixed(4)}
                </p>
              ) : (
                <p className="text-red-400">
                  Location not available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-900/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-danger" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.sosCount}
                </p>
                <p className="text-gray-400 text-sm">
                  SOS Alerts
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-900/20 rounded-lg">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.favoritesCount}
                </p>
                <p className="text-gray-400 text-sm">
                  Emergency Contacts
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-900/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.questionsCount}
                </p>
                <p className="text-gray-400 text-sm">
                  Community Questions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/emergency"
            className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105"
          >
            <AlertTriangle className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Emergency SOS</h3>
            <p className="text-red-100">
              Quick access to emergency services and alerts
            </p>
          </Link>

          <Link
            to="/community"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105"
          >
            <Users className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Community</h3>
            <p className="text-blue-100">
              Connect with others and share safety tips
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
