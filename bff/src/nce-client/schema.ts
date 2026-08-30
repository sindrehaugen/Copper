import { z } from 'zod';

export const NceGeometryNodeSchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
  rack_position: z.number().optional(),
  rack_face: z.string().optional(),
  cable_length_m: z.number().optional(),
  cable_type: z.string().optional(),
  meta: z.any().optional(),
});

export const NceTopologyResponseSchema = z.object({
  design: z.any().optional(),
  functional_locations: z.any().optional(),
  devices: z.record(z.string(), z.any()).optional(),
  racks: z.record(z.string(), z.any()).optional(),
  cables: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  geometry: z.record(z.string(), NceGeometryNodeSchema).optional(),
  version: z.number().int(),
});

