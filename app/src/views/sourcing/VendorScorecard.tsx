import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { findingRegistry, VENDOR_SCORECARD_PRODUCER_ID } from '../../shell/finding/registry';

export interface VendorScorecardProps {
  vendorId?: string;
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
}

export function VendorScorecard({ vendorId, className = '', onNavigate }: VendorScorecardProps) {
  const { t } = useTranslation();

  useEffect(() => {
    findingRegistry.addFindings(VENDOR_SCORECARD_PRODUCER_ID, [
      {
        id: `vs-deg-${vendorId || 'unknown'}`,
        severity: 'risk',
        message: t('sourcing.vendor.degradationWarning', 'Vendor delivery reliability has degraded below 85% SLA over the last 30 days.'),
        timestamp: new Date().toISOString(),
      }
    ]);

    return () => {
      findingRegistry.clearProducerFindings(VENDOR_SCORECARD_PRODUCER_ID);
    };
  }, [vendorId, t]);

  return (
    <div className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 p-5 ${className}`} data-testid="vendor-scorecard-surface">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {t('sourcing.vendor.scorecardTitle', 'Vendor Performance Scorecard')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('sourcing.vendor.scorecardDesc', 'Reliability, quality, and on-time delivery metrics.')}
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('sourcing.vendor.otd', 'On-Time Delivery')}</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">82.4%</div>
          <div className="text-xs text-rose-600 mt-1">{t('sourcing.vendor.otdTrend', '↓ 4.1% vs last month')}</div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('sourcing.vendor.quality', 'Quality Score')}</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">99.1%</div>
          <div className="text-xs text-emerald-600 mt-1">{t('sourcing.vendor.qualityTrend', '↑ 0.2% vs last month')}</div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('sourcing.vendor.leadTime', 'Avg Lead Time')}</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">14 days</div>
          <div className="text-xs text-slate-500 mt-1">{t('sourcing.vendor.leadTimeTrend', 'Stable')}</div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{t('sourcing.vendor.tierStatus', 'Tier Status')}</div>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold rounded-full text-sm">
            {t('sourcing.vendor.tierAtRisk', 'Tier 1 (At Risk)')}
          </span>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t('sourcing.vendor.radarTitle', 'Reliability Radar')}
        </h2>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <span className="text-slate-400 italic">{t('sourcing.vendor.radarPlaceholder', '[ Radar Chart Visualization Placeholder ]')}</span>
        </div>
      </div>
    </div>
  );
}
