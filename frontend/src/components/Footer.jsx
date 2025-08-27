import React from "react";

export default function Footer() {
  return (
    <footer className="py-8 mt-12 border-t border-white/6 text-center">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-400">© {new Date().getFullYear()} AI Therapist • Team Codex</div>
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm text-gray-300 hover:text-white">Terms</a>
          <a href="#" className="text-sm text-gray-300 hover:text-white">Privacy</a>
          <a href="#" className="text-sm text-gray-300 hover:text-white">GitHub</a>
        </div>
      </div>
    </footer>
  );
}