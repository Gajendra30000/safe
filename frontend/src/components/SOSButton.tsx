import { useState } from "react";
import { AlertTriangle, Mic, Video, Send, X, StopCircle } from "lucide-react";
import api from "../services/api";
import { useLocation } from "../contexts/LocationContext";
import { useRef } from "react";

export default function SOSButton() {
  const { location } = useLocation();
  const [isActive, setIsActive] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async (type: "audio" | "video") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video"
      });

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: type === "video" ? "video/webm" : "audio/webm" });
        handleSOS(blob, type);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      alert("Please allow camera/microphone access.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
    setIsRecording(false);
  };

  const handleSOS = async (mediaBlob?: Blob, type?: string) => {
    if (!location) {
      alert("Location not available. Please enable location services.");
      return;
    }

    setIsSending(true);
    setIsActive(true);

    try {
      const { data: contacts } = await api.get("/favorites");
      const contactIds = contacts.map((c: any) => c._id);

      const formData = new FormData();
      formData.append("message", `Emergency SOS Alert! ${type ? `Contains ${type} message.` : ""}`);
      formData.append("location", JSON.stringify({
        type: "Point",
        coordinates: [location.longitude, location.latitude],
      }));
      formData.append("contactIds", JSON.stringify(contactIds));

      if (mediaBlob) {
        formData.append("media", mediaBlob, `sos_${type}_${Date.now()}.webm`);
      }

      await api.post("/sos", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("SOS alert sent to your emergency contacts!");
    } catch (error: any) {
      console.error("SOS error:", error);
      alert("Failed to send SOS alert. Please try again.");
    } finally {
      setIsSending(false);
      setShowOptions(false);
      setTimeout(() => setIsActive(false), 2000);
    }
  };

  if (isRecording) {
    return (
      <button
        onClick={stopRecording}
        className="w-32 h-32 rounded-full bg-red-600 animate-pulse flex flex-col items-center justify-center shadow-2xl"
      >
        <StopCircle className="w-12 h-12 text-white mb-1" />
        <span className="text-white font-bold text-xs">STOP & SEND</span>
      </button>
    );
  }

  if (showOptions) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={() => startRecording("audio")}
            className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-700 flex flex-col items-center justify-center text-white"
          >
            <Mic className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">AUDIO</span>
          </button>
          <button
            onClick={() => startRecording("video")}
            className="w-20 h-20 rounded-full bg-indigo-600 hover:bg-indigo-700 flex flex-col items-center justify-center text-white"
          >
            <Video className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">VIDEO</span>
          </button>
          <button
            onClick={() => handleSOS()}
            className="w-20 h-20 rounded-full bg-gray-600 hover:bg-gray-700 flex flex-col items-center justify-center text-white"
          >
            <Send className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">QUICK</span>
          </button>
        </div>
        <button
          onClick={() => setShowOptions(false)}
          className="text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowOptions(true)}
      disabled={isSending}
      className={`w-32 h-32 rounded-full flex items-center justify-center transition-all transform ${isActive
        ? "bg-red-600 scale-110 animate-pulse"
        : "bg-danger hover:bg-danger-dark hover:scale-105"
        } shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-white mx-auto mb-2" />
        <span className="text-white font-bold text-lg">SOS</span>
      </div>
    </button>
  );
}
