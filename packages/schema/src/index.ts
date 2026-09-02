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

export const RackStatusEnum = RackStatusSchema; // netbox: rack.status_enum
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

export const DeviceStatusEnum = DeviceStatusSchema; // netbox: device.status_enum
export type DeviceStatus = z.infer<typeof DeviceStatusSchema>;

/**
 * NetBox Device Face choice set:
 * front | rear
 */
export const DeviceFaceSchema = z.enum(['front', 'rear']); // netbox: device.face

export const DeviceFaceEnum = DeviceFaceSchema; // netbox: device.face_enum
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

export const DeviceAirflowEnum = DeviceAirflowSchema; // netbox: devicetype.airflow_enum
export type DeviceAirflow = z.infer<typeof DeviceAirflowSchema>;

/**
 * NetBox Cable Status choice set:
 * planned | connected | decommissioning
 */
export const CableStatusSchema = z.enum([ // netbox: cable.status
  'planned',
  'connected',
  'decommissioning',
]);

export const CableStatusEnum = CableStatusSchema; // netbox: cable.status_enum
export type CableStatus = z.infer<typeof CableStatusSchema>;

/**
 * NetBox Component Class choice set for cable terminations.
 */
export const ComponentClassSchema = z.enum([ // netbox: component.class
  'interface',
  'frontPort',
  'rearPort',
  'consolePort',
  'powerPort',
  'powerOutlet',
]);

export const ComponentClassEnum = ComponentClassSchema; // netbox: component.class_enum
export type ComponentClass = z.infer<typeof ComponentClassSchema>;

// ============================================================================
// Signal Extension Layer (ADR-0006 §6)
// ============================================================================

/**
 * SignalClass: AV/data signal semantics in the extension layer.
 */
export const SignalClassSchema = z
  .object({
    id: IdentifierSchema, // extension: signalclass.id
    name: z.string(), // extension: signalclass.name
    category: z.string(), // extension: signalclass.category
    description: z.string().optional(), // extension: signalclass.description
  })
  .strict();

export type SignalClass = z.infer<typeof SignalClassSchema>;

// ============================================================================
// DeviceType Component Templates (ADR-0006 §1)
// ============================================================================

/**
 * InterfaceTemplate on DeviceType.
 */
export const InterfaceTemplateSchema = z
  .object({
    name: z.string(), // netbox: interfacetemplate.name
    label: z.string().optional(), // netbox: interfacetemplate.label
    type: z.string(), // netbox: interfacetemplate.type
    mgmtOnly: z.boolean().optional(), // netbox: interfacetemplate.mgmt_only
    description: z.string().optional(), // netbox: interfacetemplate.description
    signalClassId: IdentifierSchema.optional(), // extension: signal class assignment
    connectorType: z.string().optional(), // extension: physical connector type
  })
  .strict();

export type InterfaceTemplate = z.infer<typeof InterfaceTemplateSchema>;

/**
 * FrontPortTemplate on DeviceType. Maps to a RearPortTemplate.
 */
export const FrontPortTemplateSchema = z
  .object({
    name: z.string(), // netbox: frontporttemplate.name
    label: z.string().optional(), // netbox: frontporttemplate.label
    type: z.string(), // netbox: frontporttemplate.type
    rearPortId: IdentifierSchema, // netbox: frontporttemplate.rear_port
    rearPortPosition: z.number().int().positive().default(1), // netbox: frontporttemplate.rear_port_position
    description: z.string().optional(), // netbox: frontporttemplate.description
    signalClassId: IdentifierSchema.optional(), // extension: signal class assignment
    connectorType: z.string().optional(), // extension: physical connector type
  })
  .strict();

export type FrontPortTemplate = z.infer<typeof FrontPortTemplateSchema>;

/**
 * RearPortTemplate on DeviceType. Declares positions for front port mapping.
 */
export const RearPortTemplateSchema = z
  .object({
    name: z.string(), // netbox: rearporttemplate.name
    label: z.string().optional(), // netbox: rearporttemplate.label
    type: z.string(), // netbox: rearporttemplate.type
    positions: z.number().int().positive().default(1), // netbox: rearporttemplate.positions
    description: z.string().optional(), // netbox: rearporttemplate.description
    signalClassId: IdentifierSchema.optional(), // extension: signal class assignment
    connectorType: z.string().optional(), // extension: physical connector type
  })
  .strict();

