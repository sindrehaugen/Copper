import { useParams } from "react-router-dom";
import { getEntityMetadata } from "@copper/spine";
import { BaseLens } from "./BaseLens";
import type { EntityLensProps } from "./types";
import { FacetContainer } from "../facet";

export function EntityLens(props: EntityLensProps) {
  const routeParams = useParams<{ type?: string; id?: string }>();
  const entityType = props.entityType ?? routeParams.type ?? "UNKNOWN";
  const entityId = props.entityId ?? routeParams.id ?? "";
  const metadata = getEntityMetadata(entityType);

  const displayTitle =
    props.title ?? (entityId ? `${metadata.label} ${entityId}` : metadata.label);

  return (
    <BaseLens
      {...props}
      title={displayTitle}
      lensKind="entity"
      data-entity-type={entityType}
      data-entity-id={entityId}
    >
      {props.children}
      <FacetContainer entityType={entityType} entityId={entityId} />
    </BaseLens>
  );
}
