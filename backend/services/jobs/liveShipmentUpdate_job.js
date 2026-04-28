const {
  fetchAllShipmentsFromFirebase,
  updateShipmentDataInFirebase,
} = require("../shipment/shipment_service");

const {
  saveRerouteToFirebase,
  generateAlternateRouteOptions,
  selectBestRerouteOption,
  generateRerouteRecommendation,
} = require("../ai/rerouteDecision_service");

const {
  pushAlertToFirebase,
  generateShipmentAlert,
} = require("../firebase/alertSync_service");

const {
  syncAnalyticsToFirebase,
  calculateTotalActiveShipments,
  calculateCriticalShipments,
  calculateDeliveredShipments,
  calculateAverageRisk,
} = require("../analytics/dashboardAnalytics_service");

const {
  calculateNextLiveCoordinates,
  isShipmentDelivered,
  updateFuelAndSpeedRandomly,
} = require("../shipment/geolocationTracker_service");

const {
  generateRandomAnomalyForShipment,
} = require("../simulation/anomalySimulator_service");

const {
  calculateShipmentRiskScore,
  generateRiskLabel,
  generatePredictedIssue,
} = require("../simulation/riskSimulator_service");

const cron = require("node-cron");



// ======================================================
// MAIN LIVE SHIPMENT MOVEMENT ENGINE
// ======================================================
async function runLiveShipmentMovementCycle() {
  try {
    console.log("🚚 Starting Live Shipment Movement Cycle...");

    const shipments = await fetchAllShipmentsFromFirebase();

    if (!shipments || shipments.length === 0) {
      console.log("⚠️ No shipments found for live cycle");
      return;
    }

    const updatedShipments = [];

    for (const shipment of shipments) {
      try {
        let updatedShipment = { ...shipment };

        // --------------------------------------------------
        // STEP 1: SAFE COORDINATE INITIALIZATION
        // --------------------------------------------------
        const currentLat = Number(
          updatedShipment?.currentLocation?.lat ??
          updatedShipment?.currentLat ??
          updatedShipment?.source?.lat ??
          22.5726
        );

        const currentLng = Number(
          updatedShipment?.currentLocation?.lng ??
          updatedShipment?.currentLng ??
          updatedShipment?.source?.lng ??
          88.3639
        );

        const destinationLat = Number(
          updatedShipment?.destination?.lat ?? 28.7041
        );

        const destinationLng = Number(
          updatedShipment?.destination?.lng ?? 77.1025
        );

        if (
          isNaN(currentLat) ||
          isNaN(currentLng) ||
          isNaN(destinationLat) ||
          isNaN(destinationLng)
        ) {
          console.log(`⚠️ Invalid coordinates for ${updatedShipment.shipmentId}, skipping`);
          continue;
        }

        updatedShipment.currentLocation = { lat: currentLat, lng: currentLng };

        // --------------------------------------------------
        // STEP 2: DELIVERY CHECK
        // --------------------------------------------------
        if (isShipmentDelivered(updatedShipment)) {
          updatedShipment.status = "Delivered";
          updatedShipment.speed = 0;
          updatedShipment.delayRisk = 0;
          updatedShipment.riskScore = 0;
          updatedShipment.riskLabel = "Safe";
          updatedShipment.predictedIssue = "Shipment successfully delivered";
          updatedShipment.anomalyType = "None";
          updatedShipment.anomalySeverity = "Low";
          updatedShipment.anomalyMessage = "No anomaly detected";
          updatedShipment.lastUpdatedAt = new Date().toISOString();

          await updateShipmentDataInFirebase(updatedShipment.shipmentId, updatedShipment);
          updatedShipments.push(updatedShipment);
          continue;
        }

        // --------------------------------------------------
        // STEP 3: LIVE MOVEMENT
        // --------------------------------------------------
        const nextCoords = calculateNextLiveCoordinates(
          currentLat,
          currentLng,
          destinationLat,
          destinationLng
        );

        updatedShipment.currentLocation = nextCoords;
        updatedShipment.currentLat = Number(nextCoords.lat);
        updatedShipment.currentLng = Number(nextCoords.lng);

        // --------------------------------------------------
        // STEP 4: SPEED + FUEL
        // --------------------------------------------------
        const movementStats = updateFuelAndSpeedRandomly(updatedShipment) || {};

        updatedShipment.speed = Number(
          movementStats.speed ??
          updatedShipment.speed ??
          45
        );

        updatedShipment.fuelLevel = Number(
          movementStats.fuelLevel ??
          movementStats.fuel ??
          updatedShipment.fuelLevel ??
          updatedShipment.fuel ??
          100
        );

        if (isNaN(updatedShipment.speed)) updatedShipment.speed = 45;
        if (isNaN(updatedShipment.fuelLevel)) updatedShipment.fuelLevel = 100;

        // --------------------------------------------------
        // STEP 5: ANOMALY
        // --------------------------------------------------
        const anomaly = generateRandomAnomalyForShipment(updatedShipment) || {};

        updatedShipment.anomalyType = anomaly.anomalyType || "None";
        updatedShipment.anomalySeverity = anomaly.anomalySeverity || "Low";
        updatedShipment.anomalyMessage = anomaly.anomalyMessage || "No anomaly detected";

        updatedShipment.speed = Math.max(
          5,
          updatedShipment.speed + (anomaly.speedPenalty || 0)
        );

        // --------------------------------------------------
        // STEP 6: RISK
        // --------------------------------------------------
        const riskScore = Number(calculateShipmentRiskScore(updatedShipment, anomaly) || 0);

        updatedShipment.delayRisk = riskScore;
        updatedShipment.riskScore = riskScore;
        updatedShipment.riskLabel = generateRiskLabel(riskScore) || "Safe";
        updatedShipment.predictedIssue =
          generatePredictedIssue(riskScore, anomaly) || "Shipment movement stable";

        // --------------------------------------------------
        // STEP 7: REROUTE
        // --------------------------------------------------
        if (riskScore > 60) {
          try {
            const alternateRoutes = generateAlternateRouteOptions(updatedShipment) || [];
            const bestReroute = selectBestRerouteOption(alternateRoutes) || null;
            const rerouteRecommendation =
              generateRerouteRecommendation(updatedShipment, bestReroute) ||
              "No reroute recommendation generated";

            updatedShipment.bestReroute = bestReroute;
            updatedShipment.rerouteRecommendation = rerouteRecommendation;

            await saveRerouteToFirebase(updatedShipment.shipmentId, {
              alternateRoutes,
              bestReroute,
              rerouteRecommendation,
            });
          } catch (rerouteError) {
            console.log(`⚠️ Reroute skipped for ${updatedShipment.shipmentId}`);
          }
        }

        // --------------------------------------------------
        // STEP 8: ALERT
        // --------------------------------------------------
        const alertObj = generateShipmentAlert(updatedShipment);

        if (alertObj) {
          await pushAlertToFirebase(alertObj);
        }

        // --------------------------------------------------
        // STEP 9: FINAL FIREBASE SANITIZER
        // --------------------------------------------------
        updatedShipment.anomalyType = updatedShipment.anomalyType || "None";
        updatedShipment.anomalySeverity = updatedShipment.anomalySeverity || "Low";
        updatedShipment.anomalyMessage = updatedShipment.anomalyMessage || "No anomaly detected";

        updatedShipment.speed = Number(updatedShipment.speed || 45);
        updatedShipment.fuelLevel = Number(updatedShipment.fuelLevel || 100);
        updatedShipment.delayRisk = Number(updatedShipment.delayRisk || 0);
        updatedShipment.riskScore = Number(updatedShipment.riskScore || 0);

        updatedShipment.riskLabel = updatedShipment.riskLabel || "Safe";
        updatedShipment.predictedIssue = updatedShipment.predictedIssue || "Shipment movement stable";
        updatedShipment.status = updatedShipment.status || "In Transit";

        updatedShipment.currentLat = Number(updatedShipment.currentLat || 22.5726);
        updatedShipment.currentLng = Number(updatedShipment.currentLng || 88.3639);

        updatedShipment.currentLocation = {
          lat: updatedShipment.currentLat,
          lng: updatedShipment.currentLng
        };

        updatedShipment.lastUpdatedAt = new Date().toISOString();

        await updateShipmentDataInFirebase(updatedShipment.shipmentId, updatedShipment);

        updatedShipments.push(updatedShipment);

      } catch (singleShipmentError) {
        console.error(`❌ Error processing shipment ${shipment.shipmentId}:`, singleShipmentError.message);
      }
    }

    // --------------------------------------------------
    // STEP 10: ANALYTICS
    // --------------------------------------------------
    const totalActiveShipments = calculateTotalActiveShipments(updatedShipments);
    const criticalShipments = calculateCriticalShipments(updatedShipments);
    const deliveredShipments = calculateDeliveredShipments(updatedShipments);
    const averageRisk = calculateAverageRisk(updatedShipments);

    await syncAnalyticsToFirebase({
      totalActiveShipments,
      criticalShipments,
      deliveredShipments,
      averageRisk,
    });

    console.log("✅ Live Shipment Movement Cycle Completed");

  } catch (error) {
    console.error("❌ Live Shipment Cycle Error:", error.message);
  }
}



// ======================================================
// CRON JOB
// ======================================================
const startLiveShipmentUpdateJob = () => {
  cron.schedule("*/5 * * * * *", async () => {
    console.log("Running live shipment movement cycle...");
    await runLiveShipmentMovementCycle();
  });
};



module.exports = {
  runLiveShipmentMovementCycle,
  startLiveShipmentUpdateJob
};