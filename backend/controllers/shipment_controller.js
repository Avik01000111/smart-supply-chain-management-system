const { generateBulkDemoShipments } = require("../services/shipment/shipmentGenerator");

const {
  saveGeneratedShipmentsToFirebase,
  fetchAllShipmentsFromFirebase,
  fetchShipmentById,
  updateShipmentDataInFirebase
} = require("../services/shipment/shipment_service");

const {
  generateAlternateRouteOptions,
  selectBestRerouteOption,
  generateRerouteRecommendation,
  saveRerouteToFirebase
} = require("../services/ai/rerouteDecision_service");



// =============================
// Seed Demo Shipments
// =============================
const seedDemoShipmentsController = async (req, res) => {
  try {
    const count = req.body.count || 50;

    const shipments = generateBulkDemoShipments(count);

    await saveGeneratedShipmentsToFirebase(shipments);

    return res.status(201).json({
      success: true,
      message: `${shipments.length} shipments seeded successfully`,
      data: shipments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to seed demo shipments",
      error: error.message
    });
  }
};



// =============================
// Get All Shipments
// =============================
const getAllShipmentsController = async (req, res) => {
  try {
    const shipments = await fetchAllShipmentsFromFirebase();

    return res.status(200).json({
      success: true,
      total: shipments.length,
      data: shipments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shipments",
      error: error.message
    });
  }
};



// =============================
// Get Shipment By ID
// =============================
const getShipmentByIdController = async (req, res) => {
  try {
    const { shipmentId } = req.params;

    const shipment = await fetchShipmentById(shipmentId);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: shipment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shipment",
      error: error.message
    });
  }
};



// =============================
// Update Shipment Data
// =============================
const updateShipmentDataController = async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const updatedData = req.body;

    await updateShipmentDataInFirebase(shipmentId, updatedData);

    return res.status(200).json({
      success: true,
      message: "Shipment updated successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update shipment",
      error: error.message
    });
  }
};



// =============================
// Get Shipment Reroute Suggestion
// =============================
const getShipmentRerouteController = async (req, res) => {
  try {
    const { shipmentId } = req.params;

    const shipment = await fetchShipmentById(shipmentId);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found"
      });
    }

    const alternateRoutes = generateAlternateRouteOptions(shipment);
    const bestRoute = selectBestRerouteOption(alternateRoutes);
    const recommendation = generateRerouteRecommendation(shipment, bestRoute);

    return res.status(200).json({
      success: true,
      rerouteOptions: alternateRoutes,
      bestRoute,
      recommendation
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate reroute",
      error: error.message
    });
  }
};



// =============================
// Approve Reroute
// =============================
const approveRerouteController = async (req, res) => {
  try {
    const { shipmentId } = req.params;

    const shipment = await fetchShipmentById(shipmentId);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found"
      });
    }

    const alternateRoutes = generateAlternateRouteOptions(shipment);
    const bestRoute = selectBestRerouteOption(alternateRoutes);

    await saveRerouteToFirebase(shipmentId, bestRoute);

    await updateShipmentDataInFirebase(shipmentId, {
      currentRoute: bestRoute.routeName,
      eta: bestRoute.estimatedETA,
      status: "Rerouted"
    });

    return res.status(200).json({
      success: true,
      message: "Reroute approved successfully",
      data: bestRoute
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to approve reroute",
      error: error.message
    });
  }
};



module.exports = {
  seedDemoShipmentsController,
  getAllShipmentsController,
  getShipmentByIdController,
  updateShipmentDataController,
  getShipmentRerouteController,
  approveRerouteController
};