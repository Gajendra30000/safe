import { Shield, Target, Heart, Users } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            About SafePath AI
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            AI-powered safety assistance platform designed to keep you safe
            during your journeys
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Our Mission
            </h3>
            <p className="text-gray-400">
              To provide everyone with intelligent safety tools that help them
              navigate safely, connect quickly in emergencies, and build a
              supportive community focused on safety awareness.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Our Vision
            </h3>
            <p className="text-gray-400">
              A world where everyone feels safe and empowered with real-time AI
              assistance, emergency resources, and a connected community ready
              to support each other.
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                AI Safety Assistant
              </h4>
              <p className="text-gray-400 text-sm">
                Chat with our AI to find safe locations and get safety tips
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-danger" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Emergency SOS
              </h4>
              <p className="text-gray-400 text-sm">
                One-tap emergency alerts to your trusted contacts
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Community Support
              </h4>
              <p className="text-gray-400 text-sm">
                Connect with others and share safety experiences
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Built with Care
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            SafePath AI is developed with a focus on user safety, privacy, and
            accessibility. We use cutting-edge AI technology and real-time
            location services to provide you with the best safety assistance
            possible.
          </p>
        </div>
      </div>
    </div>
  );
}
