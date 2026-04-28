const db=require('../../config/firebase')

async function saveGeneratedShipmentsToFirebase(shipments = []) {
  try {

    if (!Array.isArray(shipments) || shipments.length === 0) {
      throw new Error("Invalid shipments array provided for Firebase seeding");
    }

    const shipmentPayload = {};

    for (const shipment of shipments) {
      if (!shipment.shipmentId) {
        console.warn("⚠️ Skipping shipment without shipmentId");
        continue;
      }

      shipmentPayload[shipment.shipmentId] = shipment;
    }

    if (Object.keys(shipmentPayload).length === 0) {
      throw new Error("No valid shipment objects found to upload");
    }

    // Bulk write all shipments in one Firebase update call
    await db.ref("shipments").update(shipmentPayload);

    console.log(
      `✅ Successfully saved ${Object.keys(shipmentPayload).length} shipments to Firebase`
    );

    return {
      success: true,
      totalSaved: Object.keys(shipmentPayload).length,
      message: "Shipments uploaded successfully",
    };
  } catch (error) {
    console.error("❌ Error saving shipments to Firebase:", error.message);

    return {
      success: false,
      totalSaved: 0,
      message: error.message,
    };
  }
}


async function fetchAllShipmentsFromFirebase() {
  try {
    // const { realtimeDB } = initializeFirebaseAdmin();

    const snapshot = await db.ref("shipments").once("value");

    if (!snapshot.exists()) {
      console.warn("⚠️ No shipments found in Firebase");
      return [];
    }

    const shipmentsObject = snapshot.val();

    if (!shipmentsObject || typeof shipmentsObject !== "object") {
      console.warn("⚠️ Invalid shipment data format in Firebase");
      return [];
    }

    const shipmentsArray = Object.values(shipmentsObject);

    console.log(`✅ Fetched ${shipmentsArray.length} shipments from Firebase`);

    return shipmentsArray;
  } catch (error) {
    console.error("❌ Error fetching shipments from Firebase:", error.message);
    return [];
  }
}


async function fetchShipmentById(shipmentId) {
  try {
    // const { realtimeDB } = initializeFirebaseAdmin();

    if (!shipmentId || typeof shipmentId !== "string") {
      throw new Error("A valid shipmentId string is required");
    }

    const cleanedShipmentId = shipmentId.trim();

    const snapshot = await db
      .ref(`shipments/${cleanedShipmentId}`)
      .once("value");

    if (!snapshot.exists()) {
      console.warn(`⚠️ Shipment not found: ${cleanedShipmentId}`);
      return null;
    }

    const shipmentData = snapshot.val();

    if (!shipmentData || typeof shipmentData !== "object") {
      console.warn(`⚠️ Invalid shipment data found for: ${cleanedShipmentId}`);
      return null;
    }

    console.log(`✅ Shipment fetched successfully: ${cleanedShipmentId}`);

    return shipmentData;
  } catch (error) {
    console.error("❌ Error fetching shipment by ID:", error.message);
    return null;
  }
}


async function updateShipmentDataInFirebase(shipmentId, updatedData = {}) {
  try {
    // const { realtimeDB } = initializeFirebaseAdmin();

    // Validate shipmentId
    if (!shipmentId || typeof shipmentId !== "string") {
      throw new Error("A valid shipmentId string is required");
    }

    const cleanedShipmentId = shipmentId.trim();

    // Validate updatedData
    if (
      !updatedData ||
      typeof updatedData !== "object" ||
      Array.isArray(updatedData)
    ) {
      throw new Error("updatedData must be a valid object");
    }

    if (Object.keys(updatedData).length === 0) {
      throw new Error("updatedData object cannot be empty");
    }

    // Add auto last updated timestamp
    updatedData.lastUpdatedAt = new Date().toISOString();

    // Check shipment exists before update
    const snapshot = await db
      .ref(`shipments/${cleanedShipmentId}`)
      .once("value");

    if (!snapshot.exists()) {
      throw new Error(`Shipment not found with ID: ${cleanedShipmentId}`);
    }

    // Partial update only
    await db.ref(`shipments/${cleanedShipmentId}`).update(updatedData);

    console.log(`✅ Shipment updated successfully: ${cleanedShipmentId}`);

    return {
      success: true,
      shipmentId: cleanedShipmentId,
      message: "Shipment updated successfully",
    };
  } catch (error) {
    console.error("❌ Error updating shipment in Firebase:", error.message);

    return {
      success: false,
      shipmentId: shipmentId || null,
      message: error.message,
    };
  }
}


module.exports = {
  saveGeneratedShipmentsToFirebase,
  fetchAllShipmentsFromFirebase,
  fetchShipmentById,
  updateShipmentDataInFirebase
};