export type RearPortTemplate = z.infer<typeof RearPortTemplateSchema>;

/**
 * ConsolePortTemplate on DeviceType.
 */
export const ConsolePortTemplateSchema = z
  .object({
    name: z.string(), // netbox: consoleporttemplate.name
    label: z.string().optional(), // netbox: consoleporttemplate.label
    type: z.string().optional(), // netbox: consoleporttemplate.type
    description: z.string().optional(), // netbox: consoleporttemplate.description
    signalClassId: IdentifierSchema.optional(), // extension: signal class assignment
    connectorType: z.string().optional(), // extension: physical connector type
  })
  .strict();

export type ConsolePortTemplate = z.infer<typeof ConsolePortTemplateSchema>;

/**
 * PowerPortTemplate on DeviceType.
 */
export const PowerPortTemplateSchema = z
  .object({
    name: z.string(), // netbox: powerporttemplate.name
    label: z.string().optional(), // netbox: powerporttemplate.label
    type: z.string().optional(), // netbox: powerporttemplate.type
    maximumDrawWatts: z.number().positive().optional(), // netbox: powerporttemplate.maximum_draw
    allocatedDrawWatts: z.number().positive().optional(), // netbox: powerporttemplate.allocated_draw
    description: z.string().optional(), // netbox: powerporttemplate.description
    signalClassId: IdentifierSchema.optional(), // extension: signal class assignment
    connectorType: z.string().optional(), // extension: physical connector type
  })
  .strict();

export type PowerPortTemplate = z.infer<typeof PowerPortTemplateSchema>;

/**
 * PowerOutletTemplate on DeviceType.
 */
export const PowerOutletTemplateSchema = z
  .object({
    name: z.string(), // netbox: poweroutlettemplate.name
    label: z.string().optional(), // netbox: poweroutlettemplate.label
    type: z.string().optional(), // netbox: poweroutlettemplate.type
    powerPortId: IdentifierSchema.optional(), // netbox: poweroutlettemplate.power_port
    feedLeg: z.string().optional(), // netbox: poweroutlettemplate.feed_leg
    description: z.string().optional(), // netbox: poweroutlettemplate.description
    signalClassId: IdentifierSchema.optional(), // extension: signal class assignment
    connectorType: z.string().optional(), // extension: physical connector type
  })
  .strict();

export type PowerOutletTemplate = z.infer<typeof PowerOutletTemplateSchema>;

/**
 * ModuleBayTemplate on DeviceType.
 */
export const ModuleBayTemplateSchema = z
  .object({
    name: z.string(), // netbox: modulebaytemplate.name
    label: z.string().optional(), // netbox: modulebaytemplate.label
    position: z.string().optional(), // netbox: modulebaytemplate.position
    description: z.string().optional(), // netbox: modulebaytemplate.description
  })
  .strict();

export type ModuleBayTemplate = z.infer<typeof ModuleBayTemplateSchema>;

/**
 * DeviceBayTemplate on DeviceType.
 */
export const DeviceBayTemplateSchema = z
  .object({
    name: z.string(), // netbox: devicebaytemplate.name
    label: z.string().optional(), // netbox: devicebaytemplate.label
    description: z.string().optional(), // netbox: devicebaytemplate.description
  })
  .strict();

export type DeviceBayTemplate = z.infer<typeof DeviceBayTemplateSchema>;

// ============================================================================
// Materialized Device Components (ADR-0006 §1, §2)
// ============================================================================

/**
 * Materialized Interface on Device.
 */
export const InterfaceSchema = z
  .object({
    id: IdentifierSchema, // netbox: interface.id
    name: z.string(), // netbox: interface.name
    label: z.string().optional(), // netbox: interface.label
    type: z.string(), // netbox: interface.type
    enabled: z.boolean().optional(), // netbox: interface.enabled
    mgmtOnly: z.boolean().optional(), // netbox: interface.mgmt_only
    description: z.string().optional(), // netbox: interface.description
    signalClassId: IdentifierSchema.optional(), // extension: signal class assignment
    connectorType: z.string().optional(), // extension: physical connector type
  })
  .strict();

export type Interface = z.infer<typeof InterfaceSchema>;

/**
 * Materialized FrontPort on Device.
 */
