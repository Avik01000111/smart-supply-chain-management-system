const {
  fetchShipmentById,
  updateShipmentDataInFirebase,
} = require("../services/shipment/shipment_service");
const {
  pushAlertToFirebase,
  generateShipmentAlert
} = require('../services/firebase/alertSync_service')
const {
    saveRerouteToFirebase,
    generateAlternateRouteOptions,
  selectBestRerouteOption,
  generateRerouteRecommendation,
} = require('../services/ai/rerouteDecision_service')
const {
  calculateShipmentRiskScore,
  generateRiskLabel,
  generatePredictedIssue,
} = require("../services/simulation/riskSimulator_service");


async function triggerManualAnomalyController(req, res) {
  try {
    const { shipmentId, anomalyType } = req.body;

    if (!shipmentId || !anomalyType) {
      return res.status(400).json({
        success: false,
        message: "shipmentId and anomalyType are required",
      });
    }

    const shipment = await fetchShipmentById(shipmentId);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    // Manual anomaly registry
    const anomalyRegistry = {
      Congestion: {
        anomalyType: "Congestion",
        anomalySeverity: 62,
        anomalyMessage: "Heavy traffic congestion manually triggered",
        speedPenalty: -15,
        delayHoursAdded: 1.8,
      },
      "Road Block": {
        anomalyType: "Road Block",
        anomalySeverity: 82,
        anomalyMessage: "Temporary road blockage manually triggered",
        speedPenalty: -25,
        delayHoursAdded: 3.4,
      },
      "Weather Issue": {
        anomalyType: "Weather Issue",
        anomalySeverity: 71,
        anomalyMessage: "Severe weather disturbance manually triggered",
        speedPenalty: -18,
        delayHoursAdded: 2.2,
      },
      "Idle Halt": {
        anomalyType: "Idle Halt",
        anomalySeverity: 68,
        anomalyMessage: "Unexpected idle halt manually triggered",
        speedPenalty: -20,
        delayHoursAdded: 2.7,
      },
    };

    const anomaly = anomalyRegistry[anomalyType];

    if (!anomaly) {
      return res.status(400).json({
        success: false,
        message: "Invalid anomalyType provided",
      });
    }

    let updatedShipment = { ...shipment };

    updatedShipment.anomalyType = anomaly.anomalyType;
    updatedShipment.anomalySeverity = anomaly.anomalySeverity;
    updatedShipment.anomalyMessage = anomaly.anomalyMessage;
    updatedShipment.speed = Math.max(5, updatedShipment.speed + anomaly.speedPenalty);

    // Recalculate risk
    const riskScore = calculateShipmentRiskScore(updatedShipment, anomaly);
    updatedShipment.delayRisk = riskScore;
    updatedShipment.riskLabel = generateRiskLabel(riskScore);
    updatedShipment.predictedIssue = generatePredictedIssue(riskScore, anomaly);

    // Generate reroute if critical
    if (riskScore > 60) {
      const alternateRoutes = generateAlternateRouteOptions(updatedShipment);
      const bestReroute = selectBestRerouteOption(alternateRoutes);
      const rerouteRecommendation = generateRerouteRecommendation(
        updatedShipment,
        bestReroute
      );

      updatedShipment.bestReroute = bestReroute;
      updatedShipment.rerouteRecommendation = rerouteRecommendation;

      await saveRerouteToFirebase(updatedShipment.shipmentId, {
        alternateRoutes,
        bestReroute,
        rerouteRecommendation,
      });
    }

    // Push alert
    const alertObj = generateShipmentAlert(updatedShipment);
    if (alertObj) {
      await pushAlertToFirebase(alertObj);
    }

    updatedShipment.lastUpdatedAt = new Date().toISOString();

    await updateShipmentDataInFirebase(updatedShipment.shipmentId, updatedShipment);

    return res.status(200).json({
      success: true,
      message: `Manual anomaly ${anomalyType} triggered successfully on ${shipmentId}`,
      shipment: updatedShipment,
    });
  } catch (error) {
    console.error("❌ Trigger Manual Anomaly Controller Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error while triggering anomaly",
    });
  }
}

module.exports = {
  triggerManualAnomalyController,
};