import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { findingRegistry, ASSET_TELEMETRY_PRODUCER_ID } from '../../shell/finding/registry';

export interface AssetTelemetryProps {
  assetId?: string;
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
}

export function AssetTelemetry({ assetId = 'AST-9001', className = '', onNavigate }: AssetTelemetryProps) {
  const { t } = useTranslation();

  useEffect(() => {
    findingRegistry.addFindings(ASSET_TELEMETRY_PRODUCER_ID, [
      {
        id: `ast-tel-risk-${assetId}`,
        severity: 'risk',
        message: t('assets.telemetry.tempWarning', 'Device temperature is critically high (82°C). Thermal throttling active.'),
        timestamp: new Date().toISOString(),
      }
    ]);

    return () => {
      findingRegistry.clearProducerFindings(ASSET_TELEMETRY_PRODUCER_ID);
    };
  }, [assetId, t]);

  return (
    <div className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 p-5 ${className}`} data-testid="asset-telemetry-surface">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('assets.telemetry.title', 'Telemetry: {{assetId}}', { assetId })}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('assets.telemetry.desc', 'Live device health and performance rollup.')}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 font-bold rounded shadow-sm text-[10px] uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            {t('assets.telemetry.statusAlert', 'Alert')}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('assets.telemetry.cpu', 'CPU Usage')}</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">88%</div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-rose-500">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('assets.telemetry.temp', 'Core Temp')}</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">82°C</div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('assets.telemetry.uptime', 'Uptime')}</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">14d 6h</div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('assets.telemetry.packetLoss', 'Packet Loss')}</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">0.01%</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t('assets.telemetry.chartTitle', 'Performance History (24h)')}
        </h2>
        <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <span className="text-slate-400 italic">{t('assets.telemetry.chartPlaceholder', '[ Timeseries Chart Placeholder ]')}</span>
        </div>
      </div>
    </div>
  );
}
