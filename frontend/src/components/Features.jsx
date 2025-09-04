// components/Features.jsx
import React from "react";
import { motion } from "framer-motion";
import { useScroll, useTransform, motion as m } from "framer-motion";
import { MessageCircle, Mic, Heart, ShieldCheck } from "lucide-react";

const items = [
  {
    Icon: MessageCircle,
    title: "Chat with AI",
    desc: "Open, non-judgmental conversations.",
    tone: "from-purple-600 to-indigo-500",
  },
  {
    Icon: Mic,
    title: "Voice Interaction",
    desc: "Speak your thoughts, hear caring replies.",
    tone: "from-pink-500 to-purple-500",
  },
  {
    Icon: Heart,
    title: "Empathetic Responses",
    desc: "Responses designed to validate feelings.",
    tone: "from-emerald-500 to-teal-500",
  },
  {
    Icon: ShieldCheck,
    title: "Privacy-first",
    desc: "We prioritize confidentiality and We dont store any of your data",
    tone: "from-blue-600 to-indigo-600",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: false }}
          className="text-4xl font-bold text-center mb-12"
        >
          Features
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((it, idx) => {
            const Icon = it.Icon;
            return (
              // <motion.div
              //   key={idx}
              //   initial={{ opacity: 0, y: 50, scale: 0.9 }}
              //   whileInView={{ opacity: 1, y: 0, scale: 1 }}
              //   viewport={{ once: false }}
              //   transition={{
              //     duration: 0.8,
              //     delay: idx * 0.15,
              //     ease: "easeOut",
              //   }}
              //   whileHover={{
              //     scale: 1.08,
              //     y: -6,
              //     boxShadow:
              //       "0 0 20px rgba(167, 85, 247, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)",
              //     transition: { duration: 0.25, ease: "easeOut" },
              //   }}
              //   className="relative p-6 rounded-2xl overflow-hidden border border-white/10
              //              backdrop-blur-md bg-gradient-to-br from-white/5 to-white/10 shadow-xl
              //              transition-transform duration-300"
              // >
              //   {/* glow blob */}
              //   <div className="absolute inset-0 -z-10 pointer-events-none">
              //     <div
              //       className={`absolute -left-10 -top-10 w-56 h-56 rounded-full blur-3xl opacity-60 bg-gradient-to-br ${it.tone}`}
              //     />
              //   </div>

              //   <div className="flex items-start gap-4">
              //     <div className="p-3 rounded-xl bg-white/10 border border-white/20">
              //       <Icon className="w-7 h-7 text-white/90" />
              //     </div>

              //     <div>
              //       <h3 className="text-xl font-semibold">{it.title}</h3>
              //       <p className="mt-2 text-gray-200 text-sm">{it.desc}</p>
              //     </div>
              //   </div>

              //   <div className="mt-6 text-sm text-gray-300">
              //     <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10">
              //       AI-powered
              //     </span>
              //   </div>
              // </motion.div>
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false }}
                transition={{
                  duration: 0.8,
                  delay: idx * 0.15,
                  ease: "easeOut",
                }}
                whileHover={{
                  scale: 1.08,
                  y: -6,
                  boxShadow:
                    "0 0 20px rgba(167, 85, 247, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)",
                  transition: { duration: 0.25, ease: "easeOut" },
                }}
                className="relative p-8 rounded-3xl border border-white/10
             backdrop-blur-md shadow-2xl overflow-hidden bg-white/6
             transition-transform duration-300"
              >
                {/* glow blobs */}
                <div className="absolute inset-0 -z-10 pointer-events-none">
                  {/* upper glow blob - pink */}
                  <div
                    className="absolute -right-6 -top-6 w-32 h-32 rounded-full blur-2xl opacity-60 
                 bg-gradient-to-br from-pink-400 via-pink-500 to-rose-500"
                  />
                  {/* lower glow blob - teal/blue for contrast */}
                  <div
                    className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full blur-2xl opacity-40 
                 bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500"
                  />
                </div>

                {/* icon centered at top */}
                <div className="flex justify-center">
                  <div className="p-3 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white/90" />
                  </div>
                </div>

                {/* centered text under icon */}
                <div className="mt-6 text-center px-2">
                  <h3 className="text-2xl font-bold text-white">{it.title}</h3>
                  <p className="mt-3 text-gray-300 text-base leading-relaxed">
                    {it.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}