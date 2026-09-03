import { useDocumentStore } from '../../store/documentStore';
import { PITCH } from '../../model/geometry';

export const GRID_PITCH = PITCH || 24;
export const PIXELS_PER_METER = 40;

export interface TelemetryStreamItem {
  deviceId: string;
  metric: 'temperature' | 'occupancy' | 'decibel' | 'humidity' | 'power' | string;
  value: number;
  unit?: string | undefined;
  radius?: number | undefined; // In meters
  status?: 'normal' | 'warning' | 'critical' | 'healthy' | 'degraded' | undefined;
  color?: string | undefined;
  label?: string | undefined;
}

export interface TelemetryOverlay2DProps {
  telemetryData?: TelemetryStreamItem[] | undefined;
  visible?: boolean | undefined;
}

interface MetricStyle {
  fill: string;
  stroke: string;
  accent: string;
  fillOpacity: number;
  strokeOpacity: number;
}

function getMetricColors(item: TelemetryStreamItem): MetricStyle {
  if (item.color) {
    return {
      fill: item.color,
      stroke: item.color,
      accent: item.color,
      fillOpacity: 0.25,
      strokeOpacity: 0.8
    };
  }

  switch (item.metric) {
    case 'temperature': {
      if (item.status === 'critical' || item.value >= 32) {
        return {
          fill: 'var(--copper-error)',
          stroke: 'var(--copper-error)',
          accent: 'var(--copper-error)',
          fillOpacity: 0.35,
          strokeOpacity: 0.85
        };
      }
      if (item.status === 'warning' || item.value >= 26) {
        return {
          fill: 'var(--copper-semantic-risk, var(--copper-tertiary))',
          stroke: 'var(--copper-semantic-risk, var(--copper-tertiary))',
          accent: 'var(--copper-semantic-risk, var(--copper-tertiary))',
          fillOpacity: 0.35,
          strokeOpacity: 0.85
        };
      }
      return {
        fill: 'var(--copper-secondary)',
        stroke: 'var(--copper-secondary)',
        accent: 'var(--copper-secondary)',
        fillOpacity: 0.25,
        strokeOpacity: 0.75
      };
    }
    case 'occupancy': {
      return {
        fill: 'var(--copper-secondary)',
        stroke: 'var(--copper-secondary)',
        accent: 'var(--copper-secondary)',
        fillOpacity: 0.25,
        strokeOpacity: 0.8
      };
    }
    case 'decibel': {
      return {
        fill: 'var(--copper-primary)',
        stroke: 'var(--copper-primary)',
        accent: 'var(--copper-primary)',
        fillOpacity: 0.2,
        strokeOpacity: 0.75
      };
    }
    default: {
      return {
        fill: 'var(--copper-on-surface-variant)',
        stroke: 'var(--copper-outline)',
        accent: 'var(--copper-outline)',
        fillOpacity: 0.2,
        strokeOpacity: 0.75
      };
    }
  }
}

export function TelemetryOverlay2D({ telemetryData, visible = true }: TelemetryOverlay2DProps = {}) {
  const document = useDocumentStore((state) => state.document);

  if (!visible || !document) return null;

  const stream: TelemetryStreamItem[] =
    telemetryData ||
    (document as any)?.meta?.telemetry ||
    (document as any)?.telemetry ||
    [];

  if (!stream || stream.length === 0) return null;

  const geometry = document.geometry || {};

  return (
    <svg
      data-testid="telemetry-overlay-2d"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
        overflow: 'visible'
      }}
    >
      <defs>
        {stream.map((item) => {
          const colors = getMetricColors(item);
          return (
            <radialGradient
              key={`grad-${item.deviceId}`}
              id={`telemetry-gradient-${item.deviceId}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor={colors.accent} stopOpacity="0.45" />
              <stop offset="60%" stopColor={colors.accent} stopOpacity="0.2" />
              <stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
            </radialGradient>
          );
        })}
      </defs>

      {stream.map((item) => {
        const geo = geometry[item.deviceId];
        const gridPos = geo?.position || { x: 0, y: 0 };
        const cx = gridPos.x * GRID_PITCH;
        const cy = gridPos.y * GRID_PITCH;

        // Metric radius converted from meters to floorplan pixels
        const meterRadius = item.radius !== undefined ? item.radius : 3.0;
        const radiusPx = meterRadius * PIXELS_PER_METER;
        const colors = getMetricColors(item);
        const valueLabel = `${item.value} ${item.unit || ''}`.trim();

        return (
          <g
            key={item.deviceId}
            data-testid={`telemetry-2d-${item.deviceId}`}
            data-x={cx}
            data-y={cy}
            data-radius={radiusPx}
            data-metric={item.metric}
            data-value={item.value}
          >
            {item.metric === 'temperature' && (
              <>
                {/* Heatmap gradient overlay */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={radiusPx}
                  fill={`url(#telemetry-gradient-${item.deviceId})`}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={radiusPx}
                  fill="none"
                  stroke={colors.stroke}
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                  opacity={0.6}
                />
              </>
            )}

            {item.metric === 'occupancy' && (
              <>
                {/* Occupancy detection radius */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={radiusPx}
                  fill={colors.fill}
                  fillOpacity={colors.fillOpacity}
                  stroke={colors.stroke}
                  strokeWidth="2"
                  strokeDasharray="6,4"
                  opacity={0.8}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={radiusPx * 0.5}
                  fill="none"
                  stroke={colors.stroke}
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  opacity={0.5}
                />
              </>
            )}

            {item.metric === 'decibel' && (
              <>
                {/* Decibel contour rings */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={radiusPx}
                  fill={colors.fill}
                  fillOpacity={colors.fillOpacity}
                  stroke={colors.stroke}
                  strokeWidth="1.5"
                  opacity={0.5}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={radiusPx * 0.66}
                  fill="none"
                  stroke={colors.stroke}
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                  opacity={0.7}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={radiusPx * 0.33}
                  fill="none"
                  stroke={colors.stroke}
                  strokeWidth="2"
                  opacity={0.9}
                />
              </>
            )}

            {item.metric !== 'temperature' &&
              item.metric !== 'occupancy' &&
              item.metric !== 'decibel' && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={radiusPx}
                  fill={colors.fill}
                  fillOpacity={colors.fillOpacity}
                  stroke={colors.stroke}
                  strokeWidth="1.5"
                />
              )}

            {/* Metric pill label */}
            <g transform={`translate(${cx}, ${cy - 24})`}>
              <rect
                x="-36"
                y="-14"
                width="72"
                height="18"
                rx="9"
                fill="var(--copper-surface)"
                stroke={colors.accent}
                strokeWidth="1.5"
                opacity="0.95"
              />
              <text
                x="0"
                y="-2"
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="var(--copper-on-surface)"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {valueLabel}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
