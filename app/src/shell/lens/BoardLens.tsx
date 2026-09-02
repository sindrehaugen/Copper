import { BaseLens } from "./BaseLens";
import type { BoardLensProps } from "./types";

export function BoardLens(props: BoardLensProps) {
  return <BaseLens {...props} lensKind="board" />;
}
