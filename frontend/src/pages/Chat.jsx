import React, { useState } from "react";
import ChatPanel from "../components/ChatPanel";
import VoicePanel from "../components/VoicePanel";
import ToggleTabs from "../components/ToggleTabs";
import CrisisOverlay from "../components/CrisisOverlay";
import AnimatedBackground from "../components/AnimatedBackground";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function App() {
  const [mode, setMode] = useState("chat");
  const [crisisMessage, setCrisisMessage] = useState(null);

  const crisisActive = Boolean(crisisMessage);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-800 via-indigo-900 to-pink-800 text-white overflow-hidden flex items-center justify-center">
      <AnimatedBackground />

      {crisisActive && (
        <CrisisOverlay
          message={crisisMessage}
          onClose={() => setCrisisMessage(null)}
        />
      )}

      <div
        className={[
          "relative w-full max-w-6xl bg-white/5 backdrop-blur-l rounded-3xl border border-white/20 shadow-2xl p-6 sm:p-8 overflow-hidden transition",
          crisisActive ? "pointer-events-none blur-sm" : "",
        ].join(" ")}
      >
        {/* Header with glassy effect */}
        <div className="flex items-center justify-between mb-6">
          {/* <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-300 via-indigo-400 to-pink-400 bg-clip-text text-transparent animate-glow">
              <Link to="/">AI-Therapist</Link>
            </h1>
            <p className="text-gray-300 text-sm mt-1">Compassion powered by AI</p>
          </div> */}
          <div>
            {/* Glow animation integrated in JSX */}
            <style>
              {`
      @keyframes glow {
        0%, 100% {
          text-shadow: 0 0 8px rgba(167,85,247,0.7), 0 0 18px rgba(236,72,153,0.35);
        }
        50% {
          text-shadow: 0 0 12px rgba(167,85,247,0.9), 0 0 24px rgba(236,72,153,0.5);
        }
      }
      .hover-glow:hover {
        animation: glow 1.5s ease-in-out infinite;
      }
    `}
            </style>

            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-300 via-indigo-400 to-pink-400 bg-clip-text text-transparent hover-glow transition-all duration-300">
              <Link to="/">AI-Therapist</Link>
            </h1>
            <p className="text-gray-300 text-sm mt-1">
              Compassion powered by AI
            </p>
          </div>

          <ToggleTabs mode={mode} onChange={setMode} />
        </div>

        {/* Panels container */}
        <div className="relative flex justify-center items-center">
          {/* Chat Panel */}
          <motion.div
            key="chat"
            initial={false}
            animate={{
              opacity: mode === "chat" ? 1 : 0,
              x: mode === "chat" ? 0 : -30,
            }}
            transition={{ duration: 0.4 }}
            className={`w-full transition-all ${
              mode !== "chat" ? "pointer-events-none absolute top-0 left-0" : ""
            }`}
          >
            <ChatPanel active={true} onCrisis={setCrisisMessage} />
          </motion.div>

          {/* Voice Panel */}
          <motion.div
            key="voice"
            initial={false}
            animate={{
              opacity: mode === "voice" ? 1 : 0,
              x: mode === "voice" ? 0 : 30,
            }}
            transition={{ duration: 0.4 }}
            className={`w-full transition-all ${
              mode !== "voice"
                ? "pointer-events-none absolute top-0 left-0"
                : ""
            }`}
          >
            <VoicePanel active={true} onCrisis={setCrisisMessage} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}