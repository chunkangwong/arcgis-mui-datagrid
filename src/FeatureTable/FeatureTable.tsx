import {
  DataGrid,
  DataGridProps,
  GridColumns,
  GridEventListener,
} from "@mui/x-data-grid";
import { useEffect, useReducer } from "react";
import reducer from "./featureTableReducer";

interface FeatureTableProps extends Omit<DataGridProps, "rows" | "columns"> {
  view: __esri.MapView;
  featureLayer: __esri.FeatureLayer;
  filterGeometry?: __esri.Geometry;
  highlightOnRowSelectEnabled?: boolean;
  onRowClick?: GridEventListener<"rowClick">;
  columns?: GridColumns;
}

const FeatureTable = ({
  view,
  featureLayer,
  filterGeometry,
  highlightOnRowSelectEnabled = true,
  onRowClick,
  columns,
  ...props
}: FeatureTableProps) => {
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

  const handleRowClick: GridEventListener<"rowClick"> = (
    params,
    event,
    detail
  ) => {
    if (onRowClick) {
      onRowClick(params, event, detail);
    }
    if (highlightOnRowSelectEnabled) {
      const objectId = params.row.id;
      view.whenLayerView(featureLayer).then((layerView) => {
        (layerView as any)._highlightIds.clear();
        layerView.highlight(objectId);
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (data) {
    return (
      <DataGrid
        columns={columns || data.columns}
        rows={data.rows}
        onRowClick={handleRowClick}
        {...props}
      />
    );
  }

  return null;
};

export default FeatureTable;
