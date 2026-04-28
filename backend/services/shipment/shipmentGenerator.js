function generateRandomShipmentObject(index) {
  const indianCities = [
    {
      city: "Kolkata",
      state: "West Bengal",
      lat: 22.5726,
      lng: 88.3639,
    },
    {
      city: "Delhi",
      state: "Delhi",
      lat: 28.7041,
      lng: 77.1025,
    },
    {
      city: "Mumbai",
      state: "Maharashtra",
      lat: 19.076,
      lng: 72.8777,
    },
    {
      city: "Chennai",
      state: "Tamil Nadu",
      lat: 13.0827,
      lng: 80.2707,
    },
    {
      city: "Bangalore",
      state: "Karnataka",
      lat: 12.9716,
      lng: 77.5946,
    },
    {
      city: "Hyderabad",
      state: "Telangana",
      lat: 17.385,
      lng: 78.4867,
    },
    {
      city: "Ahmedabad",
      state: "Gujarat",
      lat: 23.0225,
      lng: 72.5714,
    },
    {
      city: "Bhubaneswar",
      state: "Odisha",
      lat: 20.2961,
      lng: 85.8245,
    },
  ];

  const cargoTypes = [
    "Electronics",
    "Pharmaceuticals",
    "Perishable Foods",
    "Automobile Parts",
    "Industrial Machinery",
    "Retail Goods",
    "Medical Equipment",
    "Textile Materials",
  ];

  const carriers = [
    "BlueDart Logistics",
    "SafeMove Transport",
    "RapidHaul Freight",
    "PrimeChain Cargo",
    "TransAxis Mobility",
    "SwiftLine Shipping",
  ];

  const drivers = [
    "Ramesh Kumar",
    "Sanjay Das",
    "Vikram Singh",
    "Arjun Patel",
    "Mohit Sharma",
    "Rajeev Roy",
    "Anil Verma",
    "Sourav Dey",
  ];

  const truckPrefixes = ["WB", "DL", "MH", "TN", "KA", "TS", "GJ", "OD"];

  // Random helper
  const randomFromArray = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Ensure source and destination are not same
  let source = randomFromArray(indianCities);
  let destination = randomFromArray(indianCities);

  while (source.city === destination.city) {
    destination = randomFromArray(indianCities);
  }

  // Generate midpoint-ish current location between source and destination
  const progressFactor = Math.random() * 0.8 + 0.1;

  const currentLat =
    source.lat + (destination.lat - source.lat) * progressFactor;

  const currentLng =
    source.lng + (destination.lng - source.lng) * progressFactor;

  const speed = Math.floor(Math.random() * 40) + 30; // 30-70 km/h
  const fuelLevel = Math.floor(Math.random() * 50) + 40; // 40-90 %
  const trafficSeverity = Math.floor(Math.random() * 100);
  const weatherSeverity = Math.floor(Math.random() * 100);
  const priorityScore = Math.floor(Math.random() * 3) + 1;

  const shipmentPriorities = {
    1: "Low",
    2: "Medium",
    3: "High",
  };

  const shipmentStatuses = ["In Transit", "Monitoring", "Stable", "Moving"];

  // ETA random future
  const etaHours = Math.floor(Math.random() * 30) + 8;
  const expectedETA = new Date(Date.now() + etaHours * 60 * 60 * 1000);

  return {
    shipmentId: `SH${String(index).padStart(4, "0")}`,

    truckId: `${randomFromArray(truckPrefixes)}-${Math.floor(
      1000 + Math.random() * 9000
    )}`,

    carrierName: randomFromArray(carriers),
    driverName: randomFromArray(drivers),
    cargoType: randomFromArray(cargoTypes),

    source: {
      city: source.city,
      state: source.state,
      lat: source.lat,
      lng: source.lng,
    },

    destination: {
      city: destination.city,
      state: destination.state,
      lat: destination.lat,
      lng: destination.lng,
    },

    currentLocation: {
      lat: Number(currentLat.toFixed(5)),
      lng: Number(currentLng.toFixed(5)),
    },

    speed: speed,
    fuelLevel: fuelLevel,

    trafficSeverity,
    weatherSeverity,

    delayRisk: 0,
    bottleneckRisk: 0,
    predictedDelayHours: 0,

    priority: shipmentPriorities[priorityScore],
    status: randomFromArray(shipmentStatuses),

    routeDeviation: Number((Math.random() * 5).toFixed(2)),
    idleTimeMinutes: Math.floor(Math.random() * 20),

    expectedETA: expectedETA.toISOString(),
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  };
}


function generateBulkDemoShipments(count = 50) {
  try {
    if (typeof count !== "number" || isNaN(count)) {
      throw new Error("count must be a valid number");
    }

    let finalCount = Math.floor(count);

    // Restrict sensible demo size
    if (finalCount < 1) finalCount = 1;
    if (finalCount > 100) finalCount = 100;

    const generatedShipments = [];

    for (let i = 1; i <= finalCount; i++) {
      const shipment = generateRandomShipmentObject(i);
      generatedShipments.push(shipment);
    }

    console.log(`✅ Generated ${generatedShipments.length} bulk demo shipments`);

    return generatedShipments;
  } catch (error) {
    console.error("❌ Bulk Demo Shipment Generation Error:", error.message);
    return [];
  }
}

module.exports = {generateRandomShipmentObject, generateBulkDemoShipments};