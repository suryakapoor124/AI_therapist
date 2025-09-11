import React from 'react'
import { MessageCircle, Mic } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ToggleTabs({ mode, onChange }) {
  const tabs = [
    { key: 'chat', label: 'Chat', icon: <MessageCircle className="w-4 h-4" /> },
    { key: 'voice', label: 'Voice', icon: <Mic className="w-4 h-4" /> },
  ]

  return (
    <div className="flex gap-2 bg-white/5 backdrop-blur-xl rounded-full p-1 shadow-md">
      {tabs.map((tab) => {
        const isActive = mode === tab.key
        return (
          <motion.button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            aria-pressed={isActive}
            className="relative flex items-center gap-2 px-5 py-2 rounded-full text-white/80 font-semibold cursor-pointer focus:outline-none"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {tab.icon}
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}