// const initializeFirebaseAdmin = require("../../config/firebase");
const db = require('../../config/firebase')
function calculateTotalActiveShipments(shipments = []) {
  try {
    if (!Array.isArray(shipments)) {
      throw new Error("A valid shipments array is required");
    }

    let activeCount = 0;

    for (const shipment of shipments) {
      if (!shipment || typeof shipment !== "object") continue;

      const status =
        typeof shipment.status === "string" ? shipment.status.trim() : "";

      if (status !== "Delivered") {
        activeCount++;
      }
    }

    return activeCount;
  } catch (error) {
    console.error("❌ Active Shipment Calculation Error:", error.message);
    return 0;
  }
}
function calculateCriticalShipments(shipments = []) {
  try {
    if (!Array.isArray(shipments)) {
      throw new Error("A valid shipments array is required");
    }

    let criticalCount = 0;

    for (const shipment of shipments) {
      if (!shipment || typeof shipment !== "object") continue;

      const riskLabel =
        typeof shipment.riskLabel === "string" ? shipment.riskLabel.trim() : "";

      if (riskLabel === "Critical") {
        criticalCount++;
      }
    }

    return criticalCount;
  } catch (error) {
    console.error("❌ Critical Shipment Count Error:", error.message);
    return 0;
  }
}

function calculateAverageRisk(shipments = []) {
  try {
    if (!Array.isArray(shipments)) {
      throw new Error("A valid shipments array is required");
    }

    let totalRisk = 0;
    let validRiskCount = 0;

    for (const shipment of shipments) {
      if (!shipment || typeof shipment !== "object") continue;

      const delayRisk =
        typeof shipment.delayRisk === "number" ? shipment.delayRisk : null;

      if (delayRisk !== null && !isNaN(delayRisk)) {
        totalRisk += delayRisk;
        validRiskCount++;
      }
    }

    if (validRiskCount === 0) {
      return 0;
    }

    const averageRisk = totalRisk / validRiskCount;

    return Math.round(averageRisk);
  } catch (error) {
    console.error("❌ Average Risk Calculation Error:", error.message);
    return 0;
  }
}

function calculateDeliveredShipments(shipments = []) {
  try {
    if (!Array.isArray(shipments)) {
      throw new Error("A valid shipments array is required");
    }

    let deliveredCount = 0;

    for (const shipment of shipments) {
      if (!shipment || typeof shipment !== "object") continue;

      const status =
        typeof shipment.status === "string" ? shipment.status.trim() : "";

      if (status === "Delivered") {
        deliveredCount++;
      }
    }

    return deliveredCount;
  } catch (error) {
    console.error("❌ Delivered Shipment Count Error:", error.message);
    return 0;
  }
}

async function syncAnalyticsToFirebase(analyticsData = {}) {
  try {
    // const { realtimeDB } = initializeFirebaseAdmin();

    if (
      !analyticsData ||
      typeof analyticsData !== "object" ||
      Array.isArray(analyticsData)
    ) {
      throw new Error("A valid analyticsData object is required");
    }

    if (Object.keys(analyticsData).length === 0) {
      throw new Error("analyticsData object cannot be empty");
    }

    const finalPayload = {
      ...analyticsData,
      syncedAt: new Date().toISOString(),
    };

    await db.ref("analytics").set(finalPayload);

    console.log("✅ Analytics synced successfully to Firebase");

    return {
      success: true,
      message: "Analytics synced successfully",
    };
  } catch (error) {
    console.error("❌ Analytics Sync Error:", error.message);

    return {
      success: false,
      message: error.message,
    };
  }
}


const { fetchAllShipmentsFromFirebase } = require("../shipment/shipment_service");

const runAnalyticsRefreshCycle = async () => {
  try {
    const shipments = await fetchAllShipmentsFromFirebase();

    if (!shipments || shipments.length === 0) return;

    const totalShipments = shipments.length;
    const deliveredShipments = shipments.filter(s => s.status === "Delivered").length;
    const criticalShipments = shipments.filter(s => s.riskLabel === "Critical").length;
    const warningShipments = shipments.filter(s => s.riskLabel === "Warning").length;

    const averageRisk =
      shipments.reduce((sum, s) => sum + (s.riskScore || 0), 0) / totalShipments;

    const analyticsData = {
      totalShipments,
      deliveredShipments,
      activeShipments: totalShipments - deliveredShipments,
      criticalShipments,
      warningShipments,
      averageRisk: Number(averageRisk.toFixed(2)),
      lastUpdated: Date.now()
    };

    await db.ref("analytics").set(analyticsData);

    console.log("Analytics updated.");

  } catch (error) {
    console.log("Analytics Refresh Error:", error.message);
  }
};



module.exports = {calculateTotalActiveShipments, calculateCriticalShipments, calculateAverageRisk, calculateDeliveredShipments, syncAnalyticsToFirebase, runAnalyticsRefreshCycle};