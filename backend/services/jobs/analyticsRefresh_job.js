const {
  fetchAllShipmentsFromFirebase,
} = require("../shipment/shipment_service");

const cron = require("node-cron");
const {syncAnalyticsToFirebase,
      calculateTotalActiveShipments,
  calculateCriticalShipments,
  calculateDeliveredShipments,
  calculateAverageRisk,
}=require('../analytics/dashboardAnalytics_service')


async function runAnalyticsRefreshCycle() {
  try {
    console.log("📊 Starting Analytics Refresh Cycle...");

    const shipments = await fetchAllShipmentsFromFirebase();

    if (!shipments || shipments.length === 0) {
      console.log("⚠️ No shipments available for analytics refresh");

      await syncAnalyticsToFirebase({
        totalActiveShipments: 0,
        criticalShipments: 0,
        deliveredShipments: 0,
        averageRisk: 0,
      });

      return;
    }

    const totalActiveShipments = calculateTotalActiveShipments(shipments);
    const criticalShipments = calculateCriticalShipments(shipments);
    const deliveredShipments = calculateDeliveredShipments(shipments);
    const averageRisk = calculateAverageRisk(shipments);

    const warningShipments =
      totalActiveShipments - criticalShipments - deliveredShipments;

    const logisticsHealthScore = Math.max(0, 100 - averageRisk);

    await syncAnalyticsToFirebase({
      totalActiveShipments,
      criticalShipments,
      deliveredShipments,
      warningShipments,
      averageRisk,
      logisticsHealthScore,
    });

    console.log("✅ Analytics Refresh Cycle Completed");
  } catch (error) {
    console.error("❌ Analytics Refresh Cycle Error:", error.message);
  }
}




const startAnalyticsRefreshJob = () => {
  cron.schedule("*/10 * * * * *", async () => {
    console.log("Refreshing analytics dashboard...");
    await runAnalyticsRefreshCycle();
  });
};

module.exports = {
  startAnalyticsRefreshJob,runAnalyticsRefreshCycle
};