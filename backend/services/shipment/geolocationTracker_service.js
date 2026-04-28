// const { calculateDistanceBetweenTwoPoints } = require("../utils/geoMath");
// const {
//   getRandomSpeed,
//   getRandomFuelDrop
// } = require("../utils/randomizer");



// // =======================================
// // Move Shipment Slightly Toward Destination
// // =======================================
// const calculateNextLiveCoordinates = (
//   currentLat,
//   currentLng,
//   destinationLat,
//   destinationLng
// ) => {
//   const movementFactor = 0.015; // controls movement smoothness

//   const latDifference = destinationLat - currentLat;
//   const lngDifference = destinationLng - currentLng;

//   const nextLat = currentLat + latDifference * movementFactor;
//   const nextLng = currentLng + lngDifference * movementFactor;

//   return {
//     currentLat: Number(nextLat.toFixed(6)),
//     currentLng: Number(nextLng.toFixed(6))
//   };
// };



// // =======================================
// // Calculate Remaining Distance in KM
// // =======================================
// const calculateRemainingDistance = (shipment) => {
//   return Number(
//     calculateDistanceBetweenTwoPoints(
//       shipment.currentLat,
//       shipment.currentLng,
//       shipment.destinationLat,
//       shipment.destinationLng
//     ).toFixed(2)
//   );
// };



// // =======================================
// // Check if Shipment Reached Destination
// // =======================================
// const isShipmentDelivered = (shipment) => {
//   const distance = calculateRemainingDistance(shipment);

//   return distance <= 5;
// };



// // =======================================
// // Update Fuel and Speed Randomly
// // =======================================
// const updateFuelAndSpeedRandomly = (shipment) => {
//   let newFuel = shipment.fuel - getRandomFuelDrop();
//   let newSpeed = getRandomSpeed();

//   if (newFuel < 5) newFuel = 5;

//   return {
//     fuel: Number(newFuel.toFixed(2)),
//     speed: newSpeed
//   };
// };



// module.exports = {
//   calculateNextLiveCoordinates,
//   calculateRemainingDistance,
//   isShipmentDelivered,
//   updateFuelAndSpeedRandomly
// };
const { calculateDistanceBetweenTwoPoints } = require("../utils/geoMath");
const {
  getRandomSpeed,
  getRandomFuelDrop
} = require("../utils/randomizer");



// =======================================
// MOVE SHIPMENT TOWARD DESTINATION
// =======================================
const calculateNextLiveCoordinates = (
  currentLat,
  currentLng,
  destinationLat,
  destinationLng
) => {
  currentLat = Number(currentLat);
  currentLng = Number(currentLng);
  destinationLat = Number(destinationLat);
  destinationLng = Number(destinationLng);

  if (
    isNaN(currentLat) ||
    isNaN(currentLng) ||
    isNaN(destinationLat) ||
    isNaN(destinationLng)
  ) {
    return {
      lat: 22.5726,
      lng: 88.3639
    };
  }

  const movementFactor = 0.015;

  const latDifference = destinationLat - currentLat;
  const lngDifference = destinationLng - currentLng;

  const nextLat = currentLat + latDifference * movementFactor;
  const nextLng = currentLng + lngDifference * movementFactor;

  return {
    lat: Number(nextLat.toFixed(6)),
    lng: Number(nextLng.toFixed(6))
  };
};



// =======================================
// CALCULATE REMAINING DISTANCE
// =======================================
const calculateRemainingDistance = (shipment) => {
  const currentLat = Number(
    shipment?.currentLocation?.lat ??
    shipment?.currentLat ??
    shipment?.source?.lat ??
    22.5726
  );

  const currentLng = Number(
    shipment?.currentLocation?.lng ??
    shipment?.currentLng ??
    shipment?.source?.lng ??
    88.3639
  );

  const destinationLat = Number(
    shipment?.destination?.lat ?? 28.7041
  );

  const destinationLng = Number(
    shipment?.destination?.lng ?? 77.1025
  );

  return Number(
    calculateDistanceBetweenTwoPoints(
      currentLat,
      currentLng,
      destinationLat,
      destinationLng
    ).toFixed(2)
  );
};



// =======================================
// CHECK DELIVERY
// =======================================
const isShipmentDelivered = (shipment) => {
  const distance = calculateRemainingDistance(shipment);
  return distance <= 5;
};



// =======================================
// UPDATE FUEL & SPEED
// =======================================
const updateFuelAndSpeedRandomly = (shipment) => {
  const existingFuel = Number(
    shipment?.fuelLevel ??
    shipment?.fuel ??
    100
  );

  let newFuel = existingFuel - getRandomFuelDrop();
  let newSpeed = getRandomSpeed();

  if (newFuel < 5) newFuel = 5;
  if (isNaN(newFuel)) newFuel = 100;
  if (isNaN(newSpeed)) newSpeed = 45;

  return {
    fuelLevel: Number(newFuel.toFixed(2)),
    speed: Number(newSpeed.toFixed(2))
  };
};



module.exports = {
  calculateNextLiveCoordinates,
  calculateRemainingDistance,
  isShipmentDelivered,
  updateFuelAndSpeedRandomly
};