"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, LayoutDashboard, BarChart3, ShieldCheck, CheckCircle2 } from "lucide-react";

// --- Components ---

const TechBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-blue-900" />
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30" />
  </div>
);

const SystemLog = ({ logs }: { logs: string[] }) => (
  <div className="h-40 w-full bg-blue-950/50 rounded-lg border border-blue-400/30 p-4 font-mono text-xs text-blue-200 overflow-hidden relative shadow-inner">
    <div className="flex flex-col h-full space-y-2 overflow-y-auto scrollbar-hide">
      {logs.map((log, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex items-start gap-2 shrink-0"
        >
          <span className="text-blue-500 opacity-70 whitespace-nowrap">[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span>
          <span className="font-semibold text-blue-100">{'>'} {log}</span>
        </motion.div>
      ))}
    </div>
  </div>
);

export default function LandingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const logSequence = [
    "Initializing Admin Ticketing System...",
    "Loading Product Data (Catatmark, Joki Informatika, Orbit Billiard)...",
    "Syncing Ticket Workflow & Status Rules...",
    "Validating SLA & Deadline Configuration...",
    "Connecting to Ticket Database...",
    "Applying Admin Access Control...",
    "System Ready. Redirecting to Dashboard..."
  ];

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setProgress(0);
    let currentProgress = 0;
    const stepRate = 0.4; // Significantly slower for a more impressive system initialization feel

    const timer = setInterval(() => {
      currentProgress += stepRate;
      const displayProgress = Math.min(currentProgress, 100);
      setProgress(displayProgress);

      const logIdx = Math.floor((displayProgress / 100) * logSequence.length);
      if (logIdx < logSequence.length) {
        setLogs(prev => {
          if (prev.includes(logSequence[logIdx])) return prev;
          return [...prev, logSequence[logIdx]];
        });
      }

      if (currentProgress >= 100) {
        setIsReady(true);
        clearInterval(timer);
        router.push("/login");
      }
    }, 40);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans text-white bg-[#0A1332]">
      <TechBackground />

      {/* Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-[128px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] mix-blend-screen animate-pulse" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isReady ? {
          scale: [1, 1.05, 0],
          opacity: [1, 1, 0],
          rotate: [0, 2, -2]
        } : {
          opacity: 1,
          scale: 1
        }}
        transition={isReady ? {
          duration: 0.8,
          times: [0, 0.2, 1],
          ease: "easeInOut"
        } : {
          duration: 0.8
        }}
        className="z-10 w-full max-w-5xl px-6"
      >
        {/* Main Card */}
        <div className="bg-blue-950/80 backdrop-blur-xl border border-blue-400/30 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-10 md:p-14 relative overflow-hidden">

          {/* Shine effect when ready */}
          <AnimatePresence>
            {isReady && (
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>

          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-12">
            <div className="flex items-center gap-6">
              <motion.div
                animate={isReady ? { scale: [1, 1.2, 1], rotate: [0, 10, 0] } : {}}
                className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 transform transition-transform flex-shrink-0"
              >
                <Ticket size={32} className="text-white" />
              </motion.div>
              <div className="flex flex-col justify-center">
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white mb-3 drop-shadow-lg whitespace-nowrap leading-none">
                  Diraya Tech Ticketing System
                </h1>
                <div>
                  <span className="text-cyan-100 font-semibold text-[10px] md:text-xs tracking-[0.2em] bg-blue-800/30 px-4 py-1.5 rounded-full border border-blue-400/30 shadow-[0_0_15px_rgba(34,211,238,0.1)] uppercase backdrop-blur-sm inline-block">
                    Multi-Product Admin Ticketing Portal
                  </span>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center flex-shrink-0">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-blue-900/50" />
                <motion.circle
                  cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-cyan-400"
                  initial={{ strokeDasharray: "0 352" }}
                  animate={{ strokeDasharray: `${progress * 3.52} 352` }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <motion.span
                  animate={isReady ? { scale: [1, 1.3, 1] } : {}}
                  className="text-3xl font-bold font-mono text-white drop-shadow-md"
                >
                  {Math.floor(progress)}%
                </motion.span>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">System Initialization Log</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-green-400 font-mono">ONLINE</span>
                </div>
              </div>
              <SystemLog logs={logs} />
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">Core System Modules</h3>
              {[
                { name: "Dashboard Overview", icon: LayoutDashboard },
                { name: "Ticket Management", icon: Ticket },
                { name: "Report & Analytics", icon: BarChart3 },
                { name: "Admin Session Control", icon: ShieldCheck }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-blue-900/40 rounded-lg border border-blue-800/50 hover:bg-blue-800/40 transition-colors">
                  <item.icon size={16} className="text-cyan-400" />
                  <span className="text-sm font-medium text-blue-100 flex-1">{item.name}</span>
                  <CheckCircle2 size={16} className="text-green-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-blue-950/40 rounded-full overflow-hidden border border-blue-400/20 shadow-inner mt-4">
            <motion.div
              className="h-full bg-blue-600 relative"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.1 }}
            >
              {/* Animated Shine Effect */}
              <motion.div
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-6 text-blue-400/60 text-xs font-semibold tracking-widest uppercase">
        Powered by Diraya Tech
      </div>
    </div>
  );
}