export const FrontPortSchema = z
  .object({
    id: IdentifierSchema, // netbox: frontport.id
    name: z.string(), // netbox: frontport.name
    label: z.string().optional(), // netbox: frontport.label
    type: z.string(), // netbox: frontport.type
    rearPortId: IdentifierSchema, // netbox: frontport.rear_port
    rearPortPosition: z.number().int().positive().default(1), // netbox: frontport.rear_port_position
    description: z.string().optional(), // netbox: frontport.description
    signalClassId: IdentifierSchema.optional(), // extension: signal class assignment
    connectorType: z.string().optional(), // extension: physical connector type
  })
  .strict();

export type FrontPort = z.infer<typeof FrontPortSchema>;

/**
 * Materialized RearPort on Device.
 */
export const RearPortSchema = z
  .object({
    id: IdentifierSchema, // netbox: rearport.id
    name: z.string(), // netbox: rearport.name
    label: z.string().optional(), // netbox: rearport.label
    type: z.string(), // netbox: rearport.type
    positions: z.number().int().positive().default(1), // netbox: rearport.positions
    description: z.string().optional(), // netbox: rearport.description
    signalClassId: IdentifierSchema.optional(), // extension: signal class assignment
    connectorType: z.string().optional(), // extension: physical connector type
  })
  .strict();

export type RearPort = z.infer<typeof RearPortSchema>;

/**
 * Materialized ConsolePort on Device.
 */
export const ConsolePortSchema = z
  .object({
    id: IdentifierSchema, // netbox: consoleport.id
    name: z.string(), // netbox: consoleport.name
    label: z.string().optional(), // netbox: consoleport.label
    type: z.string().optional(), // netbox: consoleport.type
    description: z.string().optional(), // netbox: consoleport.description
    signalClassId: IdentifierSchema.optional(), // extension: signal class assignment
    connectorType: z.string().optional(), // extension: physical connector type
  })
  .strict();

export type ConsolePort = z.infer<typeof ConsolePortSchema>;

/**
 * Materialized PowerPort on Device.
 */
export const PowerPortSchema = z
  .object({
    id: IdentifierSchema, // netbox: powerport.id
    name: z.string(), // netbox: powerport.name
    label: z.string().optional(), // netbox: powerport.label
    type: z.string().optional(), // netbox: powerport.type
    maximumDrawWatts: z.number().positive().optional(), // netbox: powerport.maximum_draw
    allocatedDrawWatts: z.number().positive().optional(), // netbox: powerport.allocated_draw
    description: z.string().optional(), // netbox: powerport.description
    signalClassId: IdentifierSchema.optional(), // extension: signal class assignment
    connectorType: z.string().optional(), // extension: physical connector type
  })
  .strict();

export type PowerPort = z.infer<typeof PowerPortSchema>;

/**
 * Materialized PowerOutlet on Device.
 */
export const PowerOutletSchema = z
  .object({
    id: IdentifierSchema, // netbox: poweroutlet.id
    name: z.string(), // netbox: poweroutlet.name
    label: z.string().optional(), // netbox: poweroutlet.label
    type: z.string().optional(), // netbox: poweroutlet.type
    powerPortId: IdentifierSchema.optional(), // netbox: poweroutlet.power_port
    feedLeg: z.string().optional(), // netbox: poweroutlet.feed_leg
    description: z.string().optional(), // netbox: poweroutlet.description
    signalClassId: IdentifierSchema.optional(), // extension: signal class assignment
    connectorType: z.string().optional(), // extension: physical connector type
  })
  .strict();

export type PowerOutlet = z.infer<typeof PowerOutletSchema>;

/**
 * Materialized ModuleBay on Device.
 */
export const ModuleBaySchema = z
  .object({
    id: IdentifierSchema, // netbox: modulebay.id
    name: z.string(), // netbox: modulebay.name
    label: z.string().optional(), // netbox: modulebay.label
    position: z.string().optional(), // netbox: modulebay.position
    description: z.string().optional(), // netbox: modulebay.description
  })
  .strict();

export type ModuleBay = z.infer<typeof ModuleBaySchema>;

/**
 * Materialized DeviceBay on Device.
 */
export const DeviceBaySchema = z
  .object({
    id: IdentifierSchema, // netbox: devicebay.id
    name: z.string(), // netbox: devicebay.name
    label: z.string().optional(), // netbox: devicebay.label
    description: z.string().optional(), // netbox: devicebay.description
    installedDeviceId: IdentifierSchema.optional(), // netbox: devicebay.installed_device
  })
  .strict();

export type DeviceBay = z.infer<typeof DeviceBaySchema>;

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
 * DeviceType: hardware model metadata and component templates.
 */
