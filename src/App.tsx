import Graphic from "@arcgis/core/Graphic";
import Alert, { AlertColor } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import { featureLayer, view } from "./arcgis";
import FeatureTable from "./FeatureTable";

function App() {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarContent, setSnackbarContent] = useState({
    message: "",
    severity: "error" as AlertColor,
  });
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
      setSnackbarContent({
        message: `Error updating feature: ${firstError.name}: ${firstError.message}`,
        severity: "error",
      });
      setSnackbarOpen(true);
      return oldRow;
    }
    setSnackbarContent({
      message: `Update successful`,
      severity: "success",
    });
    setSnackbarOpen(true);
    return newRow;
  };

  const handleRowProcessError = (error: any) => {
    setSnackbarContent({
      message: `Error updating feature: ${error.message}`,
      severity: "error",
    });
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert severity={snackbarContent.severity}>
          {snackbarContent.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
