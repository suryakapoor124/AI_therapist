import React, { useState } from "react"
import ChatPanel from "../components/ChatPanel"
import VoicePanel from "../components/VoicePanel"
import ToggleTabs from "../components/ToggleTabs"
import CrisisOverlay from "../components/CrisisOverlay"
import { motion } from "framer-motion"

export default function App() {
  const [mode, setMode] = useState("chat")
  const [crisisMessage, setCrisisMessage] = useState(null)

  const crisisActive = Boolean(crisisMessage)

  return (
    <div className="min-h-screen py-10 px-4 flex items-center justify-center relative bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e]">
      {crisisActive && (
        <CrisisOverlay
          message={crisisMessage}
          onClose={() => setCrisisMessage(null)}
        />
      )}

      <div
        className={[
          "w-full max-w-6xl bg-slate-900/90 backdrop-blur rounded-3xl shadow-2xl border border-slate-700/50 p-6 sm:p-8 overflow-hidden transition",
          crisisActive ? "pointer-events-none blur-sm" : ""
        ].join(" ")}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              AI-Therapist
            </h1>
            <p className="text-slate-400 text-sm">Compassion powered by AI</p>
          </div>
          <ToggleTabs mode={mode} onChange={setMode} />
        </div>

        {/* Panels container */}
        <div className="relative">
          {/* Chat Panel */}
          <motion.div
            key="chat"
            initial={false}
            animate={{
              opacity: mode === "chat" ? 1 : 0,
              x: mode === "chat" ? 0 : -30,
            }}
            transition={{ duration: 0.4 }}
            className={`w-full transition-all ${mode !== "chat" ? "pointer-events-none absolute top-0 left-0" : ""
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
            className={`w-full transition-all ${mode !== "voice" ? "pointer-events-none absolute top-0 left-0" : ""
              }`}
          >
            <VoicePanel active={true} onCrisis={setCrisisMessage} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}