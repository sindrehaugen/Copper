import { BaseLens } from "./BaseLens";
import type { CanvasLensProps } from "./types";

export function CanvasLens(props: CanvasLensProps) {
  return <BaseLens {...props} lensKind="canvas" />;
}
