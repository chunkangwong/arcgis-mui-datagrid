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

  const handleProcessRowUpdate = async (newRow: any, oldRow: any) => {
    const updatedAttribute = Object.keys(newRow).find(
      (key) => newRow[key] !== oldRow[key]
    )!;
    const results = await featureLayer.applyEdits({
      updateFeatures: [
        new Graphic({
          attributes: {
            [featureLayer.objectIdField]: newRow[featureLayer.objectIdField],
            [updatedAttribute]: newRow[updatedAttribute],
          },
        }),
      ],
    });
    if (results.updateFeatureResults.some((res) => res.error)) {
      const firstError = results.updateFeatureResults.find((res) => res.error)
        ?.error!;
      window.alert(
        `Error updating feature: ${firstError.name}: ${firstError.message}`
      );
      return oldRow;
    }
    return newRow;
  };

  const handleRowProcessError = (error: any) => {
    window.alert(`Error updating feature: ${error.message}`);
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
              field: "Case_Number",
              editable: true,
              width: 150,
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
