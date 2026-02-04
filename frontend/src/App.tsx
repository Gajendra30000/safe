import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "./contexts/AuthContext";
import { LocationProvider } from "./contexts/LocationContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatBot from "./components/ChatBot";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Emergency from "./pages/Emergency";
import Favorites from "./pages/Favorites";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ReportIncident from "./pages/ReportIncident";
import IncidentMap from "./pages/IncidentMap";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/emergency"
                  element={
                    <ProtectedRoute>
                      <Emergency />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community"
                  element={
                    <ProtectedRoute>
                      <Community />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report-incident"
                  element={
                    <ReportIncident />
                  }
                />
                <Route
                  path="/incidents"
                  element={
                    <IncidentMap />
                  }
                />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
            <Footer />
            <ChatBot />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
