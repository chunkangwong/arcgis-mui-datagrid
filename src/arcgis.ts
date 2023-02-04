import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";

export const featureLayer = new FeatureLayer({
  portalItem: {
    id: "3807c58dd48c4d32810042d8edf4a2fe",
  },
  outFields: ["*"],
  title: "Chicago crime incidents",
});

export const map = new Map({
  basemap: "topo-vector",
  layers: [featureLayer],
});

export const view = new MapView({
  map: map,
  center: [-87.63, 41.86],
  zoom: 11,
});
