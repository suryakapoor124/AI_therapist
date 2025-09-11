import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessageBubble({ role, text, typing, time }) {
  const isUser = role === 'user';
  const textRef = useRef(null);

  // Gradient colors
  const userGradient = 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)';
  const aiGradient = 'linear-gradient(135deg, #1f1c3c, #2e2a53, #1f1c3c)';

  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <motion.div
        className=" px-4 py-3 rounded-2xl shadow-2xl border break-words whitespace-pre-wrap flex flex-col transition-transform duration-200"
        style={{
          borderColor: isUser ? 'rgba(167,85,247,0.5)' : 'rgba(255,255,255,0.1)',
          background: isUser ? userGradient : aiGradient,
          color: isUser ? 'white' : '#e5e7eb',
          backgroundSize: '200% 100%',
          maxWidth: '65%', // Limit bubble width
        }}
        whileHover={{ 
          boxShadow: isUser 
            ? '0 0 25px rgba(236,72,153,0.6), 0 0 40px rgba(167,85,247,0.4)'
            : '0 0 20px rgba(99,102,241,0.5), 0 0 35px rgba(167,85,247,0.25)',
          scale: 1.02 
        }}
        animate={
          typing
            ? { backgroundPosition: ['0% 50%', '50% 50%', '100% 50%'] }
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

        {time && (
          <p className="text-xs text-gray-400 mt-1 self-end">
            {new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </motion.div>
    </div>
  );
}