import React from "react";

export default function Navbar() {
  return (
    <nav className="fixed top-3 left-1/2 transform -translate-x-1/2 z-50 w-[94%] max-w-6xl 
                    backdrop-blur-md bg-white/6 border border-white/8 rounded-xl 
                    px-6 py-2.5 flex items-center justify-between shadow-md">
      {/* Logo */}
      <a href="#hero" className="flex items-center gap-3">
        {/* <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-base">I</span>
        </div> */}
        <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-blue-300 to-pink-300">
          AI Therapist
        </span>
      </a>

      {/* Nav links */}
      <div className="flex items-center gap-7">
        {["Features", "Reviews", "About"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-sm md:text-base font-medium relative transition duration-300
                       hover:text-purple-300 hover:scale-105
                       hover:drop-shadow-[0_0_8px_rgba(167,85,247,0.9)]
                       after:absolute after:left-0 after:bottom-[-3px] after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-purple-400 after:to-pink-400 after:transition-all after:duration-300 hover:after:w-full"
          >
            {item}
          </a>
        ))}

        {/* CTA button */}
        <a
          href="/chat"
          className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-md transition transform hover:scale-110 hover:shadow-[0_0_20px_rgba(236,72,153,0.4),0_0_28px_rgba(167,85,247,0.4)]"
        >
          <span className="text-sm md:text-base font-semibold">Start Chat</span>
        </a>
      </div>
    </nav>
  );
}