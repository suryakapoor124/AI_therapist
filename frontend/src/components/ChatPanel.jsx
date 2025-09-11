import React, { useEffect, useRef, useState } from 'react';
import { Send, Volume2 } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { sendTextMessage } from '../lib/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import useSession from '../hooks/useSession';
import TextareaAutosize from 'react-textarea-autosize';

export default function ChatPanel({ active, onCrisis }) {
  const [sessionId, setSessionId] = useSession();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const hasFetched = useRef(false);
  const audioRef = useRef(null);
  const [playingAudioId, setPlayingAudioId] = useState(null);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchGreeting();
      hasFetched.current = true;
    }
  }, []);

  async function fetchGreeting() {
    try {
      const isFirst = !sessionId;
      const reply = await sendTextMessage('', isFirst, sessionId);
      setSessionId(reply.session_id);
      setMessages([{
        id: crypto.randomUUID(),
        role: 'assistant',
        text: reply.reply_text,
        reply_audio_base64: reply.reply_audio_base64,
        time: new Date(),
      }]);

      if (reply.crisis) onCrisis?.(reply.reply_text);
    } catch (err) {
      console.error('Failed to load greeting:', err);
    }
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input,
      time: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendTextMessage(input, false, sessionId);
      setSessionId(reply.session_id);
      setMessages((m) => [...m, {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: reply.reply_text,
        reply_audio_base64: reply.reply_audio_base64,
        time: new Date(),
      }]);

      if (reply.crisis) onCrisis?.(reply.reply_text);
    } catch (err) {
      console.error(err);
      setMessages((m) => [...m, {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: 'Sorry, something went wrong. Please try again.',
        time: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  function toggleAudioPlayback(message) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingAudioId(null);
    } else if (message.reply_audio_base64) {
      const audio = new Audio(`data:audio/wav;base64,${message.reply_audio_base64}`);
      audioRef.current = audio;
      setPlayingAudioId(message.id);
      audio.play();
      audio.onended = () => {
        audioRef.current = null;
        setPlayingAudioId(null);
      };
    } else {
      console.error('No audio available for playback.');
    }
  }

  return (
    <div
      className={`rounded-3xl p-6 bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-pink-900/20 backdrop-blur-lg border border-white/20 shadow-2xl transition-opacity duration-300 ${
        active ? 'opacity-100' : 'opacity-50 blur-sm'
      }`}
      style={{ height: '560px' }}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto pr-3 space-y-4">
          <AnimatePresence>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-start gap-2 ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role === 'assistant' ? (
  <div className="flex items-start gap-2">
    {/* AI orb */}
    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md" />
    
    {/* Right side: play button above message bubble */}
    <div className="flex flex-col items-start gap-1">
      {m.reply_audio_base64 && (
        <button
          onClick={() => toggleAudioPlayback(m)}
          className={`p-2 rounded-full hover:bg-gray-700/30 transition ${
            playingAudioId === m.id ? 'text-pink-400' : 'text-indigo-300'
          }`}
          title="Play voice"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      )}
      <MessageBubble role={m.role} text={m.text} time={m.time} />
    </div>
  </div>
) : (
  <>
    <MessageBubble role={m.role} text={m.text} time={m.time} />
    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-bold">
      U
    </div>
  </>
)}

              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <MessageBubble role="assistant" text="Thinking…" typing time={new Date()} />
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={onSubmit} className="mt-4 flex items-center gap-3">
          <TextareaAutosize
            minRows={1}
            maxRows={6}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
            placeholder="Type your message..."
            className="flex-1 rounded-full border border-purple-600 bg-gray-900/80 text-white px-4 py-3 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition resize-none overflow-hidden"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500 px-4 py-3 text-white shadow-lg hover:scale-105 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!input.trim() || loading}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}