import Graphic from "@arcgis/core/Graphic";
import Alert, { AlertColor } from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import { DataGrid, GridEventListener } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import { featureLayer, view } from "./arcgis";

function App() {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarContent, setSnackbarContent] = useState({
    message: "",
    severity: "error" as AlertColor,
  });
  const mapRef = useRef<HTMLDivElement>(null);
  const {
    data: rows,
    isLoading,
    error,
  } = useQuery(["rows"], async () => {
    const query = featureLayer.createQuery();
    query.outFields = ["*"];
    query.where = "1=1";
    const featureSet = await featureLayer.queryFeatures(query);
    return featureSet.features.map((feature) => ({
      id: feature.attributes[featureLayer.objectIdField],
      ...feature.attributes,
    }));
  });

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

  const handleRowClick: GridEventListener<"rowClick"> = async (params) => {
    const objectId = params.row.id;
    const layerView = await view.whenLayerView(featureLayer);
    (layerView as any)._highlightIds.clear();
    layerView.highlight(objectId);
  };

  return (
    <div className="App">
      <div className="map" ref={mapRef}></div>
      <div className="table">
        {isLoading && <CircularProgress />}
        {rows && (
          <DataGrid
            rows={rows}
            onRowClick={handleRowClick}
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
        )}
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
