"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MapPinned,
  PackageSearch,
  Bot,
  ShieldAlert,
  Menu,
  X,
  Truck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/"
    },
    {
      name: "Live Tracker",
      icon: MapPinned,
      path: "/tracker"
    },
    {
      name: "Shipments",
      icon: PackageSearch,
      path: "/shipments"
    },
    {
      name: "AI Copilot",
      icon: Bot,
      path: "/copilot"
    },
    {
      name: "Admin Control",
      icon: ShieldAlert,
      path: "/admin"
    }
  ];

  const SidebarContent = () => (
    <div className="h-full w-[260px] bg-gradient-to-b from-[#120a2e] via-[#0b0d23] to-[#070816] border-r border-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.05)] flex flex-col justify-between">
      
      {/* Logo */}
      <div>
        <div className="px-6 py-8 border-b border-cyan-500/10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <Truck className="text-cyan-300 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white text-lg font-bold tracking-wide">ChainPulse AI</h1>
              <p className="text-xs text-cyan-400">Supply Command Center</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="mt-6 px-3 flex flex-col gap-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = pathname === item.path;

            return (
              <motion.button
                key={index}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  router.push(item.path);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  active
                    ? "bg-cyan-500/15 border border-cyan-400/20 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
                    : "text-gray-400 hover:text-cyan-200 hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-6 border-t border-cyan-500/10">
        <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
          <p className="text-cyan-300 text-sm font-semibold">Realtime Sync Active</p>
          <p className="text-gray-400 text-xs mt-1">Monitoring live shipment streams</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 w-full z-50 bg-[#0b0d23]/90 backdrop-blur-xl border-b border-cyan-500/10 px-4 py-4 flex items-center justify-between">
        <h1 className="text-cyan-300 font-bold text-lg">ChainPulse AI</h1>
        <button onClick={() => setMobileOpen(true)}>
          <Menu className="text-white w-6 h-6" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen z-40">
        <SidebarContent />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-50"
            />

            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.35 }}
              className="lg:hidden fixed left-0 top-0 h-screen z-50"
            >
              <div className="relative h-full">
                <SidebarContent />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-5 right-4 text-white"
                >
                  <X />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}