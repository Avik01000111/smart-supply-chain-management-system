"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/common/sidebar";
import Topbar from "@/app/components/common/topbar";
import Loader from "@/app/components/common/loader";
import { motion } from "framer-motion";
import {
  Truck,
  MapPinned,
  Gauge,
  Fuel,
  ShieldAlert
} from "lucide-react";

export default function TrackerPage() {
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchShipments = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/shipment/all`);
      const data = await res.json();

      setShipments(data.data || []);
      if (!selectedShipment && data.data?.length > 0) {
        setSelectedShipment(data.data[0]);
      }
      setLoading(false);
    } catch (error) {
      console.log("Tracker Fetch Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();

    
   
  const failSafeLoader = setTimeout(() => {
    setLoading(false);
  }, 4000);

  const interval = setInterval(fetchShipments, 6000);

  return () => {
    clearInterval(interval);
    clearTimeout(failSafeLoader);
  };
}, []);

  if (loading) return <Loader text="Loading Live Shipment Tracker..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070816] via-[#0b0d23] to-[#120a2e] text-white">
      <Sidebar />

      <div className="lg:ml-[260px] pt-[72px] lg:pt-0">
        <Topbar title="Live Shipment Tracker" />

        <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* Animated Map Grid */}
          <div className="xl:col-span-3 rounded-3xl bg-white/5 border border-white/5 p-4 sm:p-6 relative overflow-hidden min-h-[500px]">

            <h2 className="text-cyan-300 font-semibold text-lg mb-4">
              Realtime Shipment Geolocation Grid
            </h2>

            <div className="relative w-full h-[420px] rounded-3xl bg-gradient-to-br from-[#11142d] to-[#0b0d23] border border-cyan-500/10 overflow-hidden">

              {/* Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

              {/* Shipment Dots */}
              {shipments.map((shipment, index) => {
                const posX = ((shipment.currentLng + 180) / 360) * 100;
                const posY = ((90 - shipment.currentLat) / 180) * 100;

                return (
                  <motion.div
                    key={index}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    onClick={() => setSelectedShipment(shipment)}
                    className="absolute cursor-pointer"
                    style={{
                      left: `${posX}%`,
                      top: `${posY}%`
                    }}
                  >
                    <div className="relative">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          shipment.riskLabel === "Critical"
                            ? "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]"
                            : shipment.riskLabel === "Warning"
                            ? "bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)]"
                            : "bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)]"
                        }`}
                      />
                      <Truck className="absolute -top-5 -left-1 text-white w-4 h-4" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Shipment Detail Panel */}
          <div className="rounded-3xl bg-white/5 border border-white/5 p-5">
            <h2 className="text-cyan-300 font-semibold text-lg mb-5">
              Shipment Intelligence
            </h2>

            {selectedShipment ? (
              <div className="space-y-5">

                <div className="rounded-2xl bg-cyan-500/10 p-4 border border-cyan-400/10">
                  <p className="text-gray-400 text-xs">Shipment ID</p>
                  <h3 className="text-xl font-bold mt-1">{selectedShipment.shipmentId}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <Gauge className="text-cyan-300 mb-2" />
                    <p className="text-xs text-gray-400">Speed</p>
                    <h4 className="font-semibold">{selectedShipment.speed} km/h</h4>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4">
                    <Fuel className="text-cyan-300 mb-2" />
                    <p className="text-xs text-gray-400">Fuel</p>
                    <h4 className="font-semibold">{selectedShipment.fuel}%</h4>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4">
                    <ShieldAlert className="text-cyan-300 mb-2" />
                    <p className="text-xs text-gray-400">Risk</p>
                    <h4 className="font-semibold">{selectedShipment.riskScore}%</h4>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4">
                    <MapPinned className="text-cyan-300 mb-2" />
                    <p className="text-xs text-gray-400">Status</p>
                    <h4 className="font-semibold">{selectedShipment.status}</h4>
                  </div>
                </div>

                <div className="rounded-2xl bg-red-500/10 border border-red-400/10 p-4">
                  <p className="text-xs text-gray-400">Predicted Issue</p>
                  <h4 className="text-red-300 font-medium mt-2">
                    {selectedShipment.predictedIssue}
                  </h4>
                </div>

                <div className="rounded-2xl bg-purple-500/10 border border-purple-400/10 p-4">
                  <p className="text-xs text-gray-400">Suggested Reroute</p>
                  <h4 className="text-purple-300 font-medium mt-2">
                    {selectedShipment.suggestedReroute?.routeName || "No reroute required"}
                  </h4>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Select a shipment node to inspect.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
