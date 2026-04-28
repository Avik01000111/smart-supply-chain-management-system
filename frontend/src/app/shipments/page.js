"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/common/sidebar";
import Topbar from "@/app/components/common/topbar";
import Loader from "@/app/components/common/loader";
import { motion } from "framer-motion";
import { RefreshCcw, ShieldAlert, Truck } from "lucide-react";

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reroutingId, setReroutingId] = useState(null);

  const fetchShipments = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/shipment/all`);
      const data = await res.json();

      setShipments(data.data || []);
      setLoading(false);
    } catch (error) {
      console.log("Shipment Fetch Error:", error);
      setLoading(false);
    }
  };

  const approveReroute = async (shipmentId) => {
    try {
      setReroutingId(shipmentId);

      await fetch(
        `${process.env.NEXT_PUBLIC_API}/api/shipment/${shipmentId}/approve-reroute`,
        {
          method: "POST"
        }
      );

      await fetchShipments();
      setReroutingId(null);
    } catch (error) {
      console.log("Reroute Error:", error);
      setReroutingId(null);
    }
  };

  useEffect(() => {
    fetchShipments();

    const interval = setInterval(fetchShipments, 7000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader text="Loading Shipment Operations..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070816] via-[#0b0d23] to-[#120a2e] text-white">
      <Sidebar />

      <div className="lg:ml-[260px] pt-[72px] lg:pt-0">
        <Topbar title="Shipment Operations Desk" />

        <div className="p-4 sm:p-6 lg:p-8">

          <div className="rounded-3xl bg-white/5 border border-white/5 p-4 sm:p-6 overflow-x-auto">
            <h2 className="text-cyan-300 text-lg font-semibold mb-6">
              All Active Shipment Intelligence
            </h2>

            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="border-b border-white/5 text-gray-400">
                  <th className="text-left py-4">Shipment ID</th>
                  <th className="text-left py-4">Speed</th>
                  <th className="text-left py-4">Fuel</th>
                  <th className="text-left py-4">Risk</th>
                  <th className="text-left py-4">Status</th>
                  <th className="text-left py-4">Issue</th>
                  <th className="text-left py-4">Reroute</th>
                </tr>
              </thead>

              <tbody>
                {shipments.map((shipment, index) => (
                  <motion.tr
                    key={index}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                    className="border-b border-white/5"
                  >
                    <td className="py-5 font-semibold text-cyan-300">
                      {shipment.shipmentId}
                    </td>

                    <td>{shipment.speed} km/h</td>

                    <td>{shipment.fuel}%</td>

                    <td>
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-medium ${
                          shipment.riskLabel === "Critical"
                            ? "bg-red-500/10 text-red-300"
                            : shipment.riskLabel === "Warning"
                            ? "bg-yellow-500/10 text-yellow-300"
                            : "bg-cyan-500/10 text-cyan-300"
                        }`}
                      >
                        {shipment.riskScore}%
                      </span>
                    </td>

                    <td>{shipment.status}</td>

                    <td className="text-gray-400 max-w-[220px]">
                      {shipment.predictedIssue}
                    </td>

                    <td>
                      {shipment.riskScore >= 70 ? (
                        <button
                          onClick={() => approveReroute(shipment.shipmentId)}
                          disabled={reroutingId === shipment.shipmentId}
                          className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-400/20 text-purple-300 hover:bg-purple-500/30 transition-all flex items-center gap-2"
                        >
                          {reroutingId === shipment.shipmentId ? (
                            <>
                              <RefreshCcw className="w-4 h-4 animate-spin" />
                              Processing
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-4 h-4" />
                              Approve Reroute
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-gray-500 text-xs">Stable Route</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
            <div className="rounded-3xl bg-white/5 p-5 border border-white/5">
              <Truck className="text-cyan-300 mb-3" />
              <p className="text-gray-400 text-sm">Total Operational Shipments</p>
              <h3 className="text-2xl font-bold mt-2">{shipments.length}</h3>
            </div>

            <div className="rounded-3xl bg-white/5 p-5 border border-white/5">
              <ShieldAlert className="text-red-300 mb-3" />
              <p className="text-gray-400 text-sm">Critical Reroute Needed</p>
              <h3 className="text-2xl font-bold mt-2">
                {shipments.filter((s) => s.riskScore >= 70).length}
              </h3>
            </div>

            <div className="rounded-3xl bg-white/5 p-5 border border-white/5">
              <RefreshCcw className="text-purple-300 mb-3" />
              <p className="text-gray-400 text-sm">Live Route Optimizations</p>
              <h3 className="text-2xl font-bold mt-2">
                {shipments.filter((s) => s.status === "Rerouted").length}
              </h3>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}