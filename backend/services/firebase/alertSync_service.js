const db = require("../../config/firebase");
function generateShipmentAlert(shipment) {
  try {
    if (!shipment || typeof shipment !== "object") {
      throw new Error("A valid shipment object is required");
    }

    const riskScore =
      typeof shipment.delayRisk === "number" ? shipment.delayRisk : 0;

    if (riskScore <= 55) {
      return null;
    }

    const shipmentId = shipment.shipmentId || "UNKNOWN";
    const anomalyType = shipment.anomalyType || "Operational Slowdown";
    const predictedIssue =
      shipment.predictedIssue || "Potential shipment disruption detected";

    const alertLevel = riskScore > 70 ? "Critical" : "Warning";

    const alertTitle =
      alertLevel === "Critical"
        ? "Critical Shipment Delay Predicted"
        : "Shipment Delay Warning";

    const alertObject = {
      alertId: `ALERT-${shipmentId}-${Date.now()}`,
      shipmentId,
      alertLevel,
      alertTitle,
      alertMessage: `Shipment ${shipmentId} is facing ${predictedIssue.toLowerCase()}.`,
      anomalyType,
      riskScore,
      createdAt: new Date().toISOString(),
      isResolved: false,
    };

    return alertObject;
  } catch (error) {
    console.error("❌ Shipment Alert Generation Error:", error.message);
    return null;
  }
}



async function pushAlertToFirebase(alertData = {}) {
  try {
    // const { realtimeDB } = initializeFirebaseAdmin();

    if (!alertData || typeof alertData !== "object" || Array.isArray(alertData)) {
      throw new Error("A valid alertData object is required");
    }

    if (!alertData.alertId) {
      throw new Error("alertData must contain alertId");
    }

    const cleanedAlertId = alertData.alertId.trim();

    const finalPayload = {
      ...alertData,
      pushedAt: new Date().toISOString(),
    };

    await db.ref(`alerts/${cleanedAlertId}`).set(finalPayload);

    console.log(`✅ Alert pushed successfully: ${cleanedAlertId}`);

    return {
      success: true,
      alertId: cleanedAlertId,
      message: "Alert pushed to Firebase successfully",
    };
  } catch (error) {
    console.error("❌ Error pushing alert to Firebase:", error.message);

    return {
      success: false,
      alertId: alertData?.alertId || null,
      message: error.message,
    };
  }
}

module.exports = {generateShipmentAlert, pushAlertToFirebase};