import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { User, LogOut, Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-white">
              SafePath AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-primary transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/emergency"
                  className="text-gray-300 hover:text-primary transition"
                >
                  Emergency
                </Link>
                <Link
                  to="/incidents"
                  className="text-gray-300 hover:text-primary transition"
                >
                  Incidents
                </Link>
                <Link
                  to="/report-incident"
                  className="text-gray-300 hover:text-primary transition"
                >
                  Report Incident
                </Link>
                <Link
                  to="/community"
                  className="text-gray-300 hover:text-primary transition"
                >
                  Community Help
                </Link>
                <Link
                  to="/favorites"
                  className="text-gray-300 hover:text-primary transition"
                >
                  Favorites
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-primary transition"
                >
                  About
                </Link>
                <Link
                  to="/incidents"
                  className="text-gray-300 hover:text-primary transition"
                >
                  View Incidents
                </Link>
                <Link
                  to="/report-incident"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Report Incident
                </Link>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="p-2 rounded-lg hover:bg-gray-700 transition"
                >
                  <User className="w-5 h-5 text-gray-300" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-700 transition"
                >
                  <LogOut className="w-5 h-5 text-gray-300" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/emergency"
                  className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Emergency
                </Link>
                <Link
                  to="/incidents"
                  className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Incidents
                </Link>
                <Link
                  to="/report-incident"
                  className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Report Incident
                </Link>
                <Link
                  to="/community"
                  className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Community
                </Link>
                <Link
                  to="/favorites"
                  className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Favorites
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/about"
                  className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/incidents"
                  className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  View Incidents
                </Link>
                <Link
                  to="/report-incident"
                  className="block px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Report Incident
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