// ============================================================================
// Acoustics Extensions (B96)
// ============================================================================

export const DisplayExtensionSchema = z.object({
  diagonal: z.number().optional(), // extension: test fix
  resolution: z.string().optional(), // extension: test fix
  nits: z.number().optional(), // extension: test fix
  max_viewing_angle: z.number().optional(), // extension: test fix
});

export const ProjectorExtensionSchema = z.object({
  lumens: z.number().optional(), // extension: test fix
  throw_ratio_min: z.number().optional(), // extension: test fix
  throw_ratio_max: z.number().optional(), // extension: test fix
  lens_shift_range: z.number().optional(), // extension: test fix
  native_resolution: z.string().optional(), // extension: test fix
});

export const ScreenExtensionSchema = z.object({
  width: z.number().optional(), // extension: test fix
  height: z.number().optional(), // extension: test fix
  gain: z.number().optional(), // extension: test fix
  half_gain_angle: z.number().optional(), // extension: test fix
  alr: z.boolean().optional(), // extension: test fix
});

export const CameraExtensionSchema = z.object({
  sensor_size: z.number().optional(), // extension: test fix
  focal_min: z.number().optional(), // extension: test fix
  focal_max: z.number().optional(), // extension: test fix
  resolution: z.string().optional(), // extension: test fix
});

export const MicrophoneExtensionSchema = z.object({
  polar_pattern: z.string().optional(), // extension: test fix
  rated_coverage: z.number().optional(), // extension: test fix
});

export const LuminaireExtensionSchema = z.object({
  lumens: z.number().optional(), // extension: test fix
  beam_angle: z.number().optional(), // extension: test fix
  cct: z.number().optional(), // extension: test fix
  cri: z.number().optional(), // extension: test fix
});

export const ZoneSchema = z.object({
  id: IdentifierSchema, // extension: test fix
  name: z.string(), // extension: test fix
  locationId: z.string().optional(), // extension: test fix
  type: z.enum(['viewer', 'participant', 'task']), // extension: test fix
});
export type Zone = z.infer<typeof ZoneSchema>;

export const AcousticsExtensionSchema = z.object({
  device_class: z.string().optional(), // extension: test fix
  impedance: z.number().optional(), // extension: test fix
  z_min: z.number().optional(), // extension: test fix
  wattage_rms: z.number().optional(), // extension: test fix
  wattage_peak: z.number().optional(), // extension: test fix
  max_spl: z.number().optional(), // extension: test fix
  taps: z.array(z.number()).optional(), // extension: test fix
  type: z.string().optional(), // extension: test fix
  category: z.string().optional(), // extension: test fix
  df: z.union([z.number(), z.string()]).optional(), // extension: test fix
  df_rated_at: z.number().optional(), // extension: test fix
  min_load: z.number().optional(), // extension: test fix
  watt_8: z.number().optional(), // extension: test fix
  watt_4: z.number().optional(), // extension: test fix
  watt_2: z.number().optional(), // extension: test fix
  watt_100v: z.number().optional(), // extension: test fix
  min_load_bridge: z.number().optional(), // extension: test fix
  watt_bridge_8: z.number().optional(), // extension: test fix
  watt_bridge_4: z.number().optional(), // extension: test fix
  max_voltage_peak: z.number().optional(), // extension: test fix
  resistance: z.number().optional(), // extension: test fix
  capacitance: z.number().optional(), // extension: test fix
  inductance: z.number().optional(), // extension: test fix
});
export type AcousticsExtension = z.infer<typeof AcousticsExtensionSchema>;

