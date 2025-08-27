import React, { useState } from 'react'
import ChatPanel from './components/ChatPanel'
import VoicePanel from './components/VoicePanel'
import ToggleTabs from './components/ToggleTabs'
import CrisisOverlay from './components/CrisisOverlay'

export default function App() {
  const [mode, setMode] = useState('chat')
  const [crisisMessage, setCrisisMessage] = useState(null)

  const crisisActive = Boolean(crisisMessage)

  return (
    <div className="min-h-screen py-10 px-4 flex items-center justify-center relative">
      {/* Crisis overlay */}
      {crisisActive && (
        <CrisisOverlay
          message={crisisMessage}
          onClose={() => setCrisisMessage(null)}
        />
      )}

      {/* OUTER BOX */}
      <div
        className={[
          "w-full max-w-6xl bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-white/70 p-6 sm:p-8 overflow-visible transition",
          crisisActive ? "pointer-events-none blur-sm" : ""
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI-Therapist
            </h1>
            <p className="text-gray-500 text-sm">Compassion powered by AI</p>
          </div>
          <ToggleTabs mode={mode} onChange={setMode} />
        </div>

        {/* TWO PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className={[
              "transition-all duration-300 ease-out transform-gpu",
              mode === "chat"
                ? "scale-[1.02] z-10"
                : "scale-[0.98] opacity-75 blur-[1px] pointer-events-none"
            ].join(" ")}
          >
            <ChatPanel active={mode === "chat"} onCrisis={setCrisisMessage} />
          </div>

          <div
            className={[
              "transition-all duration-300 ease-out transform-gpu",
              mode === "voice"
                ? "scale-[1.02] z-10"
                : "scale-[0.98] opacity-75 blur-[1px] pointer-events-none"
            ].join(" ")}
          >
            <VoicePanel active={mode === "voice"} onCrisis={setCrisisMessage} />
          </div>
        </div>
      </div>
    </div>
  )
}