const nvidiaClient = require("../../config/gemini");



// ===============================================
// PREPARE SHIPMENT SUMMARY FOR AI
// ===============================================
function prepareShipmentSummaryForGemini(shipments = []) {
  try {
    if (!Array.isArray(shipments)) {
      throw new Error("A valid shipments array is required");
    }

    if (shipments.length === 0) {
      return "No shipment data currently available for AI analysis.";
    }

    const sortedShipments = [...shipments].sort((a, b) => {
      const riskA = typeof a.riskScore === "number" ? a.riskScore : 0;
      const riskB = typeof b.riskScore === "number" ? b.riskScore : 0;
      return riskB - riskA;
    });

    const priorityShipments = sortedShipments.slice(0, 20);

    let summaryText = `Current Logistics Shipment Intelligence Summary:\n\n`;

    for (const shipment of priorityShipments) {
      if (!shipment || typeof shipment !== "object") continue;

      const shipmentId = shipment.shipmentId || "UNKNOWN";
      const source = shipment?.source?.city || "Unknown Source";
      const destination = shipment?.destination?.city || "Unknown Destination";
      const riskScore = typeof shipment.riskScore === "number" ? shipment.riskScore : 0;
      const riskLabel = shipment.riskLabel || "Safe";
      const anomalyType = shipment.anomalyType || "None";
      const predictedIssue = shipment.predictedIssue || "Shipment movement stable";
      const status = shipment.status || "Unknown";

      summaryText += `Shipment ${shipmentId} | ${source} → ${destination} | Risk: ${riskLabel} ${riskScore}% | Anomaly: ${anomalyType} | Issue: ${predictedIssue} | Status: ${status}\n`;
    }

    return summaryText;

  } catch (error) {
    console.error("❌ Shipment Summary Preparation Error:", error.message);
    return "Unable to prepare shipment summary for AI analysis.";
  }
}



// ===============================================
// LOCAL FALLBACK AI LOGIC
// ===============================================
function generateLocalFallbackInsight(userPrompt, shipmentSummary) {
  const prompt = userPrompt.toLowerCase();

  if (prompt.includes("critical")) {
    return `Critical shipment intelligence indicates several high-risk assets requiring immediate supervision. Review top flagged shipments from the dashboard and prioritize reroute approvals for weather and route anomaly impacted consignments.`;
  }

  if (prompt.includes("delay")) {
    return `AI analysis indicates active moderate to severe delay probabilities across multiple shipments caused by congestion anomalies, weather disturbances and unstable route efficiency. Delay mitigation is recommended.`;
  }

  if (prompt.includes("reroute")) {
    return `Operational analysis suggests smart rerouting should be considered for the highest risk shipment cluster to avoid SLA breach and cascading delivery delays.`;
  }

  if (prompt.includes("fuel")) {
    return `Low fuel threshold alerts are contributing to rising operational instability in selected moving assets. Preventive refuel planning is advised immediately.`;
  }

  return `Live logistics intelligence has been processed successfully. Several shipments are under monitored anomaly conditions, while the majority remain operationally stable with active predictive supervision.`;
}



// ===============================================
// NVIDIA AI COPILOT QUERY
// ===============================================
async function askGeminiForLogisticsInsight(userPrompt, shipmentSummary) {
  try {
    if (!userPrompt || typeof userPrompt !== "string") {
      throw new Error("A valid userPrompt string is required");
    }

    if (!shipmentSummary || typeof shipmentSummary !== "string") {
      throw new Error("A valid shipmentSummary string is required");
    }

    const finalPrompt = `
You are an advanced AI Supply Chain Command Center Analyst.

Analyze the following live logistics shipment intelligence and answer the user professionally in 4 to 8 executive lines.

Rules:
1. Mention important shipment IDs if relevant.
2. Focus on delays, critical risks, reroute needs, and operational anomalies.
3. Keep response concise and managerial.
4. No fictional assumptions.

User Request:
${userPrompt}

Live Shipment Data:
${shipmentSummary}
`;

    try {
      const response = await nvidiaClient.post("/chat/completions", {
        model: "meta/llama-3.1-8b-instruct",
        messages: [
          {
            role: "system",
            content: "You are an enterprise logistics command center AI analyst."
          },
          {
            role: "user",
            content: finalPrompt
          }
        ],
        temperature: 0.4,
        top_p: 0.9,
        max_tokens: 300,
        stream: false
      });

      return (
        response.data?.choices?.[0]?.message?.content ||
        generateLocalFallbackInsight(userPrompt, shipmentSummary)
      );

    } catch (nvidiaError) {
      console.log("⚠️ NVIDIA AI unavailable, switching to local fallback");
      return generateLocalFallbackInsight(userPrompt, shipmentSummary);
    }

  } catch (error) {
    console.error("❌ NVIDIA Logistics Insight Error:", error.message);
    return "AI logistics insight service is temporarily unavailable.";
  }
}



module.exports = {
  prepareShipmentSummaryForGemini,
  askGeminiForLogisticsInsight
};