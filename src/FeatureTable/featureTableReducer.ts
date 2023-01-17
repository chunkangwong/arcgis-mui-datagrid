import { GridColumns, GridRowsProp } from "@mui/x-data-grid";

interface FeatureTableReducerState {
  isLoading: boolean;
  error: Error | null;
  data: {
    rows: GridRowsProp;
    columns: GridColumns;
    featureSet: __esri.FeatureSet;
  } | null;
}

type FeatureTableReducerAction =
  | { type: "loading" }
  | { type: "success"; payload: FeatureTableReducerState["data"] }
  | { type: "error"; payload: Error };

const featureTableReducer = (
  state: FeatureTableReducerState,
  action: FeatureTableReducerAction
): FeatureTableReducerState => {
  switch (action.type) {
    case "loading":
      return { isLoading: true, error: null, data: null };
    case "success":
      return { isLoading: false, error: null, data: action.payload };
    case "error":
      return { isLoading: false, error: action.payload, data: null };
    default:
      return state;
  }
};

export default featureTableReducer;
