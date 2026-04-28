// function generateRandomAnomalyForShipment(shipment) {
//   try {
//     if (!shipment || typeof shipment !== "object") {
//       throw new Error("A valid shipment object is required");
//     }

//     // Delivered shipments should not get anomalies
//     if (shipment.status === "Delivered") {
//       return {
//         anomalyType: "None",
//         anomalySeverity: 0,
//         anomalyMessage: "",
//         speedPenalty: 0,
//         delayHoursAdded: 0,
//       };
//     }

//     // 70% chance no anomaly, 30% chance anomaly
//     const anomalyTriggerChance = Math.random();

//     if (anomalyTriggerChance > 0.30) {
//       return {
//         anomalyType: "None",
//         anomalySeverity: 0,
//         anomalyMessage: "",
//         speedPenalty: 0,
//         delayHoursAdded: 0,
//       };
//     }

//     const anomalyTypes = [
//       {
//         anomalyType: "Congestion",
//         anomalyMessage: "Heavy traffic congestion detected ahead",
//         speedPenalty: -(Math.floor(Math.random() * 12) + 8), // -8 to -20
//         delayHoursAdded: Number((Math.random() * 2 + 0.5).toFixed(1)),
//         anomalySeverity: Math.floor(Math.random() * 25) + 45, //45-70
//       },
//       {
//         anomalyType: "Road Block",
//         anomalyMessage: "Temporary road blockage reported on active route",
//         speedPenalty: -(Math.floor(Math.random() * 18) + 15), // -15 to -33
//         delayHoursAdded: Number((Math.random() * 3 + 1).toFixed(1)),
//         anomalySeverity: Math.floor(Math.random() * 20) + 65, //65-85
//       },
//       {
//         anomalyType: "Weather Issue",
//         anomalyMessage: "Adverse weather conditions slowing movement",
//         speedPenalty: -(Math.floor(Math.random() * 15) + 10), // -10 to -25
//         delayHoursAdded: Number((Math.random() * 2.5 + 0.8).toFixed(1)),
//         anomalySeverity: Math.floor(Math.random() * 20) + 55, //55-75
//       },
//       {
//         anomalyType: "Idle Halt",
//         anomalyMessage: "Unexpected idle halt detected near checkpoint",
//         speedPenalty: -(Math.floor(Math.random() * 20) + 20), // -20 to -40
//         delayHoursAdded: Number((Math.random() * 4 + 1).toFixed(1)),
//         anomalySeverity: Math.floor(Math.random() * 20) + 60, //60-80
//       },
//     ];

//     const selectedAnomaly =
//       anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];

//     return selectedAnomaly;
//   } catch (error) {
//     console.error("❌ Random Anomaly Generation Error:", error.message);

//     return {
//       anomalyType: "None",
//       anomalySeverity: 0,
//       anomalyMessage: "",
//       speedPenalty: 0,
//       delayHoursAdded: 0,
//     };
//   }
// }

// function getAnomalyImpactScore(anomalyType) {
//   try {
//     if (!anomalyType || typeof anomalyType !== "string") {
//       throw new Error("A valid anomalyType string is required");
//     }

//     const cleanedType = anomalyType.trim();

//     const anomalyImpactRegistry = {
//       None: {
//         riskBoost: 0,
//         etaDelayMultiplier: 1,
//         reroutePriority: "None",
//         alertPriority: "Normal",
//       },

//       Congestion: {
//         riskBoost: 15,
//         etaDelayMultiplier: 1.2,
//         reroutePriority: "Medium",
//         alertPriority: "Warning",
//       },

//       "Road Block": {
//         riskBoost: 30,
//         etaDelayMultiplier: 1.8,
//         reroutePriority: "High",
//         alertPriority: "Critical",
//       },

//       "Weather Issue": {
//         riskBoost: 22,
//         etaDelayMultiplier: 1.5,
//         reroutePriority: "Medium",
//         alertPriority: "High",
//       },

//       "Idle Halt": {
//         riskBoost: 18,
//         etaDelayMultiplier: 1.35,
//         reroutePriority: "Medium",
//         alertPriority: "High",
//       },
//     };

//     return (
//       anomalyImpactRegistry[cleanedType] || {
//         riskBoost: 0,
//         etaDelayMultiplier: 1,
//         reroutePriority: "None",
//         alertPriority: "Normal",
//       }
//     );
//   } catch (error) {
//     console.error("❌ Anomaly Impact Score Error:", error.message);

//     return {
//       riskBoost: 0,
//       etaDelayMultiplier: 1,
//       reroutePriority: "None",
//       alertPriority: "Normal",
//     };
//   }
// }

// module.exports = {generateRandomAnomalyForShipment, getAnomalyImpactScore};
const { getRandomInt } = require("../utils/randomizer");



// ===========================================
// Randomly Generate Anomaly For Shipment
// ===========================================
const generateRandomAnomalyForShipment = (shipment) => {
  const randomChance = getRandomInt(1, 100);

  if (randomChance <= 15) return "storm";
  if (randomChance <= 28) return "road_block";
  if (randomChance <= 40) return "warehouse_jam";
  if (randomChance <= 52) return "idle_halt";

  return "none";
};



// ===========================================
// Manual Admin Trigger Anomaly
// ===========================================
const injectManualAnomaly = (shipmentId, anomalyType) => {
  return {
    shipmentId,
    anomalyType,
    injectedAt: Date.now(),
    active: true
  };
};



// ===========================================
// Get Human Readable Anomaly Impact
// ===========================================
const getAnomalyDescription = (anomalyType) => {
  switch (anomalyType) {
    case "storm":
      return "Heavy storm activity detected on route";
    case "road_block":
      return "Road blockage reported ahead";
    case "warehouse_jam":
      return "Warehouse unloading congestion";
    case "idle_halt":
      return "Unexpected shipment idle halt";
    default:
      return "No anomaly";
  }
};



module.exports = {
  generateRandomAnomalyForShipment,
  injectManualAnomaly,
  getAnomalyDescription
};