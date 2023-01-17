import Graphic from "@arcgis/core/Graphic";
import { useEffect, useRef } from "react";
import "./App.css";
import { featureLayer, view } from "./arcgis";
import FeatureTable from "./FeatureTable";

function App() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    view.container = mapRef.current!;
  }, []);

  const handleProcessRowUpdate = async (row: any) => {
    await featureLayer.applyEdits({
      updateFeatures: [
        new Graphic({
          attributes: row,
        }),
      ],
    });
  };

  const handleRowProcessError = (error: any) => {
    console.error(error);
  };

  return (
    <div className="App">
      <div className="map" ref={mapRef}></div>
      <div className="table">
        <FeatureTable
          view={view}
          featureLayer={featureLayer}
          experimentalFeatures={{
            newEditingApi: true,
          }}
          editMode="row"
          columns={[
            {
              field: "ObjectId",
            },
            {
              field: "Park",
            },
            {
              field: "F1904",
              editable: true,
            },
          ]}
          processRowUpdate={handleProcessRowUpdate}
          onProcessRowUpdateError={handleRowProcessError}
        />
      </div>
    </div>
  );
}

export default App;
