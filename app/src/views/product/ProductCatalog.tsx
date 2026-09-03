import React from "react";
import { CatalogBrowserLens, type CatalogBrowserLensProps } from "../../shell/lens/product/CatalogBrowserLens";

export const ProductCatalog: React.FC<CatalogBrowserLensProps> = (props) => {
  return <CatalogBrowserLens {...props} />;
};

export default ProductCatalog;
