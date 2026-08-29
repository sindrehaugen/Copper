import { createHmac, createHash } from 'node:crypto';

export function computeHmacSignature(
  method: string,
  path: string,
  timestamp: string,
  body: string | undefined,
  secret: string
): string {
  const parts = [method.toUpperCase(), path, timestamp];
  if (body !== undefined && body !== '') {
    parts.push(createHash('sha256').update(body, 'utf8').digest('hex'));
  }
  const canonicalString = parts.join('\n');
  return createHmac('sha256', secret).update(canonicalString, 'utf8').digest('hex');
}
