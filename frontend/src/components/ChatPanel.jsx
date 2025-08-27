import React, { useEffect, useRef, useState } from 'react'
import { Send, Volume2 } from 'lucide-react'
import MessageBubble from './MessageBubble'
import { sendTextMessage } from '../lib/apiClient'
import { motion, AnimatePresence } from 'framer-motion'
import useSession from '../hooks/useSession'

export default function ChatPanel({ active }) {
    const [sessionId, setSessionId] = useSession()
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const endRef = useRef(null)
    const hasFetched = useRef(false)
    const audioRef = useRef(null) // Ref to manage audio playback

    // Fetch greeting only once
    useEffect(() => {
        if (!hasFetched.current) {
            fetchGreeting()
            hasFetched.current = true
        }
    }, [])

    async function fetchGreeting() {
        try {
            const isFirst = !sessionId
            const reply = await sendTextMessage('', isFirst, sessionId)
            setSessionId(reply.session_id)
            setMessages([{
                id: crypto.randomUUID(),
                role: 'assistant',
                text: reply.reply_text,
                reply_audio_base64: reply.reply_audio_base64,
                time: new Date(),
            }])
        } catch (err) {
            console.error('Failed to load greeting:', err)
        }
    }

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    async function onSubmit(e) {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMsg = {
            id: crypto.randomUUID(),
            role: 'user',
            text: input,
            time: new Date(),
        }
        setMessages((m) => [...m, userMsg])
        setInput('')
        setLoading(true)

        try {
            const reply = await sendTextMessage(input, false, sessionId)
            setSessionId(reply.session_id)
            setMessages((m) => [...m, {
                id: crypto.randomUUID(),
                role: 'assistant',
                text: reply.reply_text,
                reply_audio_base64: reply.reply_audio_base64,  // Add this
                time: new Date(),
            }])
        } catch (err) {
            console.error(err)
            setMessages((m) => [...m, {
                id: crypto.randomUUID(),
                role: 'assistant',
                text: 'Sorry, something went wrong. Please try again.',
                time: new Date(),
            }])
        } finally {
            setLoading(false)
        }
    }

    function toggleAudioPlayback(replyAudioBase64) {
        if (audioRef.current) {
            // If audio is already playing, stop it
            audioRef.current.pause()
            audioRef.current = null
        } else if (replyAudioBase64) {
            // Decode base64 and play audio
            const audio = new Audio(`data:audio/wav;base64,${replyAudioBase64}`)
            audioRef.current = audio
            audio.play()
            audio.onended = () => {
                // Reset audioRef when playback ends
                audioRef.current = null
            }
        } else {
            console.error('No audio available for playback.')
        }
    }

    return (
        <div className="rounded-3xl p-6 border bg-white shadow-lg flex flex-col h-[560px]">
            {/* Messages (scroll inside) */}
            <div className="flex-1 overflow-y-auto pr-3 space-y-4">
                <AnimatePresence>
                    {messages.map((m) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex items-start gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {/* AI avatar */}
                            {m.role === 'assistant' && (
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">
                                    AI
                                </div>
                            )}

                            <div>
                                <MessageBubble role={m.role} text={m.text} />
                                <p className="text-xs text-gray-400 mt-1">
                                    {m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>

                            {/* Play voice button */}
                            {m.role === 'assistant' && (
                                <button
                                    onClick={() => toggleAudioPlayback(m.reply_audio_base64)}
                                    className="p-2 rounded-full hover:bg-gray-100 text-indigo-600 transition"
                                    title="Play voice"
                                >
                                    <Volume2 className="w-4 h-4" />
                                </button>
                            )}

                            {/* User avatar */}
                            {m.role === 'user' && (
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 text-xs font-bold">
                                    U
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && <MessageBubble role="assistant" text="Thinking…" typing />}
                <div ref={endRef} />
            </div>

            {/* Input pinned at bottom */}
            <form onSubmit={onSubmit} className="mt-4 flex items-center gap-3">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                />
                <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-3 text-white shadow-md hover:bg-indigo-600 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!input.trim() || loading}
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    )
}