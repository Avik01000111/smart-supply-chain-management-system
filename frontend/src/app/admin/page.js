"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/common/sidebar";
import Topbar from "@/app/components/common/topbar";
import Loader from "@/app/components/common/loader";
import { motion } from "framer-motion";
import {
  DatabaseZap,
  Boxes,
  Activity,
  RefreshCcw,
  CheckCircle2
} from "lucide-react";

export default function AdminPage() {
  const [shipmentCount, setShipmentCount] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedNumber, setSeedNumber] = useState(20);
  const [message, setMessage] = useState("");

  const fetchAdminStats = async () => {
    try {
      const [shipmentRes, analyticsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API}/api/shipment/all`),
        fetch(`${process.env.NEXT_PUBLIC_API}/api/analytics/dashboard`)
      ]);

      const shipmentData = await shipmentRes.json();
      const analyticsData = await analyticsRes.json();

      setShipmentCount(shipmentData.data?.length || 0);
      setAnalytics(analyticsData.data || {});
      setLoading(false);
    } catch (error) {
      console.log("Admin Fetch Error:", error);
      setLoading(false);
    }
  };

  const seedDemoShipments = async () => {
    try {
      setSeeding(true);
      setMessage("");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/shipment/seed-demo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          count: seedNumber
        })
      });

      const data = await res.json();

      setMessage(data.message || `${seedNumber} shipments seeded successfully`);
      await fetchAdminStats();
      setSeeding(false);
    } catch (error) {
      setMessage("Failed to seed shipments");
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();

    const interval = setInterval(fetchAdminStats, 8000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader text="Loading Admin Simulation Controls..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070816] via-[#0b0d23] to-[#120a2e] text-white">
      <Sidebar />

      <div className="lg:ml-[260px] pt-[72px] lg:pt-0">
        <Topbar title="Admin Simulation Control Room" />

        <div className="p-4 sm:p-6 lg:p-8 space-y-8">

          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <div className="rounded-3xl bg-white/5 border border-white/5 p-6">
              <Boxes className="text-cyan-300 mb-4" />
              <p className="text-gray-400 text-sm">Live Shipments in Network</p>
              <h2 className="text-3xl font-bold mt-2">{shipmentCount}</h2>
            </div>

            <div className="rounded-3xl bg-white/5 border border-white/5 p-6">
              <Activity className="text-purple-300 mb-4" />
              <p className="text-gray-400 text-sm">Critical Risks</p>
              <h2 className="text-3xl font-bold mt-2">
                {analytics?.criticalShipments || 0}
              </h2>
            </div>

            <div className="rounded-3xl bg-white/5 border border-white/5 p-6">
              <RefreshCcw className="text-green-300 mb-4" />
              <p className="text-gray-400 text-sm">Delivered Shipments</p>
              <h2 className="text-3xl font-bold mt-2">
                {analytics?.deliveredShipments || 0}
              </h2>
            </div>
          </div>

          {/* Seed Demo Section */}
          <div className="rounded-3xl bg-white/5 border border-white/5 p-6 sm:p-8">
            <h2 className="text-cyan-300 text-xl font-semibold mb-6">
              Demo Shipment Injection Engine
            </h2>

            <div className="flex flex-col md:flex-row gap-4 md:items-center">
              <input
                type="number"
                min="1"
                max="100"
                value={seedNumber}
                onChange={(e) => setSeedNumber(e.target.value)}
                className="bg-white/5 border border-cyan-500/10 rounded-2xl px-5 py-4 outline-none text-white w-full md:w-[220px]"
              />

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={seedDemoShipments}
                disabled={seeding}
                className="px-8 py-4 rounded-2xl bg-cyan-500/15 border border-cyan-400/20 text-cyan-300 hover:bg-cyan-500/25 transition-all flex items-center justify-center gap-2"
              >
                {seeding ? (
                  <>
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                    Injecting...
                  </>
                ) : (
                  <>
                    <DatabaseZap className="w-4 h-4" />
                    Seed Demo Shipments
                  </>
                )}
              </motion.button>
            </div>

            {message && (
              <div className="mt-5 rounded-2xl bg-green-500/10 border border-green-400/10 p-4 flex items-center gap-2 text-green-300">
                <CheckCircle2 className="w-4 h-4" />
                {message}
              </div>
            )}
          </div>

          {/* Simulation Info */}
          <div className="rounded-3xl bg-white/5 border border-white/5 p-6">
            <h2 className="text-cyan-300 text-lg font-semibold mb-4">
              Live Simulation Engine Status
            </h2>

            <div className="space-y-3 text-sm text-gray-300 leading-7">
              <p>• Shipment movement cron cycle running every 5 seconds</p>
              <p>• Analytics intelligence refresh every 10 seconds</p>
              <p>• AI Copilot connected with NVIDIA inference + local fallback</p>
              <p>• Realtime Firebase shipment network active</p>
              <p>• Smart reroute approval system enabled for critical risks</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}