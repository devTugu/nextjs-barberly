import { MarketingColumnGrid } from './marketing-column-grid';
import { MarketingGridPattern } from './marketing-grid-pattern';

/** Site-wide grid overlay — fine texture + Stripe-style column guides. */
export function MarketingPageGrid() {
  return (
    <>
      <MarketingGridPattern className="fixed inset-0 z-[1]" />
      <MarketingColumnGrid className="fixed inset-0 z-[1]" />
    </>
  );
}
