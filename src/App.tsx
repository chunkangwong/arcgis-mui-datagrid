import { useEffect, useRef } from "react";
import "./App.css";
import { featureLayer, view } from "./arcgis";
import FeatureTable from "./FeatureTable";

function App() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    view.container = mapRef.current!;
  }, []);

  return (
    <div className="App">
      <div className="map" ref={mapRef}></div>
      <div className="table">
        <FeatureTable featureLayer={featureLayer} />
      </div>
    </div>
  );
}

export default App;
