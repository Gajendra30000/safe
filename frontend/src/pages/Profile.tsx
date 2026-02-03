import { useAuth } from "../contexts/AuthContext";
import { User, Mail, Shield, MapPin } from "lucide-react";
import { useLocation } from "../contexts/LocationContext";

export default function Profile() {
  const { user } = useAuth();
  const { location } = useLocation();

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          Profile
        </h1>

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

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">
                  Email
                </p>
                <p className="font-semibold text-white">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">
                  Role
                </p>
                <p className="font-semibold text-white capitalize">
                  {user?.role}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">
                  Current Location
                </p>
                {location ? (
                  <p className="font-semibold text-white">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </p>
                ) : (
                  <p className="font-semibold text-red-400">
                    Not available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-white mb-4">
            Account Settings
          </h3>
          <p className="text-gray-400">
            Account settings and preferences coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
