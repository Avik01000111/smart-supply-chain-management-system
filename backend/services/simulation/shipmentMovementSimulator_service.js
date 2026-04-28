const {
  fetchAllShipmentsFromFirebase,
  updateShipmentDataInFirebase
} = require("../shipment/shipment_service");

const {
  calculateNextLiveCoordinates,
  calculateRemainingDistance,
  isShipmentDelivered,
  updateFuelAndSpeedRandomly
} = require("../shipment/geolocationTracker_service");

const {
  generateRandomAnomalyForShipment
} = require("./anomalySimulator_service");

const {
  calculateShipmentRiskScore,
  generateRiskLabel,
  generatePredictedIssue
} = require("./riskSimulator_service");

const {
  generateAlternateRouteOptions,
  selectBestRerouteOption
} = require("../ai/rerouteDecision_service");

const {
  pushAlertToFirebase
} = require("../firebase/alertSync_service");



const runShipmentMovementSimulation = async () => {
  try {
    const shipments = await fetchAllShipmentsFromFirebase();

    if (!shipments || shipments.length === 0) {
      console.log("No shipments found for simulation");
      return;
    }

    for (const shipment of shipments) {
      if (shipment.status === "Delivered") continue;

      // 1. Move coordinates
      const nextCoords = calculateNextLiveCoordinates(
        shipment.currentLat,
        shipment.currentLng,
        shipment.destinationLat,
        shipment.destinationLng
      );

      // 2. Update fuel and speed
      const movementStats = updateFuelAndSpeedRandomly(shipment);

      // 3. Generate anomaly
      const anomaly = generateRandomAnomalyForShipment(shipment);

      // 4. Risk Calculation
      const riskScore = calculateShipmentRiskScore(shipment, anomaly);
      const riskLabel = generateRiskLabel(riskScore);
      const predictedIssue = generatePredictedIssue(riskScore, anomaly);

      // 5. Remaining Distance
      const remainingDistance = calculateRemainingDistance({
        ...shipment,
        currentLat: nextCoords.currentLat,
        currentLng: nextCoords.currentLng
      });

      // 6. Delivery Check
      const delivered = isShipmentDelivered({
        ...shipment,
        currentLat: nextCoords.currentLat,
        currentLng: nextCoords.currentLng
      });

      // 7. Optional Reroute
      let rerouteData = null;
      if (riskScore >= 70) {
        const routes = generateAlternateRouteOptions(shipment);
        rerouteData = selectBestRerouteOption(routes);
      }

      // 8. Update Shipment Object
      const updatedShipment = {
        currentLat: nextCoords.currentLat,
        currentLng: nextCoords.currentLng,
        speed: movementStats.speed,
        fuel: movementStats.fuel,
        remainingDistance,
        riskScore,
        riskLabel,
        predictedIssue,
        activeAnomaly: anomaly,
        suggestedReroute: rerouteData || null,
        status: delivered ? "Delivered" : "In Transit"
      };

      await updateShipmentDataInFirebase(shipment.shipmentId, updatedShipment);

      // 9. Push Alert if Critical
      if (riskScore >= 75) {
        await pushAlertToFirebase({
          shipmentId: shipment.shipmentId,
          message: `${shipment.shipmentId} is in ${riskLabel} due to ${predictedIssue}`,
          riskScore,
          timestamp: Date.now()
        });
      }
    }

    console.log("Shipment simulation cycle completed.");

  } catch (error) {
    console.log("Simulation Error:", error.message);
  }
};

module.exports = {
  runShipmentMovementSimulation
};