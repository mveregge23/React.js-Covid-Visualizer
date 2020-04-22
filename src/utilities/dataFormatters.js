import * as reducers from "./reducers";
import centroidJson from "../content/centroids.json";

function getFormattedSummary(json) {
  const centroids = centroidJson.reduce(reducers.centroidReducer, {});
  let formattedData = json["Countries"].reduce(reducers.dataReducer, {});
  for (var countryCode in formattedData) {
    if (typeof centroids[countryCode] !== "undefined") {
      formattedData[countryCode]["centroid"] = centroids[countryCode];
    } else {
      delete formattedData[countryCode];
    }
  }
  return formattedData;
}

function getWorldHeatmap(data) {
  let heatmapData = { positions: [] };
  for (let countryCode in data) {
    heatmapData["positions"].push({
      code: countryCode,
      lat: data[countryCode]["centroid"]["lat"],
      lng: data[countryCode]["centroid"]["lng"],
      weight: data[countryCode]["totalConfirmed"],
    });
  }
  return heatmapData;
}

function getCountryHeatmap(json) {
  let heatmapData = {
    positions: [],
  };
  json.forEach((dataPoint) => {
    if (dataPoint["Cases"] > 0) {
      heatmapData["positions"].push({
        lat: dataPoint["Lat"],
        lng: dataPoint["Lon"],
        weight: dataPoint["Cases"],
      });
    }
  });
  return heatmapData;
}

export { getFormattedSummary, getWorldHeatmap, getCountryHeatmap };
