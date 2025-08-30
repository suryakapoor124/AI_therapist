import React, { useState, useRef, useEffect } from 'react'
import { Mic } from 'lucide-react'
import useRecorder from '../hooks/useRecorder'
import { transcribeAudio } from '../lib/apiClient'
import Orb from './Orb'
import useSession from '../hooks/useSession'

export default function VoicePanel({ active, onCrisis }) {
    const [sessionId, setSessionId] = useSession()
    const [messages, setMessages] = useState([])
    const [status, setStatus] = useState('idle')
    const [errorMessage, setErrorMessage] = useState('')
    const endRef = useRef(null)

    const { isRecording, error, toggleRecording } = useRecorder({
        onStop: async (blob) => {
            if (!blob || blob.size === 0) {
                setErrorMessage('No audio recorded.')
                return
            }

            setStatus('processing')
            setErrorMessage('')
            try {
                const isFirst = !sessionId
                const data = await transcribeAudio(blob, isFirst, sessionId)
                setSessionId(data.session_id)
                const botMsg = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    text: data.reply_text || '—',
                    crisis: data.crisis || false,
                    time: new Date(),
                }
                setMessages((prev) => [...prev, botMsg])

                if (data.crisis) {
                    onCrisis?.(data.reply_text)
                }

                if (data.reply_audio_base64) {
                    const audio = new Audio(`data:audio/wav;base64,${data.reply_audio_base64}`)
                    audio.play()
                } else {
                    setErrorMessage('No audio available for playback.')
                }
            } catch (e) {
                console.error('Voice API error:', e)
                setErrorMessage('Failed to process audio. Try again.')
            } finally {
                setStatus('idle')
            }
        },
    })

    // Auto-scroll on new message
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    return (
        <div
            className={`rounded-3xl border bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] shadow-lg flex flex-row h-[560px] transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-50 blur-sm'
                }`}
        >
            {/* Left Section: Chat history (2/3 width) */}
            <div className="w-2/3 overflow-y-auto p-4 space-y-4">
                {messages.map((m) => (
                    <div key={m.id} className="flex items-start gap-2">
                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 shadow-md" />
                        <div
                            className={`p-3 rounded-xl shadow-lg text-base max-w-[85%] ${m.crisis
                                ? 'border border-red-400 bg-gradient-to-r from-red-500 to-red-400 text-white'
                                : 'border border-gray-300 bg-gradient-to-r from-gray-200 to-gray-100 text-gray-800'
                                }`}
                        >
                            {m.text}
                            <p className="text-xs text-gray-400 mt-1">
                                {m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            {/* Right Section: Controls (1/3 width) */}
            <div className="w-1/3 flex flex-col items-center justify-center p-4 border-l border-slate-600">
                {/* Orb with space below */}
                <div className="scale-110 sm:scale-125 mb-20">
                    <Orb active={isRecording} />
                </div>

                {/* Status text with space below */}
                <p className="text-gray-300 min-h-[24px] text-sm mb-6 text-center">
                    {isRecording
                        ? 'Listening…'
                        : status === 'processing'
                            ? 'Processing…'
                            : 'Tap mic to start'}
                </p>

                {/* Mic button */}
                <button
                    onClick={toggleRecording}
                    className={`h-14 w-14 rounded-full flex items-center justify-center border shadow transition-all 
            ${isRecording
                            ? 'bg-indigo-600 text-white border-indigo-600 scale-105'
                            : 'bg-white hover:bg-gray-50'}
          `}
                    aria-pressed={isRecording}
                    aria-label="Toggle microphone"
                    title="Toggle microphone"
                >
                    <Mic className="w-6 h-6" />
                </button>

                {/* Error messages */}
                {(error || errorMessage) && (
                    <p className="text-sm text-red-600 text-center mt-2">{error || errorMessage}</p>
                )}
            </div>
        </div>
    )
}