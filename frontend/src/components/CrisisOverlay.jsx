import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react"; // nice warning icon

export default function CrisisOverlay({ message, onClose }) {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose} // click anywhere to close
        >
            <motion.div
                className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center cursor-default border-2 border-red-400"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()} // prevent closing when clicking box
            >
                {/* Pulsing icon */}
                <motion.div
                    className="flex justify-center mb-4"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <AlertTriangle className="w-12 h-12 text-red-600" />
                </motion.div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-red-700 mb-3">Crisis Alert</h2>

                {/* Crisis message */}
                <p className="text-gray-800 font-medium mb-6">{message}</p>

                {/* Instruction */}
                <p className="text-sm text-gray-500 italic">
                    Tap anywhere outside to continue the conversation
                </p>

                {/* Red glow effect */}
                <div className="absolute -inset-2 rounded-2xl border-2 border-red-500 animate-pulse opacity-30"></div>
            </motion.div>
        </motion.div>
    );
}