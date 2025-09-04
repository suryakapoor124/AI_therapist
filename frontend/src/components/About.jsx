import React from "react";
import { motion } from "framer-motion";

export default function About() {
  return (
    <section
      id="about"
      className="relative py-24 bg-gradient-to-b from-transparent to-black/20 overflow-hidden"
    >
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        {/* Title with same animation as Features & Reviews */}
        <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  viewport={{ once: false }}
                  className="text-4xl font-bold mb-12"
                >
          About AI Therapist
        </motion.h2>

        {/* Card with subtle hover glow & parallax-like lift */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          whileHover={{
            scale: 1.04,
            y: -4,
            boxShadow:
              "0 6px 20px rgba(167, 85, 247, 0.25), 0 0 25px rgba(236, 72, 153, 0.18)",
            transition: { duration: 0.2, ease: "easeOut" },
          }}
          className="relative rounded-2xl p-8 border border-white/6 backdrop-blur-md bg-white/5 shadow-xl text-gray-200 overflow-hidden"
        >
          {/* glowing orbs background */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute -left-20 -top-20 w-72 h-72 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse" />
            <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full blur-3xl opacity-20 bg-gradient-to-br from-indigo-500 to-teal-500 animate-pulse delay-2000" />
          </div>

          <p className="text-lg leading-relaxed">
            AI Therapist is designed to offer compassionate, evidence-informed
            conversational support. Our mission is to make accessible, private,
            and thoughtful mental health assistance available to everyone.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <h4 className="text-lg font-semibold text-purple-200">
                Team Codex
              </h4>
              <p className="text-sm text-gray-300">
                Prem • Shaurya • Surya • Jayanth
              </p>
            </div>

            <div className="flex gap-4">
              <motion.a
                whileHover={{
                  scale: 1.06,
                  boxShadow:
                    "0 4px 15px rgba(167, 85, 247, 0.3), 0 0 20px rgba(236, 72, 153, 0.2)",
                }}
                href="mailto:contact@aitherapist.com"
                className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-md text-sm font-medium"
              >
                📧 Contact
              </motion.a>
              <motion.a
                whileHover={{
                  scale: 1.06,
                  boxShadow:
                    "0 4px 15px rgba(79, 70, 229, 0.3), 0 0 20px rgba(99, 102, 241, 0.2)",
                }}
                href="/privacy"
                className="px-5 py-2 rounded-full bg-white/6 border border-white/8 text-sm font-medium"
              >
                Privacy
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}