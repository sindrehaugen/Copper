import { BaseLens } from "./BaseLens";
import type { EntityLensProps } from "./types";

export function EntityLens(props: EntityLensProps) {
  return <BaseLens {...props} lensKind="entity" />;
}
