'use client';

import { PlatformFinancePanel } from './platform-finance-panel';
import { PlatformFinanceTrendChart } from './platform-finance-trend-chart';

export function PlatformAnalytics() {
  return (
    <div className="space-y-8">
      <PlatformFinanceTrendChart />
      <PlatformFinancePanel showHeading={false} />
    </div>
  );
}
