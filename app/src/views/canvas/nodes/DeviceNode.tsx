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

export interface DeviceNodeData {
  device: Device;
  inputPorts: PortItemNode[];
  outputPorts: PortItemNode[];
}

const cardStyle: CSSProperties = {
  boxSizing: 'border-box',
  width: `${CARD_WIDTH}px`,
  height: '100%',
  backgroundColor: 'var(--md-sys-color-surface-container, #ffffff)',
  color: 'var(--md-sys-color-on-surface, #1c1b1f)',
  border: '1px solid var(--md-sys-color-outline-variant, #cac4d0)',
  borderRadius: 'var(--md-sys-shape-corner-medium, 12px)',
  overflow: 'hidden',
  boxShadow: 'var(--md-sys-elevation-level-1, 0px 1px 3px 1px rgba(0, 0, 0, 0.15))',
  fontFamily: 'var(--md-sys-typescale-body-medium-font-family, sans-serif)',
};

const headerStyle: CSSProperties = {
  height: `var(--copper-header-height, 24px)`,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  padding: '0 16px',
  backgroundColor: 'var(--md-sys-color-surface-container-high, #ece6f0)',
  borderBottom: '1px solid var(--md-sys-color-outline-variant, #cac4d0)',
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
  color: 'var(--md-sys-color-on-surface-variant, #79747e)',
  fontSize: 'calc(var(--copper-terminal-font-size, 8px) - 1px)',
};

export const DeviceNodeComponent: React.FC<{ node?: Node }> = ({ node }) => {
  const data = node?.getData<DeviceNodeData>();
  if (!data) return null;

  const { device, inputPorts = [], outputPorts = [] } = data;
  const displayName = device?.name ?? device?.designation ?? device?.id ?? 'Unknown Device';

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
    <div className="copper-device-node" style={cardStyle}>
      <header className="copper-device-header" style={headerStyle}>
        <div style={titleStyle} title={displayName}>
          {displayName}
        </div>
      </header>
      <div style={columnsContainerStyle}>
        <div style={{ ...columnStyle, borderRight: '1px solid var(--md-sys-color-outline-variant, #f0f0f0)' }}>
          {inputPorts.map(p => renderPort(p, true))}
        </div>
        <div style={columnStyle}>
          {outputPorts.map(p => renderPort(p, false))}
        </div>
      </div>
    </div>
  );
};

