import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useReducer } from "react";
import reducer from "./featureTableReducer";

interface FeatureTableProps {
  featureLayer: __esri.FeatureLayer;
  filterGeometry?: __esri.Geometry;
}

const FeatureTable = ({ featureLayer, filterGeometry }: FeatureTableProps) => {
  const [{ isLoading, error, data }, dispatch] = useReducer(reducer, {
    isLoading: false,
    error: null,
    data: null,
  });

  useEffect(() => {
    dispatch({ type: "loading" });
    const query = featureLayer.createQuery();
    query.outFields = ["*"];
    query.where = "1=1";
    if (filterGeometry) {
      query.geometry = filterGeometry;
    }
    featureLayer
      .queryFeatures(query)
      .then((featureSet) => {
        const columns = featureSet.fields.map((field) => ({
          field: field.name,
          headerName: field.alias,
          width: 150,
        }));

        const rows = featureSet.features.map((feature) => ({
          id: feature.attributes[featureLayer.objectIdField],
          ...feature.attributes,
        }));

        dispatch({
          type: "success",
          payload: {
            featureSet,
            columns,
            rows,
          },
        });
      })
      .catch((error) => {
        dispatch({ type: "error", payload: error });
      });
  }, [featureLayer, filterGeometry]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (data) {
    return <DataGrid columns={data.columns} rows={data.rows} />;
  }

  return null;
};

export default FeatureTable;
