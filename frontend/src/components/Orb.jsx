import React from "react";
import { motion } from "framer-motion";

export default function Orb({ active }) {
    return (
        <div className="relative flex items-center justify-center">
            {/* Main orb with synced animated glow */}
            <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                animate={
                    active
                        ? {
                            scale: [1, 1.08, 1],
                            boxShadow: [
                                "0 0 15px rgba(99,102,241,0.6)",   // indigo
                                "0 0 25px rgba(168,85,247,0.6)",  // purple
                                "0 0 20px rgba(236,72,153,0.6)",  // pink
                                "0 0 15px rgba(99,102,241,0.6)",  // back to indigo
                            ],
                        }
                        : { scale: 1, boxShadow: "0 0 0 rgba(0,0,0,0)" }
                }
                transition={
                    active
                        ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        : { duration: 0.3 }
                }
            />

            {/* Synced sonar ring */}
            {active && (
                <motion.div
                    className="absolute w-20 h-20 rounded-full border-2 border-indigo-400"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.2, // small offset for natural emission
                    }}
                />
            )}
        </div>
    );
}