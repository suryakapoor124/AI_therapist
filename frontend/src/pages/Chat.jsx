import React, { useState } from 'react'
import ChatPanel from '../components/ChatPanel'
import VoicePanel from '../components/VoicePanel'
import ToggleTabs from '../components/ToggleTabs'
import CrisisOverlay from '../components/CrisisOverlay'

export default function App() {
  const [mode, setMode] = useState('chat')
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
          "w-full max-w-6xl bg-slate-900/90 backdrop-blur rounded-3xl shadow-2xl border border-slate-700/50 p-6 sm:p-8 overflow-visible transition",
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