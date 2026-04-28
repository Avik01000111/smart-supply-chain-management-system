"use client";

import { motion } from "framer-motion";
import { Truck, Activity } from "lucide-react";

export default function Loader({ text = "Initializing Logistics Intelligence..." }) {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-[#070816] via-[#0b0d23] to-[#120a2e] px-4">
      <div className="flex flex-col items-center justify-center gap-8">

        {/* Animated Outer Ring */}
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 6,
              ease: "linear",
            }}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-t-cyan-400 border-b-purple-500 border-l-transparent border-r-transparent"
          />

          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{
              repeat: Infinity,
              duration: 2,
            }}
            className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-cyan-500/10 backdrop-blur-xl border border-cyan-400/20 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.35)]"
          >
            <Truck className="text-cyan-300 w-8 h-8 sm:w-10 sm:h-10" />
          </motion.div>
        </div>

        {/* Scanning Bars */}
        <div className="flex gap-2 items-end h-10">
          {[1, 2, 3, 4, 5].map((bar) => (
            <motion.div
              key={bar}
              animate={{
                height: ["10px", "35px", "15px", "40px", "10px"],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                delay: bar * 0.12,
              }}
              className="w-2 sm:w-3 rounded-full bg-gradient-to-t from-cyan-400 to-purple-500"
            />
          ))}
        </div>

        {/* Loading Text */}
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
          className="text-center"
        >
          <h2 className="text-cyan-300 text-lg sm:text-xl font-semibold tracking-wide flex items-center justify-center gap-2">
            <Activity className="w-5 h-5" />
            {text}
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">
            Syncing live shipment streams...
          </p>
        </motion.div>
      </div>
    </div>
  );
}