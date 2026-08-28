import { z } from 'zod';

// ============================================================================
// Identifiers and Reference Designation (ADR-0004)
// ============================================================================

/**
 * Opaque identifier: string without SQL wildcard characters ('_', '%') or whitespace.
 */
export const IdentifierSchema = z
  .string()
  .regex(/^[^_%\s]+$/, "Identifier must not contain '_', '%', or whitespace"); // extension: opaque identifier without SQL wildcards (_, %) or whitespace per ADR-0004

export type Identifier = z.infer<typeof IdentifierSchema>;

/**
 * Reference designation charset per ADR-0004:
 * Charset: A–Z 0–9 . : + = - only. No _, no %, no spaces.
 */
export const DesignationSchema = z
  .string()
  .regex(/^[A-Z0-9.:+=-]+$/, 'Designation must only contain A-Z, 0-9, ., :, +, =, and -'); // extension: reference designation charset per ADR-0004

export type Designation = z.infer<typeof DesignationSchema>;

// ============================================================================
// Status and Option Enums (ADR-0006, ADR-0003)
// ============================================================================

/**
 * NetBox Rack Status choice set:
 * reserved | available | planned | active | deprecated
 */
export const RackStatusSchema = z.enum([ // netbox: rack.status
  'reserved',
  'available',
  'planned',
  'active',
  'deprecated',
]);

export const RackStatusEnum = RackStatusSchema;
export type RackStatus = z.infer<typeof RackStatusSchema>;

/**
 * NetBox Device Status choice set:
 * planned | staged | active | offline | decommissioning | inventory | failed
 */
export const DeviceStatusSchema = z.enum([ // netbox: device.status
  'planned',
  'staged',
  'active',
  'offline',
  'decommissioning',
  'inventory',
  'failed',
]);

export const DeviceStatusEnum = DeviceStatusSchema;
export type DeviceStatus = z.infer<typeof DeviceStatusSchema>;

/**
 * NetBox Device Face choice set:
 * front | rear
 */
export const DeviceFaceSchema = z.enum(['front', 'rear']); // netbox: device.face

export const DeviceFaceEnum = DeviceFaceSchema;
export type DeviceFace = z.infer<typeof DeviceFaceSchema>;

/**
 * NetBox DeviceType Airflow choice set:
 * front-to-rear | rear-to-front | left-to-right | right-to-left | side-to-rear | passive
 */
export const DeviceAirflowSchema = z.enum([ // netbox: devicetype.airflow
  'front-to-rear',
  'rear-to-front',
  'left-to-right',
  'right-to-left',
  'side-to-rear',
  'passive',
]);

export const DeviceAirflowEnum = DeviceAirflowSchema;
export type DeviceAirflow = z.infer<typeof DeviceAirflowSchema>;

// ============================================================================
// Core Containment Models (ADR-0006)
// ============================================================================

/**
 * Site: physical geographic facility or campus.
 */
export const SiteSchema = z
  .object({
    id: IdentifierSchema, // netbox: site.id
    name: z.string(), // netbox: site.name
    slug: z.string(), // netbox: site.slug
    description: z.string().optional(), // netbox: site.description
  })
  .strict();

export type Site = z.infer<typeof SiteSchema>;

/**
 * Location: recursive spatial partition (building / floor / room).
 */
export const LocationSchema = z
  .object({
    id: IdentifierSchema, // netbox: location.id
    name: z.string(), // netbox: location.name
    slug: z.string(), // netbox: location.slug
    siteId: IdentifierSchema, // netbox: location.site
    parentId: IdentifierSchema.optional(), // netbox: location.parent
    description: z.string().optional(), // netbox: location.description
  })
  .strict();

export type Location = z.infer<typeof LocationSchema>;

/**
 * Rack: equipment enclosure within a Site/Location.
 */
export const RackSchema = z
  .object({
    id: IdentifierSchema, // netbox: rack.id
    name: z.string(), // netbox: rack.name
    siteId: IdentifierSchema, // netbox: rack.site
    locationId: IdentifierSchema.optional(), // netbox: rack.location
    uHeight: z.number().int().positive(), // netbox: rack.u_height
    status: RackStatusSchema, // netbox: rack.status
    width: z.number().optional(), // netbox: rack.width
    description: z.string().optional(), // netbox: rack.description
  })
  .strict();

export type Rack = z.infer<typeof RackSchema>;

/**
 * DeviceType metadata (component templates are added in B4b).
 */
export const DeviceTypeSchema = z
  .object({
    id: IdentifierSchema, // netbox: devicetype.id
    manufacturer: z.string(), // netbox: devicetype.manufacturer
    model: z.string(), // netbox: devicetype.model
    slug: z.string(), // netbox: devicetype.slug
    uHeight: z.number(), // netbox: devicetype.u_height
    isFullDepth: z.boolean(), // netbox: devicetype.is_full_depth
    weight: z.number().optional(), // netbox: devicetype.weight
    airflow: DeviceAirflowSchema.optional(), // netbox: devicetype.airflow
    description: z.string().optional(), // netbox: devicetype.description
  })
  .strict();

export type DeviceType = z.infer<typeof DeviceTypeSchema>;

/**
 * Device basics (owned components are added in B4b).
 */
export const DeviceSchema = z
  .object({
    id: IdentifierSchema, // netbox: device.id
    name: z.string().optional(), // netbox: device.name
    deviceTypeId: IdentifierSchema, // netbox: device.device_type
    siteId: IdentifierSchema, // netbox: device.site
    locationId: IdentifierSchema.optional(), // netbox: device.location
    rackId: IdentifierSchema.optional(), // netbox: device.rack
    position: z.number().optional(), // netbox: device.position
    face: DeviceFaceSchema.optional(), // netbox: device.face
    status: DeviceStatusSchema, // netbox: device.status
    designation: DesignationSchema.optional(), // extension: reference designation per ADR-0004
    description: z.string().optional(), // netbox: device.description
  })
  .strict();

export type Device = z.infer<typeof DeviceSchema>;
