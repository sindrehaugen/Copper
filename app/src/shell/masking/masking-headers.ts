export const CUSTOMER_VIEW_HEADER = "x-customer-view";
export const DATA_CUSTOMER_VIEW_ATTR = "data-customer-view";

/**
 * Returns the HTTP headers to attach when customer-view masking is active.
 */
export function getMaskingHeaders(isMasked: boolean): Record<string, string> {
  if (!isMasked) return {};
  return {
    [CUSTOMER_VIEW_HEADER]: "true",
  };
}

/**
 * Merges masking headers into an existing HeadersInit object or Headers instance.
 */
export function withMaskingHeaders(
  headers: HeadersInit | undefined,
  isMasked: boolean
): HeadersInit {
  if (!isMasked) return headers ?? {};
  const maskingHeaders = getMaskingHeaders(true);
  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    const newHeaders = new Headers(headers);
    newHeaders.set(CUSTOMER_VIEW_HEADER, "true");
    return newHeaders;
  }
  if (Array.isArray(headers)) {
    return [...headers, [CUSTOMER_VIEW_HEADER, "true"]];
  }
  return {
    ...headers,
    ...maskingHeaders,
  };
}
