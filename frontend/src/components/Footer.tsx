import { Link } from "react-router-dom";
import { MapPin, Shield, Phone, Mail, AlertCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                SafePath AI
              </h3>
            </div>
            <p className="text-gray-400 text-sm mb-4 max-w-md">
              Your trusted AI-powered safety companion. Navigate safely, report incidents,
              connect with your community, and access emergency services instantly.
              Making cities safer, one step at a time.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Real-time Location</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>SOS Alerts</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/dashboard"
                  className="text-gray-400 hover:text-blue-400 text-sm transition flex items-center space-x-2"
                >
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/incidents"
                  className="text-gray-400 hover:text-blue-400 text-sm transition flex items-center space-x-2"
                >
                  <span>View Incidents</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/report-incident"
                  className="text-gray-400 hover:text-blue-400 text-sm transition flex items-center space-x-2"
                >
                  <span>Report Incident</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/community"
                  className="text-gray-400 hover:text-blue-400 text-sm transition flex items-center space-x-2"
                >
                  <span>Community</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-blue-400 text-sm transition flex items-center space-x-2"
                >
                  <span>About Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Emergency */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Support & Emergency
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:911"
                  className="text-gray-400 hover:text-red-400 text-sm transition flex items-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Emergency: 911</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@safepath.ai"
                  className="text-gray-400 hover:text-blue-400 text-sm transition flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>support@safepath.ai</span>
                </a>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-blue-400 text-sm transition flex items-center space-x-2"
                >
                  <span>Contact Us</span>
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-400 text-sm transition flex items-center space-x-2"
                >
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-400 text-sm transition flex items-center space-x-2"
                >
                  <span>Terms of Service</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} SafePath AI. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-blue-400 transition">Help Center</a>
              <a href="#" className="hover:text-blue-400 transition">Safety Tips</a>
              <a href="#" className="hover:text-blue-400 transition">Resources</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
