import React from 'react';
import type { CSSProperties } from 'react';
import type { Device } from '../../../model/schema';
import { CARD_WIDTH } from '../../../model/geometry';
import type { Node } from '@antv/x6';

export interface PortItemNode {
  id: string;
  name: string;
  label?: string;
  kind: string;
  type?: string;
}

import { PHYSICAL_LOCATIONS } from '../../../model/locations';
import type { DeviceType } from '../../../model/schema';

export interface DeviceNodeData {
  device: Device;
  deviceType?: DeviceType;
  inputPorts: PortItemNode[];
  outputPorts: PortItemNode[];
  isSelected?: boolean;
}

const cardStyle: CSSProperties = {
  boxSizing: 'border-box',
  width: `${CARD_WIDTH}px`,
  height: '100%',
  backgroundColor: 'var(--md-sys-color-surface-container)',
  color: 'var(--md-sys-color-on-surface)',
  border: '1px solid var(--md-sys-color-outline-variant)',
  borderRadius: 'var(--md-sys-shape-corner-medium, 12px)',
  overflow: 'hidden',
  boxShadow: 'var(--md-sys-elevation-level-1)',
  fontFamily: 'var(--md-sys-typescale-body-medium-font-family, sans-serif)',
};

const headerStyle: CSSProperties = {
  height: `var(--copper-header-height, 24px)`,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  padding: '0 16px',
  backgroundColor: 'var(--md-sys-color-surface-container-high)',
  borderBottom: '1px solid var(--md-sys-color-outline-variant)',
  fontWeight: 'bold',
  fontSize: 'var(--copper-header-font-size, 10px)',
};

const titleStyle: CSSProperties = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  width: '100%',
};

const columnsContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
};

const columnStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
};

const portRowStyle: CSSProperties = {
  height: `var(--copper-terminal-spacing, 24px)`,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  padding: '0 8px',
};

const portNameStyle: CSSProperties = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontWeight: 500,
  fontSize: 'var(--copper-terminal-font-size, 8px)',
};

const portTypeStyle: CSSProperties = {
  color: 'var(--md-sys-color-on-surface-variant)',
  fontSize: 'calc(var(--copper-terminal-font-size, 8px) - 1px)',
};

export const DeviceNodeComponent: React.FC<{ node?: Node }> = ({ node }) => {
  const data = node?.getData<DeviceNodeData>();
  if (!data) return null;

  const { device, deviceType, inputPorts = [], outputPorts = [], isSelected } = data;
  
  const designation = device?.designation ?? device?.name?.split(' ')[0] ?? '';
  const brand = deviceType?.manufacturer ?? 'Unknown';
  const model = deviceType?.model ?? 'Unknown';
  const kind = deviceType?.id ? deviceType.id.split('-').pop() : ''; // fallback, or we can just use model
  
  const displayName = `${designation} - ${brand} ${model} (${kind})`.replace(' ()', '');
  
  const loc = device?.physicalLocation ? PHYSICAL_LOCATIONS[device.physicalLocation] : null;

  const renderPort = (port: PortItemNode, isInput: boolean) => {
    const portDisplayName = port.label || port.name;
    return (
      <div
        key={port.id}
        className="copper-port-row"
        style={{
          ...portRowStyle,
          justifyContent: isInput ? 'flex-start' : 'flex-end',
          textAlign: isInput ? 'left' : 'right'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: isInput ? 'row' : 'row-reverse' }}>
          <span style={portNameStyle} title={portDisplayName}>
            {portDisplayName}
          </span>
          {port.type && (
            <span style={{ ...portTypeStyle, marginLeft: isInput ? '4px' : '0', marginRight: isInput ? '0' : '4px' }}>
              ({port.type})
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="copper-device-node" style={{
      ...cardStyle,
      border: isSelected ? '2px solid var(--copper-tertiary)' : cardStyle.border,
      boxShadow: isSelected ? '0 0 0 4px var(--copper-tertiary-container)' : cardStyle.boxShadow
    }}>
      <header className="copper-device-header" style={{
        ...headerStyle,
        backgroundColor: loc ? loc.bgColor : headerStyle.backgroundColor,
        color: loc ? loc.color : headerStyle.color
      }}>
        <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '8px' }}>
          {loc && (
            <span style={{
              fontWeight: 900,
              padding: '2px 4px',
              borderRadius: '4px',
              backgroundColor: loc.color,
              color: loc.bgColor,
              fontSize: 'calc(var(--copper-header-font-size, 10px) - 1px)'
            }} title={device.physicalLocation}>
              {loc.code}
            </span>
          )}
          <div style={titleStyle} title={displayName}>
            {displayName}
          </div>
        </div>
      </header>
      <div style={columnsContainerStyle}>
        <div style={{ ...columnStyle, borderRight: '1px solid var(--md-sys-color-outline-variant)' }}>
          {inputPorts.map(p => renderPort(p, true))}
        </div>
        <div style={columnStyle}>
          {outputPorts.map(p => renderPort(p, false))}
        </div>
      </div>
    </div>
  );
};


