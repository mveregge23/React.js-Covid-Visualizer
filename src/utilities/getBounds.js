function getBounds(maps, heatmapData) {
  let bounds = new maps.LatLngBounds();
  for (let i = 0; i < heatmapData["positions"].length; i++) {
    bounds.extend(
      new maps.LatLng(
        heatmapData["positions"][i]["lat"],
        heatmapData["positions"][i]["lng"]
      )
    );
  }
  return bounds;
}

export default getBounds;
