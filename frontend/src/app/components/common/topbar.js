"use client";

import { useEffect, useState } from "react";
import { Search, Bell, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";

export default function Topbar({ title = "Supply Chain Command Center" }) {
  const [backendStatus, setBackendStatus] = useState("checking");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/health`);
        const data = await res.json();

        if (data.success) {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      } catch (error) {
        setBackendStatus("offline");
      }
    };

    checkBackendStatus();

    const interval = setInterval(checkBackendStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full sticky top-0 z-30 bg-[#0b0d23]/80 backdrop-blur-xl border-b border-cyan-500/10 px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

      {/* Search Bar */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 w-4 h-4" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search shipments, routes, alerts..."
          className="w-full bg-white/5 border border-cyan-500/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
        
        {/* Backend Status */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
            backendStatus === "online"
              ? "bg-cyan-500/10 border-cyan-400/20 text-cyan-300"
              : backendStatus === "offline"
              ? "bg-red-500/10 border-red-400/20 text-red-300"
              : "bg-yellow-500/10 border-yellow-400/20 text-yellow-300"
          }`}
        >
          {backendStatus === "online" ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span className="text-xs sm:text-sm font-medium">
            {backendStatus === "online"
              ? "Backend Synced"
              : backendStatus === "offline"
              ? "Backend Offline"
              : "Checking..."}
          </span>
        </motion.div>

        {/* Notification */}
        <div className="relative p-3 rounded-2xl bg-white/5 border border-white/5 text-cyan-300">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        </div>

        {/* Title */}
        <div className="hidden lg:block text-right">
          <h2 className="text-white font-semibold text-base">{title}</h2>
          <p className="text-xs text-cyan-400">Realtime Logistics Monitoring</p>
        </div>
      </div>
    </div>
  );
}
