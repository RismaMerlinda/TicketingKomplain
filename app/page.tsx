"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Rocket, Sparkles, Code2, Database,
  Cpu, Layers, Box, Terminal, Wifi
} from "lucide-react";

// --- Sophisticated Background Elements ---

// Floating Code Snippet - elegant and slow
const FloatingSnippet = ({ delay, x, y, text }: { delay: number, x: string, y: string, text: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{
      opacity: [0, 0.4, 0],
      y: -100,
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut"
    }}
    className="absolute text-[10px] font-mono text-primary/30 pointer-events-none backdrop-blur-sm bg-white/20 px-2 py-1 rounded-md border border-white/10"
    style={{ left: x, top: y }}
  >
    {text}
  </motion.div>
);

// Glowing Orb - adds depth without dizziness
interface GlowingOrbProps {
  size: string;
  color: string;
  duration: number;
  delay: number;
  x: string;
  y: string;
}

const GlowingOrb = ({ size, color, duration, delay, x, y }: GlowingOrbProps) => (
  <motion.div
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
      boxShadow: [`0 0 20px ${color}`, `0 0 60px ${color}`, `0 0 20px ${color}`]
    }}
    transition={{ duration: duration, repeat: Infinity, delay: delay }}
    className="absolute rounded-full pointer-events-none blur-xl"
    style={{ width: size, height: size, backgroundColor: color, left: x, top: y }}
  />
);

// --- The Mascot Loader Component ---

const Stickman = ({ state }: { state: 'run' | 'stop' | 'look' | 'baa' }) => {
  // SVG Paths for different states
  const variants = {
    run: {
      d: [
        "M12 8 L12 16 M12 16 L8 21 M12 16 L16 21 M12 11 L6 14 M12 11 L18 8", // Frame 1
        "M12 8 L12 16 M12 16 L9 20 M12 16 L15 20 M12 11 L8 13 M12 11 L16 13", // Neutral
        "M12 8 L12 16 M12 16 L16 21 M12 16 L8 21 M12 11 L18 14 M12 11 L6 8"  // Frame 2
      ],
      transition: { duration: 0.2, repeat: Infinity, ease: "linear" }
    },
    stop: {
      d: "M12 8 L12 16 M12 16 L10 21 M12 16 L14 21 M12 11 L8 10 M12 11 L16 10", // Skid
      transition: { duration: 0.3 }
    },
    look: {
      d: "M12 8 L12 16 M12 16 L12 21 M12 16 L12 21 M12 11 L12 14 M12 11 L12 14", // Turning back (simplified)
      transition: { duration: 0.3 }
    },
    baa: {
      d: "M12 8 L12 16 M12 16 L8 22 M12 16 L16 22 M12 11 L4 6 M12 11 L20 6", // Arms WAY up
      transition: { type: "spring", stiffness: 500 }
    }
  };

  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary drop-shadow-md">
      {/* Head */}
      <motion.circle
        cx="12" cy="5" r="3"
        animate={state === 'baa' ? { r: 4, fill: "#fff" } : { r: 3 }}
      />

      {/* Body & Limbs */}
      <motion.path
        initial={{ d: variants.run.d[0] }}
        animate={{ d: (variants[state] as { d: string | string[] }).d }}
        transition={(variants[state] as { transition: object }).transition}
      />

      {/* Face Expressions */}
      <AnimatePresence>
        {state === 'look' && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Question Mark */}
            <text x="16" y="6" fontSize="8" fill="currentColor">?</text>
          </motion.g>
        )}
        {state === 'baa' && (
          <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}>
            {/* Shocked Eyes */}
            <circle cx="11" cy="4.5" r="0.5" fill="black" />
            <circle cx="13" cy="4.5" r="0.5" fill="black" />
            {/* Mouth */}
            <circle cx="12" cy="6.5" r="1" fill="black" />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
};

const MascotLoader = ({ progress }: { progress: number }) => {
  // Determine precise state
  let stickmanState: 'run' | 'stop' | 'look' | 'baa' = 'run';

  if (progress >= 45 && progress < 48) stickmanState = 'stop';
  else if (progress >= 48 && progress < 52) stickmanState = 'look';
  else if (progress >= 52 && progress < 55) stickmanState = 'baa';
  else stickmanState = 'run';

  return (
    <div className="relative w-full h-8 bg-white/10 rounded-full border border-white/20 backdrop-blur-md shadow-inner overflow-visible mt-12">
      {/* Fill */}
      <motion.div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-primary rounded-full"
        style={{ width: `${progress}%` }}
      >
        <motion.div
          className="absolute inset-0 bg-white/20"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* The Stickman Actor */}
      <motion.div
        className="absolute bottom-6 -ml-6 z-20"
        style={{ left: `${progress}%` }}
        animate={{
          y: stickmanState === 'run' ? [0, -4, 0] : 0,
        }}
        transition={{ duration: 0.15, repeat: Infinity }}
      >
        <div className="relative flex flex-col items-center">
          {/* Dramatic "BAAA!" Text */}
          <AnimatePresence>
            {stickmanState === 'baa' && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1.5, rotate: 10 }}
                exit={{ scale: 0 }}
                className="absolute -top-12 whitespace-nowrap bg-status-warning text-black font-black px-2 py-1 rounded border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] z-30"
              >
                BAAA!!! 🤪
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question Mark for 'Loop' */}
          <AnimatePresence>
            {stickmanState === 'look' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: -20 }}
                exit={{ opacity: 0 }}
                className="absolute -top-8 text-2xl font-bold text-primary"
              >
                ?
              </motion.div>
            )}
          </AnimatePresence>

          {/* The SVG Actor */}
          <Stickman state={stickmanState} />

          {/* Shadow */}
          <div className="w-8 h-1 bg-black/20 rounded-full blur-[1px]" />
        </div>
      </motion.div>
    </div>
  );
};

