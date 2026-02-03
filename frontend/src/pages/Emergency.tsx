import SOSButton from "../components/SOSButton";
import { useLocation } from "../contexts/LocationContext";
import { MapPin, Phone } from "lucide-react";

export default function Emergency() {
  const { location } = useLocation();

  const emergencyNumbers = [
    { name: "Police", number: "100", icon: "🚓" },
    { name: "Ambulance", number: "102", icon: "🚑" },
    { name: "Fire", number: "101", icon: "🚒" },
    { name: "Women Helpline", number: "1091", icon: "👮‍♀️" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          Emergency Center
        </h1>

        {/* SOS Button */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Emergency SOS
            </h2>
            <p className="text-gray-400 mb-6">
              Press and hold the SOS button to send alerts to your emergency
              contacts
            </p>
            <div className="flex justify-center">
              <SOSButton />
            </div>
            {location && (
              <div className="mt-6 flex items-center justify-center text-gray-400">
                <MapPin className="w-5 h-5 mr-2" />
                <span>
                  Location: {location.latitude.toFixed(4)},{" "}
                  {location.longitude.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Numbers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Emergency Hotlines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyNumbers.map((service, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{service.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {service.name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {service.number}
                    </p>
                  </div>
                </div>
                <a
                  href={`tel:${service.number}`}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
