import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function CrisisOverlay({ message, onClose }) {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="relative bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center cursor-default border-2 border-red-500/50"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <motion.div
                    className="flex justify-center mb-4"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <AlertTriangle className="w-12 h-12 text-red-400" />
                </motion.div>

                <h2 className="text-2xl font-bold text-red-400 mb-3">Crisis Alert</h2>
                <p className="text-slate-200 font-medium mb-6">{message}</p>
                <p className="text-sm text-slate-400 italic">
                    Tap anywhere outside to continue the conversation
                </p>

                <div className="absolute -inset-2 rounded-2xl border-2 border-red-500/30 animate-pulse"></div>
            </motion.div>
        </motion.div>
    );
}