export default function LandingPage() {
  const router = useRouter();
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [sessionId, setSessionId] = useState("---");

  useEffect(() => {
    // Defer state update to avoid synchronous render warning
    const idTimer = setTimeout(() => {
      setSessionId(Math.random().toString(36).substring(7).toUpperCase());
    }, 0);

    // Custom Progress Logic
    let currentProgress = 0;
    const interval = setInterval(() => {
      if (currentProgress >= 100) {
        clearInterval(interval);
        return;
      }

      // Logic: Run normal -> Stop at 50% -> Wait -> Dash to 100%
      if (currentProgress < 45) {
        currentProgress += 1;
      } else if (currentProgress >= 45 && currentProgress < 55) {
        // SLOW DOWN / STOP for the "Peek"
        currentProgress += 0.2; // Very slow crawl
      } else {
        // SPEED UP after peek
        currentProgress += 2;
      }

      setProgress(currentProgress);
    }, 40);

    const timers = [
      setTimeout(() => setLoadingStep(1), 500),
      setTimeout(() => setLoadingStep(2), 2000), // Around the peek time
      setTimeout(() => setLoadingStep(3), 4000),
      setTimeout(() => router.push("/login"), 5000),
    ];

    return () => {
      clearTimeout(idTimer);
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-primary/20 text-white">

      {/* 1. LAYER: ELEGANT GRADIENT BACKGROUND (Not dizzying) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0E1F4D] to-[#1B3A8A] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-20" />

      {/* 2. LAYER: BEAUTIFUL FLOATING ORBS (Ambient) */}
      <GlowingOrb size="300px" color="rgba(14, 41, 218, 0.08)" x="-5%" y="10%" duration={8} delay={0} />
      <GlowingOrb size="400px" color="rgba(76, 107, 255, 0.08)" x="80%" y="60%" duration={12} delay={2} />
      <GlowingOrb size="200px" color="rgba(34, 197, 94, 0.08)" x="60%" y="-10%" duration={10} delay={1} />

      {/* 3. LAYER: FLOATING TECH ELEMENTS (Varied & Clean) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Code Snippets floating up */}
        <FloatingSnippet delay={0} x="10%" y="80%" text="<Secure />" />
        <FloatingSnippet delay={2} x="85%" y="70%" text="{ init: true }" />
        <FloatingSnippet delay={4} x="20%" y="60%" text="import Diraya" />
        <FloatingSnippet delay={1} x="70%" y="90%" text="const speed = 100" />

        {/* Icons floating freely */}
        <motion.div animate={{ y: [0, -20, 0], rotate: 10 }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-[20%] left-[15%] text-primary/20">
          <Box size={40} />
        </motion.div>
        <motion.div animate={{ y: [0, 30, 0], rotate: -10 }} transition={{ duration: 7, repeat: Infinity }} className="absolute bottom-[20%] right-[10%] text-accent-glow/30">
          <Layers size={50} />
        </motion.div>
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-[10%] right-[30%] text-green-500/20">
          <Wifi size={30} />
        </motion.div>
      </div>

      {/* MAIN CONTENT CARD */}
      <AnimatePresence mode="wait">
        <motion.div
          key="main-card-elegan"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="z-20 w-full max-w-xl p-4"
        >
          <div className="bg-[#162B63]/70 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/10 relative overflow-hidden ring-1 ring-white/10">

            {/* Top Decor */}
            <div className="flex justify-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-72 h-20"
              >
                <Image src="/diraya-logo.png" alt="Diraya Tech" fill className="object-contain" priority />
              </motion.div>
            </div>

            {/* Text Status Area */}
            <div className="h-12 flex flex-col items-center justify-center mb-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={loadingStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center"
                >
                  {loadingStep === 0 && <span className="text-text-muted text-sm font-medium flex items-center gap-2"><Sparkles size={14} className="text-yellow-500" /> Preparing Environment...</span>}
                  {loadingStep === 1 && <span className="text-primary text-sm font-medium flex items-center gap-2"><Database size={14} /> Fetching Data...</span>}
                  {loadingStep === 2 && <span className="text-orange-500 text-sm font-bold flex items-center gap-2 animate-pulse">Wait for it...</span>}
                  {loadingStep >= 3 && <span className="text-green-600 text-sm font-bold flex items-center gap-2"><Rocket size={14} /> Launching!</span>}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* THE MASCOT LOADER */}
            <MascotLoader progress={progress} />

            {/* Bottom Metadata */}
            <div className="mt-10 flex justify-between items-center text-[10px] text-gray-400 font-mono tracking-widest uppercase opacity-70">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                Secure Connection
              </span>
              <span>SID: {sessionId}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
