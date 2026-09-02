import { BaseLens } from "./BaseLens";
import type { GridLensProps } from "./types";

export function GridLens(props: GridLensProps) {
  return <BaseLens {...props} lensKind="grid" />;
}
