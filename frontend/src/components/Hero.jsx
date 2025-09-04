import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import heroIllustration from "../assets/Robot.png";
import { Link } from "react-router-dom";


gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const floatRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // parallax scroll for illustration
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          y: -80,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.9,
          },
        });
      }

      // floating overlay animation (independent of scroll)
      if (floatRef.current) {
        gsap.to(floatRef.current, {
          y: -20,
          x: 20,
          rotation: 3,
          duration: 6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      // entrance for headline
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          y: 30,
          opacity: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
          },
        });
      }

      // entrance for image (same as title)
      if (imageRef.current) {
        gsap.from(imageRef.current, {
          y: 50,
          opacity: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
          },
        });
      }

      // force refresh on mount so parallax works every time
      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // mousemove parallax - subtle
  const handleMouseMove = (e) => {
    if (!containerRef.current || !imageRef.current || !titleRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(imageRef.current, { x: x * 18, y: y * 12, duration: 0.6, ease: "power3.out" });
    gsap.to(titleRef.current, { x: x * 8, y: y * 6, duration: 0.6, ease: "power3.out" });
  };

  return (
    <section
      id="hero"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[85vh] flex items-center justify-center px-6 pt-28 pb-12 overflow-hidden" 
      // ↑ increased pt-28 so image starts below navbar
    >
      {/* background radial glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -left-32 -top-56 w-[680px] h-[680px] rounded-full bg-gradient-to-br from-purple-700/40 via-indigo-700/25 to-transparent blur-3xl opacity-80" />
        <div className="absolute -right-44 bottom-[-120px] w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-pink-600/30 via-blue-500/10 to-transparent blur-2xl opacity-80" />
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-10 items-center">
        {/* left: text */}
        <div className="relative z-10">
          <motion.h1
            ref={titleRef}
            className="text-5xl md:text-6xl font-extrabold leading-tight max-w-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-300  to-pink-300"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            whileHover={{
              scale: 1.02,
              textShadow: "0 0 20px rgba(167,85,247,0.7), 0 0 36px rgba(236,72,153,0.35)",
            }}
          >
            AI Therapist
          </motion.h1>

          <motion.p
            className="mt-6 text-lg md:text-xl text-gray-300 max-w-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.8, ease: "easeOut" }}
          >
            Gentle, evidence-informed conversations that help you reflect, cope, and feel better — anytime, anywhere.
          </motion.p>

          <div className="mt-8 flex gap-4">
            {/* <motion.a
              href="/chat"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg"
              whileHover={{
                scale: 1.03,
                boxShadow: "0 8px 30px rgba(168,85,247,0.28), 0 0 40px rgba(236,72,153,0.18)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
                Start a Conversation
            </motion.a> */}
            <Link
  to="/chat"
  className="inline-flex items-center gap-3 px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg"
>
  Start a Conversation
</Link>

            <motion.a
              href="#features"
              className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/6 border border-white/8"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              Explore Features
            </motion.a>
          </div>

          <div className="mt-6 flex items-center gap-4 text-sm text-gray-400">
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-white/4 rounded-full border border-white/6">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span>Confidential</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-white/4 rounded-full border border-white/6">
              <span className="font-semibold">24/7</span>
              <span>Available</span>
            </div>
          </div>
        </div>

        {/* right: illustration */}
        <div className="relative flex items-center justify-center mt-10 md:mt-0">
          {/* floating decorative overlay */}
          <div
            ref={floatRef}
            className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-indigo-700/30 to-pink-600/20 blur-2xl opacity-60 transform rotate-3"
          />

          <div ref={imageRef} className="relative z-20 w-full max-w-md">
            <div className="rounded-3xl overflow-hidden p-6 bg-white/4 backdrop-blur-md border border-white/6 shadow-2xl">
              <img
                src={heroIllustration}
                alt="Therapist illustration"
                className="w-full h-auto"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1531259683007-016a2a5a9c52?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=1d244bfb2c0db5e6da1b0bdf0f6f0a7c";
                }}
              />
            </div>

            <div className="mt-6 rounded-2xl p-4 bg-gradient-to-r from-white/6 to-white/4 border border-white/6 backdrop-blur-sm shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/80 flex items-center justify-center text-white font-semibold">
                AI
              </div>
              <div>
                <div className="text-sm text-gray-200 font-semibold">Compassionate Listening</div>
                <div className="text-xs text-gray-400">Non-judgmental, supportive replies.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}