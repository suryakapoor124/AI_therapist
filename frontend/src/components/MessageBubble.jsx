import React from 'react'

export default function MessageBubble({ role, text, typing }) {
    const isUser = role === 'user'
    return (
        <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
            <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg border ${
                    isUser
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-400 text-white border-indigo-300'
                        : 'bg-gradient-to-r from-gray-200 to-gray-100 text-gray-800 border-gray-300'
                }`}
            >
                {typing ? (
                    <span className="inline-flex gap-1">
                        <i className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-.2s]"></i>
                        <i className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></i>
                        <i className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:.2s]"></i>
                    </span>
                ) : (
                    <p className="leading-relaxed text-base">{text}</p>
                )}
            </div>
        </div>
    )
}