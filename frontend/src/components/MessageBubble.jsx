import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function MessageBubble({ role, text, typing, time }) {
    const isUser = role === 'user'
    const textRef = useRef(null)

    // Gradient colors
    const userGradient = 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)'
    const aiGradient = 'linear-gradient(90deg, #f3f4f6, #e5e7eb, #d1d5db)'

    return (
        <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
            <motion.div
                className="inline-block px-4 py-3 rounded-2xl shadow-lg border break-words whitespace-normal flex flex-col"
                style={{
                    borderColor: isUser ? '#c7d2fe' : '#d1d5db',
                    background: isUser ? userGradient : aiGradient,
                    color: isUser ? 'white' : '#1f2937',
                }}
                animate={
                    typing
                        ? {
                            backgroundPosition: ['0% 50%', '50% 50%', '100% 50%'],
                        }
                        : {}
                }
                transition={{
                    duration: 2,
                    repeat: typing ? Infinity : 0,
                    ease: 'easeInOut',
                }}
            >
                <AnimatePresence>
                    {typing ? (
                        <motion.span
                            className="inline-flex gap-1"
                            initial={{ scaleY: 0.95 }}
                            animate={{ scaleY: [0.95, 1.05, 0.95] }}
                            transition={{ duration: 0.8, repeat: Infinity, repeatType: 'mirror' }}
                        >
                            <i className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-.2s]"></i>
                            <i className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></i>
                            <i className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:.2s]"></i>
                        </motion.span>
                    ) : (
                        <p ref={textRef} className="leading-relaxed text-base">
                            {text}
                        </p>
                    )}
                </AnimatePresence>

                {/* Timestamp aligned to the right bottom */}
                {time && (
                    <p className="text-xs text-gray-400 mt-1 self-end">
                        {new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                )}
            </motion.div>
        </div>
    )
}