"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/common/sidebar";
import Topbar from "@/app/components/common/topbar";
import Loader from "@/app/components/common/loader";
import {
  Truck,
  ShieldAlert,
  Activity,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState({});
const [shipments, setShipments] = useState([]);
const [loading, setLoading] = useState(true);

  // Fetch Dashboard Data
 const fetchWithTimeout = async (url, timeout = 8000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store"
    });
    clearTimeout(timer);
    return response;
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
};

const fetchDashboardData = async () => {
  try {
    const [analyticsRes, shipmentsRes] = await Promise.all([
      fetchWithTimeout(`${process.env.NEXT_PUBLIC_API}/api/analytics/dashboard`),
      fetchWithTimeout(`${process.env.NEXT_PUBLIC_API}/api/shipment/all`)
    ]);

    const analyticsData = await analyticsRes.json();
    const shipmentData = await shipmentsRes.json();

    setAnalytics(analyticsData?.data || {});
    setShipments(shipmentData?.data || []);
  } catch (error) {
    console.log("Dashboard Fetch Error:", error.message);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
  fetchDashboardData();

  const failSafeLoader = setTimeout(() => {
    setLoading(false);
  }, 4000);

  const interval = setInterval(fetchDashboardData, 8000);

  return () => {
    clearInterval(interval);
    clearTimeout(failSafeLoader);
  };
}, []);

  if (loading) return <Loader text="Loading Command Dashboard..." />;

  const highRiskShipments = shipments.filter(
    (item) => item.riskLabel === "Critical"
  );

  const recentAlerts = shipments
    .filter((item) => item.riskScore >= 70)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070816] via-[#0b0d23] to-[#120a2e] text-white">
      <Sidebar />

      <div className="lg:ml-[260px] pt-[72px] lg:pt-0">
        <Topbar title="Supply Chain Command Center" />

        <div className="p-4 sm:p-6 lg:p-8 space-y-8">

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              {
                title: "Total Shipments",
                value: analytics?.totalShipments || 0,
                icon: Truck,
                glow: "cyan"
              },
              {
                title: "Critical Risk",
                value: analytics?.criticalShipments || 0,
                icon: ShieldAlert,
                glow: "red"
              },
              {
                title: "Average Risk %",
                value: analytics?.averageRisk || 0,
                icon: Activity,
                glow: "purple"
              },
              {
                title: "Delivered",
                value: analytics?.deliveredShipments || 0,
                icon: CheckCircle2,
                glow: "green"
              }
            ].map((card, i) => {
              const Icon = card.icon;

              return (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl p-6 bg-white/5 border border-white/5 backdrop-blur-xl shadow-[0_0_30px_rgba(34,211,238,0.05)]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{card.title}</p>
                      <h2 className="text-3xl font-bold mt-3">{card.value}</h2>
                    </div>
                    <div className="p-4 rounded-2xl bg-cyan-500/10">
                      <Icon className="text-cyan-300 w-6 h-6" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Middle Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* High Risk Shipments */}
            <div className="xl:col-span-2 rounded-3xl bg-white/5 border border-white/5 p-6">
              <h2 className="text-lg font-semibold mb-5 text-cyan-300">
                High Risk Shipment Intelligence
              </h2>

              <div className="space-y-4">
                {highRiskShipments.length === 0 ? (
                  <p className="text-gray-400 text-sm">No critical shipments detected.</p>
                ) : (
                  highRiskShipments.slice(0, 5).map((shipment, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/5 rounded-2xl p-4 border border-red-500/10"
                    >
                      <div>
                        <h3 className="font-semibold text-white">{shipment.shipmentId}</h3>
                        <p className="text-sm text-gray-400">{shipment.predictedIssue}</p>
                      </div>
                      <div className="text-red-400 font-bold">
                        {shipment.riskScore}%
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Live Alerts */}
            <div className="rounded-3xl bg-white/5 border border-white/5 p-6">
              <h2 className="text-lg font-semibold mb-5 text-cyan-300">
                Live Alert Feed
              </h2>

              <div className="space-y-4">
                {recentAlerts.length === 0 ? (
                  <p className="text-gray-400 text-sm">No active alerts currently.</p>
                ) : (
                  recentAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-2xl bg-red-500/10 border border-red-400/10"
                    >
                      <div className="flex items-center gap-2 text-red-300 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium text-sm">{alert.shipmentId}</span>
                      </div>
                      <p className="text-xs text-gray-300">{alert.predictedIssue}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Shipment Activity Table */}
          <div className="rounded-3xl bg-white/5 border border-white/5 p-6 overflow-x-auto">
            <h2 className="text-lg font-semibold mb-5 text-cyan-300">
              Live Shipment Activity
            </h2>

            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-white/5">
                  <th className="text-left py-3">Shipment ID</th>
                  <th className="text-left py-3">Speed</th>
                  <th className="text-left py-3">Fuel</th>
                  <th className="text-left py-3">Risk</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Issue</th>
                </tr>
              </thead>
              <tbody>
                {shipments.slice(0, 8).map((shipment, index) => (
                  <tr key={index} className="border-b border-white/5">
                    <td className="py-4">{shipment.shipmentId}</td>
                    <td>{shipment.speed} km/h</td>
                    <td>{shipment.fuel}%</td>
                    <td className="text-cyan-300">{shipment.riskScore}%</td>
                    <td>{shipment.status}</td>
                    <td className="text-gray-400">{shipment.predictedIssue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
