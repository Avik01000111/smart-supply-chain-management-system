// const { fetchAllShipmentsFromFirebase } = require("../services/shipment/shipment_service");

// const { prepareShipmentSummaryForGemini, askGeminiForLogisticsInsight } = require("../services/ai/geminiCopilot_service");

// async function askCopilotController(req, res) {
//   try {
//     const { query } = req.body;
//     console.log(query)
//     if (!query || typeof query !== "string") {
//       return res.status(400).json({
//         success: false,
//         message: "A valid prompt is required",
//       });
//     }

//     console.log(`🤖 Copilot Prompt Received: ${query}`);

//     // Step 1: Fetch latest shipments
//     const shipments = await fetchAllShipmentsFromFirebase();

//     // Step 2: Compress shipment summary for Gemini
//     console.log(shipments)
//     const shipmentSummary = prepareShipmentSummaryForGemini(shipments);
//     console.log(shipmentSummary)

//     // Step 3: Ask Gemini
//     const aiResponse = await askGeminiForLogisticsInsight(query, shipmentSummary);
//     console.log(aiResponse)

//     return res.status(200).json({
//       success: true,
//       query,
//       aiResponse,
//     });
//   } catch (error) {
//     console.error("❌ Ask Copilot Controller Error:", error.message);

//     return res.status(500).json({
//       success: false,
//       message: "Internal server error while processing copilot request",
//     });
//   }
// }

// module.exports = {
//   askCopilotController,
// };
const { fetchAllShipmentsFromFirebase } = require("../services/shipment/shipment_service");

const { prepareShipmentSummaryForGemini, askGeminiForLogisticsInsight } = require("../services/ai/geminiCopilot_service");

async function askCopilotController(req, res) {
  try {
    const { query } = req.body;
    console.log(query)
    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid prompt is required",
      });
    }

    console.log(`🤖 Copilot Prompt Received: ${query}`);

    // Step 1: Fetch latest shipments
    const shipments = await fetchAllShipmentsFromFirebase();

    // Step 2: Compress shipment summary for Gemini
    console.log(shipments)
    const shipmentSummary = prepareShipmentSummaryForGemini(shipments);
    console.log(shipmentSummary)

    // Step 3: Ask Gemini
    const aiResponse = await askGeminiForLogisticsInsight(query, shipmentSummary);
    console.log(aiResponse)

    return res.status(200).json({
      success: true,
      query,
      aiResponse,
    });
  } catch (error) {
    console.error("❌ Ask Copilot Controller Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error while processing copilot request",
    });
  }
}

module.exports = {
  askCopilotController,
};