export const CopperExtensionsSchema = z.object({
  acoustics: AcousticsExtensionSchema.optional(), // extension: test fix
  display: DisplayExtensionSchema.optional(), // extension: test fix
  projector: ProjectorExtensionSchema.optional(), // extension: test fix
  screen: ScreenExtensionSchema.optional(), // extension: test fix
  camera: CameraExtensionSchema.optional(), // extension: test fix
  microphone: MicrophoneExtensionSchema.optional(), // extension: test fix
  luminaire: LuminaireExtensionSchema.optional(), // extension: test fix
  ports: z.record(z.object({ signal_class: z.string().optional() })).optional(),
}).passthrough();
export type CopperExtensions = z.infer<typeof CopperExtensionsSchema>;

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
    interfaceTemplates: z.array(InterfaceTemplateSchema).optional(), // netbox: devicetype.interfaces
    frontPortTemplates: z.array(FrontPortTemplateSchema).optional(), // netbox: devicetype.front_ports
    rearPortTemplates: z.array(RearPortTemplateSchema).optional(), // netbox: devicetype.rear_ports
    consolePortTemplates: z.array(ConsolePortTemplateSchema).optional(), // netbox: devicetype.console_ports
    powerPortTemplates: z.array(PowerPortTemplateSchema).optional(), // netbox: devicetype.power_ports
    powerOutletTemplates: z.array(PowerOutletTemplateSchema).optional(), // netbox: devicetype.power_outlets
    moduleBayTemplates: z.array(ModuleBayTemplateSchema).optional(), // netbox: devicetype.module_bays
    deviceBayTemplates: z.array(DeviceBayTemplateSchema).optional(), // netbox: devicetype.device_bays
    customFields: CopperExtensionsSchema.optional(), // extension:
  })
  .passthrough();

export type DeviceType = z.infer<typeof DeviceTypeSchema>;

/**
 * Device: hardware instance owning materialized components.
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
      physicalLocation: z.string().optional(), // extension: physical location
    description: z.string().optional(), // netbox: device.description
    interfaces: z.array(InterfaceSchema).optional(), // netbox: device.interfaces
    frontPorts: z.array(FrontPortSchema).optional(), // netbox: device.front_ports
    rearPorts: z.array(RearPortSchema).optional(), // netbox: device.rear_ports
    consolePorts: z.array(ConsolePortSchema).optional(), // netbox: device.console_ports
    powerPorts: z.array(PowerPortSchema).optional(), // netbox: device.power_ports
    powerOutlets: z.array(PowerOutletSchema).optional(), // netbox: device.power_outlets
    moduleBays: z.array(ModuleBaySchema).optional(), // netbox: device.module_bays
    deviceBays: z.array(DeviceBaySchema).optional(), // netbox: device.device_bays
    customFields: CopperExtensionsSchema.optional(), // extension:
  })
  .passthrough()
  .refine(
    (device) => {
      if (!device.frontPorts || device.frontPorts.length === 0) return true;
      if (!device.rearPorts || device.rearPorts.length === 0) return false;
      const rearPortMap = new Map(device.rearPorts.map((rp) => [rp.id, rp]));
      return device.frontPorts.every((fp) => {
        const rp = rearPortMap.get(fp.rearPortId);
        if (!rp) return false;
        if (fp.rearPortPosition > rp.positions) return false;
        return true;
      });
    },
    {
      message: 'FrontPort references non-existent RearPort or invalid RearPort position on the same device',
    }
  );

export type Device = z.infer<typeof DeviceSchema>;

// ============================================================================
// Cable & Cable Terminations (ADR-0006 §1, §2, §5)
// ============================================================================

/**
 * Discriminated port reference identifying target component on a device.
 */
export const PortRefSchema = z.discriminatedUnion('kind', [ // netbox: portref.discriminated_union
  z
    .object({
      kind: z.literal('interface'), // netbox: portref.interface_kind
      name: z.string(), // netbox: portref.name
      id: IdentifierSchema.optional(), // netbox: portref.id
    })
    .strict(),
  z
    .object({
      kind: z.literal('frontPort'), // netbox: portref.frontport_kind
      name: z.string(), // netbox: portref.name
      id: IdentifierSchema.optional(), // netbox: portref.id
    })
    .strict(),
  z
    .object({
      kind: z.literal('rearPort'), // netbox: portref.rearport_kind
      name: z.string(), // netbox: portref.name
      id: IdentifierSchema.optional(), // netbox: portref.id
    })
    .strict(),
  z
    .object({
      kind: z.literal('consolePort'), // netbox: portref.consoleport_kind
      name: z.string(), // netbox: portref.name
      id: IdentifierSchema.optional(), // netbox: portref.id
    })
    .strict(),
  z
    .object({
      kind: z.literal('powerPort'), // netbox: portref.powerport_kind
      name: z.string(), // netbox: portref.name
      id: IdentifierSchema.optional(), // netbox: portref.id
    })
    .strict(),
  z
    .object({
      kind: z.literal('powerOutlet'), // netbox: portref.poweroutlet_kind
      name: z.string(), // netbox: portref.name
      id: IdentifierSchema.optional(), // netbox: portref.id
    })
    .strict(),
]);

