// src/pages/Home.jsx
import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Reviews from "../components/Reviews";
import About from "../components/About";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] min-h-screen text-white">
      <Navbar />
      <Hero />
      <Features />
      <Reviews />
      <About />
      <Footer />
    </div>
  );
}