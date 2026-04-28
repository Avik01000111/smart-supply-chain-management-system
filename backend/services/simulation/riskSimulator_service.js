const { calculateRemainingDistance } = require("../shipment/geolocationTracker_service");
const { getRandomCongestionLevel } = require("../utils/randomizer");



// ==========================================
// Calculate Shipment Risk Score
// ==========================================
const calculateShipmentRiskScore = (shipment, anomaly) => {
  const remainingDistance = calculateRemainingDistance(shipment);

  let riskScore = 0;

  // Fuel Based Risk
  if (shipment.fuel <= 20) riskScore += 20;
  else if (shipment.fuel <= 40) riskScore += 10;

  // Speed Based Risk
  if (shipment.speed <= 30) riskScore += 20;
  else if (shipment.speed <= 45) riskScore += 10;

  // Distance Based Risk
  if (remainingDistance >= 800) riskScore += 15;
  else if (remainingDistance >= 400) riskScore += 8;

  // Congestion Random Factor
  const congestion = getRandomCongestionLevel();
  if (congestion >= 75) riskScore += 20;
  else if (congestion >= 50) riskScore += 10;

  // Anomaly Impact
  if (anomaly === "storm") riskScore += 25;
  if (anomaly === "road_block") riskScore += 20;
  if (anomaly === "warehouse_jam") riskScore += 15;
  if (anomaly === "idle_halt") riskScore += 10;

  if (riskScore > 100) riskScore = 100;

  return riskScore;
};



// ==========================================
// Generate Risk Label
// ==========================================
const generateRiskLabel = (riskScore) => {
  if (riskScore >= 75) return "Critical";
  if (riskScore >= 45) return "Warning";
  return "Safe";
};



// ==========================================
// Generate Predicted Issue
// ==========================================
const generatePredictedIssue = (riskScore, anomaly) => {
  if (anomaly === "storm") return "Severe Weather Disruption";
  if (anomaly === "road_block") return "Road Blockage Ahead";
  if (anomaly === "warehouse_jam") return "Warehouse Congestion Delay";
  if (anomaly === "idle_halt") return "Unexpected Idle Halt";

  if (riskScore >= 75) return "High Transit Delay Probability";
  if (riskScore >= 45) return "Moderate Operational Delay";

  return "Normal Transit";
};



module.exports = {
  calculateShipmentRiskScore,
  generateRiskLabel,
  generatePredictedIssue
};