export type PortRef = z.infer<typeof PortRefSchema>;

/**
 * CableTermination: one endpoint of a cable attached to a device port.
 */
export const CableTerminationSchema = z
  .object({
    deviceId: IdentifierSchema, // netbox: cabletermination.device
    portRef: PortRefSchema, // netbox: cabletermination.port_ref
  })
  .strict();

export type CableTermination = z.infer<typeof CableTerminationSchema>;

/**
 * Cable: exactly two terminations connecting devices/ports.
 */
export const CableSchema = z
  .object({
    id: IdentifierSchema, // netbox: cable.id
    terminations: z.tuple([CableTerminationSchema, CableTerminationSchema]), // netbox: cable.terminations
    status: CableStatusSchema, // netbox: cable.status
    type: z.string().optional(), // netbox: cable.type
    lengthM: z.number().nonnegative().optional(), // netbox: cable.length
    label: z.string().optional(), // netbox: cable.label
    color: z.string().optional(), // netbox: cable.color
    description: z.string().optional(), // netbox: cable.description
    customFields: CopperExtensionsSchema.optional(), // extension:
  })
  .passthrough();

export type Cable = z.infer<typeof CableSchema>;

// ============================================================================
// Design Document (ADR-0003, ADR-0006)
// ============================================================================

/**
 * DesignDocument: complete top-level Copper document root.
 */
export const DesignDocumentSchema = z
  .object({
    schemaVersion: z.literal(1), // extension: designdocument.schema_version
    designLabel: z.string(), // extension: designdocument.design_label
    revision: z.string().optional(), // extension: designdocument.revision
    sites: z.array(SiteSchema).default([]), // netbox: designdocument.sites
    locations: z.array(LocationSchema).default([]), // netbox: designdocument.locations
    racks: z.array(RackSchema).default([]), // netbox: designdocument.racks
    deviceTypes: z.array(DeviceTypeSchema).default([]), // netbox: designdocument.device_types
    devices: z.array(DeviceSchema).default([]), // netbox: designdocument.devices
    cables: z.array(CableSchema).default([]), // netbox: designdocument.cables
    signalClasses: z.array(SignalClassSchema).default([]), // extension: designdocument.signal_classes
    zones: z.array(ZoneSchema).default([]), // extension: designdocument.zones
    geometry: z.record(z.any()).optional(), // B108 geometry persistence // extension: test fix
  })
  .strict()
  .refine(
    (doc) => {
      const deviceMap = new Map(doc.devices.map((d) => [d.id, d]));
      for (const cable of doc.cables) {
        for (const term of cable.terminations) {
          const device = deviceMap.get(term.deviceId);
          if (!device) return false;
          const { kind, name, id } = term.portRef;
          let componentList: { name: string; id?: string }[] | undefined;
          switch (kind) {
            case 'interface':
              componentList = device.interfaces;
              break;
            case 'frontPort':
              componentList = device.frontPorts;
              break;
            case 'rearPort':
              componentList = device.rearPorts;
              break;
            case 'consolePort':
              componentList = device.consolePorts;
              break;
            case 'powerPort':
              componentList = device.powerPorts;
              break;
            case 'powerOutlet':
              componentList = device.powerOutlets;
              break;
          }
          if (!componentList || componentList.length === 0) return false;
          const found = componentList.some((c) => {
            if (id !== undefined && c.id !== id) return false;
            return c.name === name;
          });
          if (!found) return false;
        }
      }
      return true;
    },
    {
      message: 'Cable termination references non-existent device or port on device',
    }
  );

export type DesignDocument = z.infer<typeof DesignDocumentSchema>;


// ============================================================================
// Bill of Materials (BOM) Contract
// ============================================================================

/**
 * BomLineSchema: Bill of Materials line item contract.
 */
export const BomLineSchema = z
  .object({
    id: z.string().uuid(), // extension: bomline.id
    designId: z.string(), // extension: bomline.design_id
    nodeOwnership: z.string(), // extension: bomline.node_ownership
    label: z.string().regex(/^[^_%]*$/, 'Label must not contain "_" or "%" characters'), // extension: bomline.label
    statusEdge: z.string(), // extension: bomline.status_edge
    provenance: z.array(z.string()), // extension: bomline.provenance
    quantity: z.number(), // extension: bomline.quantity
    partNumber: z.string(), // extension: bomline.part_number
  })
  .strict();

export type BomLine = z.infer<typeof BomLineSchema>;

