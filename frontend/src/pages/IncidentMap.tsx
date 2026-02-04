import React, { useState, useEffect } from 'react';
import { useLocation } from '../contexts/LocationContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface Incident {
  _id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  location: {
    coordinates: [number, number];
    address?: string;
  };
  reporterName?: string;
  isAnonymous: boolean;
  dateOfIncident: string;
  comments: any[];
  createdAt: string;
}

const IncidentMap: React.FC = () => {
  const { location } = useLocation();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    severity: '',
    radius: 'all',
  });

  useEffect(() => {
    fetchIncidents();
  }, [location, filters]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params: any = {};
      
      // Only add location params if radius is not 'all'
      if (location && filters.radius !== 'all') {
        params.latitude = location.latitude;
        params.longitude = location.longitude;
        params.radius = filters.radius;
      }
      
      if (filters.category) params.category = filters.category;
      if (filters.severity) params.severity = filters.severity;

      const response = await axios.get(`${API_URL}/incidents`, { params });
      setIncidents(response.data.incidents || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'theft':
        return '🚨';
      case 'assault':
        return '⚠️';
      case 'harassment':
        return '🚫';
      case 'accident':
        return '🚗';
      case 'suspicious_activity':
        return '👁️';
      default:
        return '📌';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Incident Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View reported incidents in your area to stay informed and safe
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                <option value="theft">Theft</option>
                <option value="assault">Assault</option>
                <option value="harassment">Harassment</option>
                <option value="accident">Accident</option>
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity
              </label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Radius
              </label>
              <select
                value={filters.radius}
                onChange={(e) => setFilters({ ...filters, radius: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Locations</option>
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="20">20 km</option>
                <option value="50">50 km</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading incidents...</p>
          </div>
        )}

        {/* Incidents List */}
        {!loading && incidents.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No incidents reported in this area
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {incidents.map((incident) => (
            <div
              key={incident._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedIncident(incident)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getCategoryIcon(incident.category)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {incident.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(incident.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                {incident.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                  {incident.severity}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {incident.category.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-600 dark:text-gray-400">
                    💬 {incident.comments.length}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {incident.isAnonymous ? '👤 Anonymous' : `👤 ${incident.reporterName}`}
                </span>
              </div>

              {incident.location.address && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    📍 {incident.location.address}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Incident Details Modal */}
        {selectedIncident && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedIncident(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedIncident.title}
                </h2>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedIncident.severity)}`}>
                    {selectedIncident.severity}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {selectedIncident.category.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300">{selectedIncident.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Reported by</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedIncident.isAnonymous ? 'Anonymous' : selectedIncident.reporterName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Date of Incident</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedIncident.dateOfIncident).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedIncident.location.address && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Location</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      📍 {selectedIncident.location.address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentMap;
