import { z } from 'zod';
import {
  SiteSchema,
  LocationSchema,
  RackSchema,
  DeviceSchema,
  CableSchema,
  DeviceTypeSchema,
  SignalClassSchema,
  InterfaceSchema,
  FrontPortSchema,
  RearPortSchema,
  ConsolePortSchema,
  PowerPortSchema,
  PowerOutletSchema,
  ModuleBaySchema,
  DeviceBaySchema
} from '../../../app/src/model/schema.js';

export const NceGeometryNodeSchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
  rack_position: z.number().optional(),
  rack_face: z.string().optional(),
  cable_length_m: z.number().optional(),
  cable_type: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export const NcePortNodeSchema = z.union([
  InterfaceSchema,
  FrontPortSchema,
  RearPortSchema,
  ConsolePortSchema,
  PowerPortSchema,
  PowerOutletSchema,
  ModuleBaySchema,
  DeviceBaySchema
]);

export const NcePortSchema = z.object({
  node: NcePortNodeSchema,
  capabilities: z.record(z.string(), z.unknown()).optional(),
});

export const NceDeviceSchema = z.object({
  node: DeviceSchema,
  capabilities: z.record(z.string(), z.unknown()).optional(),
  ports: z.array(NcePortSchema).optional(),
});

export const NceRackSchema = z.object({
  node: RackSchema,
});

export const NceEdgeSchema = z.object({
  subject: z.string(),
  predicate: z.string(),
  object: z.string(),
});

export const NceDesignSchema = z.object({
  designLabel: z.string().optional(),
  revision: z.string().optional(),
  deviceTypes: z.array(DeviceTypeSchema).optional(),
  signalClasses: z.array(SignalClassSchema).optional(),
});

export const NceTopologyResponseSchema = z.object({
  design: NceDesignSchema.optional(),
  functional_locations: z.array(z.union([SiteSchema, LocationSchema])).optional(),
  devices: z.array(NceDeviceSchema).optional(),
  racks: z.array(NceRackSchema).optional(),
  cables: z.array(CableSchema).optional(),
  edges: z.array(NceEdgeSchema).optional(),
  geometry: z.record(z.string(), NceGeometryNodeSchema).optional(),
  version: z.number().int().optional(),
});
