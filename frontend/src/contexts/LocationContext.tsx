import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

interface Location {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  location: Location | null;
  updateLocation: (coords: Location) => Promise<void>;
  startTracking: () => void;
  stopTracking: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [location, setLocation] = useState<Location | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const updateLocation = async (coords: Location) => {
    setLocation(coords);
    if (user) {
      try {
        await api.put("/users/location", {
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      } catch (error) {
        console.error("Failed to update location:", error);
      }
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        updateLocation(coords);
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  useEffect(() => {
    if (user) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => stopTracking();
  }, [user]);

  return (
    <LocationContext.Provider value={{ location, updateLocation, startTracking, stopTracking }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return context;
}
