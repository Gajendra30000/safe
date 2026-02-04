import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Image as ImageIcon, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

interface IncidentFormData {
  title: string;
  description: string;
  category: string;
  severity: string;
  dateOfIncident: string;
  isAnonymous: boolean;
  reporterName: string;
}

const ReportIncident: React.FC = () => {
  const { user } = useAuth();
  const { location } = useLocation();
  const [formData, setFormData] = useState<IncidentFormData>({
    title: '',
    description: '',
    category: 'other',
    severity: 'medium',
    dateOfIncident: new Date().toISOString().slice(0, 16),
    isAnonymous: false,
    reporterName: user?.name || '',
  });
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (location) {
      setCurrentLocation({ lat: location.latitude, lng: location.longitude });
      // Fetch address from coordinates using reverse geocoding
      fetchAddress(location.latitude, location.longitude);
    }
  }, [location]);

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        setAddress(data.features[0].place_name);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {  const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    
    if (validFiles.length !== files.length) {
      toast.error('Some images were skipped (max 5MB per image)');
    }
    
    if (selectedImages.length + validFiles.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }
    
    setSelectedImages(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!currentLocation) {
        toast.error('Please enable location services to report an incident');
        setLoading(false);
        return;
      }

      const headers: any = {
        'Content-Type': 'application/json',
      };

      // Add token if user is logged in and not anonymous
      const token = localStorage.getItem('accessToken');
      if (token && !formData.isAnonymous) {
        headers.Authorization = `Bearer ${token}`;
      }

      const incidentData = {
        ...formData,
        location: {
          type: 'Point',
          coordinates: [currentLocation.lng, currentLocation.lat],
          address: address || 'Unknown location',
        },
        photos: [] as string[],
      };

      // Upload images if any
      if (selectedImages.length > 0) {
        try {
          const uploadPromises = selectedImages.map(async (image) => {
            const imageFormData = new FormData();
            imageFormData.append('image', image);
            
            const response = await axios.post(`${API_URL}/upload/image`, imageFormData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            return response.data.url;
          });
          
          const uploadedUrls = await Promise.all(uploadPromises);
          incidentData.photos = uploadedUrls;
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          toast.error('Failed to upload images. Please try again.');
          setLoading(false);
          return;
        }
      }

      await axios.post(`${API_URL}/incidents`, incidentData, { headers });

      toast.success('Incident reported successfully! 🎉');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'other',
        severity: 'medium',
        dateOfIncident: new Date().toISOString().slice(0, 16),
        isAnonymous: false,
        reporterName: user?.name || '',
      });
      setSelectedImages([]);
      setImagePreviews([]);
    } catch (error: any) {
      console.error('Error reporting incident:', error);
      toast.error(
        error.response?.data?.message || 'Failed to report incident. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Report an Incident
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Help make your community safer by reporting incidents. You can choose to report anonymously.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Anonymous Toggle */}
            <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <input
                type="checkbox"
                id="isAnonymous"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="isAnonymous" className="text-gray-900 dark:text-white font-medium">
                Report anonymously (your identity will be hidden)
              </label>
            </div>

            {/* Reporter Name - only if not logged in or anonymous */}
            {(!user || formData.isAnonymous) && (
              <div>
                <label htmlFor="reporterName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name (optional for anonymous reports)
                </label>
                <input
                  type="text"
                  id="reporterName"
                  name="reporterName"
                  value={formData.reporterName}
                  onChange={handleChange}
                  placeholder="Anonymous"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Incident Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={200}
                placeholder="Brief summary of the incident"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="theft">Theft</option>
                <option value="assault">Assault</option>
                <option value="harassment">Harassment</option>
                <option value="accident">Accident</option>
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Severity */}
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity <span className="text-red-500">*</span>
              </label>
              <select
                id="severity"
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Date and Time */}
            <div>
              <label htmlFor="dateOfIncident" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date and Time of Incident <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="dateOfIncident"
                name="dateOfIncident"
                value={formData.dateOfIncident}
                onChange={handleChange}
                required
                max={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                maxLength={2000}
                rows={6}
                placeholder="Provide detailed information about what happened..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formData.description.length}/2000 characters
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add Photos (Optional - Max 3)
              </label>
              
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedImages.length < 3 && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload images</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG up to 5MB each</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                  />
                </label>
              )}
            </div>

            {/* Location Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</h3>
              {currentLocation ? (
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p>📍 {address || 'Fetching address...'}</p>
                  <p className="text-xs">
                    Coordinates: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  ⚠️ Please enable location services to report an incident
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !currentLocation}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                loading || !currentLocation
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              }`}
            >
              {loading ? 'Reporting...' : 'Submit Report'}
            </button>
          </form>

          {/* Information Box */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              📋 Reporting Guidelines
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Be as detailed and accurate as possible</li>
              <li>• Include specific times and locations</li>
              <li>• Anonymous reports help protect your identity</li>
              <li>• False reports may result in account suspension</li>
              <li>• For immediate emergencies, call local authorities first</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIncident;
