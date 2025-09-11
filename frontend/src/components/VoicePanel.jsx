import React, { useState, useRef, useEffect } from "react";
import { Mic } from "lucide-react";
import useRecorder from "../hooks/useRecorder";
import { transcribeAudio } from "../lib/apiClient";
import Orb from "./Orb";
import useSession from "../hooks/useSession";
import MessageBubble from "./MessageBubble";

export default function VoicePanel({ active, onCrisis }) {
  const [sessionId, setSessionId] = useSession();
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const endRef = useRef(null);

  const { isRecording, error, toggleRecording } = useRecorder({
    onStop: async (blob) => {
      if (!blob || blob.size === 0) {
        setErrorMessage("No audio recorded.");
        return;
      }
      setStatus("processing");
      setErrorMessage("");
      try {
        const isFirst = !sessionId;
        const data = await transcribeAudio(blob, isFirst, sessionId);
        setSessionId(data.session_id);

        const botMsg = {
          id: crypto.randomUUID(),
          role: "assistant",
          text: data.reply_text || "—",
          crisis: data.crisis || false,
          time: new Date(),
        };

        setMessages((prev) => [...prev, botMsg]);

        if (data.crisis) {
          onCrisis?.(data.reply_text);
        }

        if (data.reply_audio_base64) {
          const audio = new Audio(
            `data:audio/wav;base64,${data.reply_audio_base64}`
          );
          audio.play();
        } else {
          setErrorMessage("No audio available for playback.");
        }
      } catch (e) {
        console.error("Voice API error:", e);
        setErrorMessage("Failed to process audio. Try again.");
      } finally {
        setStatus("idle");
      }
    },
  });

  // Auto-scroll on new message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className={`rounded-3xl border border-white/20 bg-white/5 backdrop-blur-xl shadow-2xl flex flex-row h-[560px] transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-50 blur-sm"
      }`}
    >
      {/* Left Section: Chat history (2/3 width) */}
      <div className="w-2/3 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            role={m.role}
            text={m.text}
            time={m.time}
          />
        ))}
        <div ref={endRef} />
      </div>

      {/* Right Section: Controls (1/3 width) */}
      <div className="w-1/3 flex flex-col items-center justify-center p-6 border-l border-white/20">
        <div className="flex items-center justify-center w-60 h-60 mb-10">
          <Orb active={isRecording} />
        </div>

        <p className="text-gray-300 min-h-[24px] text-sm mb-6 text-center">
          {isRecording
            ? "Listening…"
            : status === "processing"
            ? "Processing…"
            : "Tap mic to start"}
        </p>

        <button
          onClick={toggleRecording}
          className={`h-16 w-16 rounded-full flex items-center justify-center border shadow transition-all ${
            isRecording
              ? "bg-indigo-600 text-white border-indigo-600 scale-105"
              : "bg-white/10 hover:bg-white/20 text-white border-white/20"
          }`}
          aria-pressed={isRecording}
          aria-label="Toggle microphone"
          title="Toggle microphone"
        >
          <Mic className="w-7 h-7" />
        </button>

        {(error || errorMessage) && (
          <p className="text-sm text-red-600 text-center mt-2">
            {error || errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}