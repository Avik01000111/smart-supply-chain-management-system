const db = require("../../config/firebase");
function generateAlternateRouteOptions(shipment) {
  try {
    if (!shipment || typeof shipment !== "object") {
      throw new Error("A valid shipment object is required");
    }

    const shipmentId = shipment.shipmentId || "UNKNOWN";
    const remainingDistance = calculateRemainingDistance(shipment);

    const routeNames = [
      "Eastern Freight Corridor",
      "National Highway Diversion",
      "Express Logistics Bypass",
      "Industrial Cargo Route",
      "Smart Transit Link",
      "Northern Distribution Arc",
    ];

    const generatedRoutes = [];

    const totalRoutes = Math.floor(Math.random() * 2) + 2; // generate 2 or 3 routes

    for (let i = 1; i <= totalRoutes; i++) {
      const etaModifier = Math.random() * 0.25 + 0.75; // 75% to 100% of normal
      const estimatedETAHours = Number(
        ((remainingDistance / 55) * etaModifier).toFixed(1)
      );

      const fuelImpactPercent = Math.floor(Math.random() * 15) - 7; // -7 to +7

      const congestionScore = Math.floor(Math.random() * 45) + 10;
      const weatherSafetyScore = Math.floor(Math.random() * 30) + 65;
      const routeRiskScore = Math.floor(Math.random() * 40) + 10;

      let recommendationTag = "Alternative";

      if (i === 1) recommendationTag = "Best Recommended";
      else if (i === 2) recommendationTag = "Safer Route";

      generatedRoutes.push({
        routeId: `ALT-${shipmentId}-${i}`,
        routeName: routeNames[Math.floor(Math.random() * routeNames.length)],
        estimatedETAHours,
        fuelImpactPercent,
        congestionScore,
        weatherSafetyScore,
        routeRiskScore,
        recommendationTag,
      });
    }

    return generatedRoutes;
  } catch (error) {
    console.error("❌ Alternate Route Generation Error:", error.message);
    return [];
  }
}

function selectBestRerouteOption(routes = []) {
  try {
    if (!Array.isArray(routes) || routes.length === 0) {
      throw new Error("A valid routes array is required");
    }

    let bestRoute = null;
    let highestScore = -Infinity;

    for (const route of routes) {
      const estimatedETAHours =
        typeof route.estimatedETAHours === "number" ? route.estimatedETAHours : 24;

      const congestionScore =
        typeof route.congestionScore === "number" ? route.congestionScore : 50;

      const weatherSafetyScore =
        typeof route.weatherSafetyScore === "number" ? route.weatherSafetyScore : 50;

      const routeRiskScore =
        typeof route.routeRiskScore === "number" ? route.routeRiskScore : 50;

      const fuelImpactPercent =
        typeof route.fuelImpactPercent === "number" ? route.fuelImpactPercent : 0;

      // Optimization scoring formula
      const optimizationScore =
        (100 - estimatedETAHours * 2) +
        (100 - congestionScore) +
        weatherSafetyScore +
        (100 - routeRiskScore) +
        (100 - Math.abs(fuelImpactPercent));

      if (optimizationScore > highestScore) {
        highestScore = optimizationScore;
        bestRoute = {
          ...route,
          optimizationScore: Math.round(optimizationScore),
          aiRecommendationReason:
            "Selected as optimal reroute based on ETA, safety, congestion, and route stability",
        };
      }
    }

    return bestRoute;
  } catch (error) {
    console.error("❌ Best Reroute Selection Error:", error.message);
    return null;
  }
}

function generateRerouteRecommendation(shipment, bestRoute) {
  try {
    if (!shipment || typeof shipment !== "object") {
      throw new Error("A valid shipment object is required");
    }

    if (!bestRoute || typeof bestRoute !== "object") {
      throw new Error("A valid bestRoute object is required");
    }

    const shipmentId = shipment.shipmentId || "UNKNOWN";
    const routeName = bestRoute.routeName || "alternate corridor";

    const eta = bestRoute.estimatedETAHours || 0;
    const congestion = bestRoute.congestionScore || 0;
    const weatherSafety = bestRoute.weatherSafetyScore || 0;
    const fuelImpact = bestRoute.fuelImpactPercent || 0;

    let recommendationMessage = `AI recommends rerouting shipment ${shipmentId} via ${routeName}`;

    // Add ETA insight
    recommendationMessage += ` with an estimated stabilized transit window of ${eta} hours`;

    // Add congestion insight
    if (congestion <= 20) {
      recommendationMessage += `, significantly lowering congestion exposure`;
    } else if (congestion <= 35) {
      recommendationMessage += `, offering moderate congestion reduction`;
    }

    // Add weather safety insight
    if (weatherSafety >= 80) {
      recommendationMessage += ` and improved route weather resilience`;
    }

    // Add fuel insight
    if (fuelImpact < 0) {
      recommendationMessage += ` while reducing fuel strain by approximately ${Math.abs(
        fuelImpact
      )}%`;
    }

    recommendationMessage += ".";

    return recommendationMessage;
  } catch (error) {
    console.error("❌ Reroute Recommendation Generation Error:", error.message);
    return "AI reroute recommendation currently unavailable";
  }
}


async function saveRerouteToFirebase(shipmentId, rerouteData = {}) {
  try {
   

    // Validate shipmentId
    if (!shipmentId || typeof shipmentId !== "string") {
      throw new Error("A valid shipmentId string is required");
    }

    const cleanedShipmentId = shipmentId.trim();

    // Validate rerouteData
    if (
      !rerouteData ||
      typeof rerouteData !== "object" ||
      Array.isArray(rerouteData)
    ) {
      throw new Error("rerouteData must be a valid object");
    }

    if (Object.keys(rerouteData).length === 0) {
      throw new Error("rerouteData object cannot be empty");
    }

    const finalPayload = {
      ...rerouteData,
      shipmentId: cleanedShipmentId,
      generatedAt: new Date().toISOString(),
    };

    await db.ref(`reroutes/${cleanedShipmentId}`).set(finalPayload);

    console.log(`✅ Reroute saved successfully for ${cleanedShipmentId}`);

    return {
      success: true,
      shipmentId: cleanedShipmentId,
      message: "Reroute data saved successfully",
    };
  } catch (error) {
    console.error("❌ Error saving reroute to Firebase:", error.message);

    return {
      success: false,
      shipmentId: shipmentId || null,
      message: error.message,
    };
  }
}

module.exports = {generateAlternateRouteOptions, selectBestRerouteOption, generateRerouteRecommendation, saveRerouteToFirebase };