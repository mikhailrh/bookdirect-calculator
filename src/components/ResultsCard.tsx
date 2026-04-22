import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CalculatorResults } from "@/lib/calculator";
import { formatInt, formatRM } from "@/lib/calculator";
import { useCountUp } from "@/lib/useCountUp";
import { ComparisonTable } from "./ComparisonTable";
import { ConservativeFootnote } from "./ConservativeFootnote";
import { MethodologySection } from "./MethodologySection";

interface ResultsCardProps {
  results: CalculatorResults;
  hotelName: string;
}

function TierLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
      {children}
    </p>
  );
}

export function ResultsCard({ results, hotelName }: ResultsCardProps) {
  const poolA = useCountUp(results.poolAAnnualUplift);
  const poolB = useCountUp(results.poolBAnnualUplift);
  const combinedAnnual = useCountUp(results.combinedAnnualUplift);
  const combinedMonthly = useCountUp(results.combinedMonthlyUplift);
  const totalBookings = useCountUp(
    results.poolANewBookings + results.poolBNewBookings,
  );

  const poolANegative = results.poolAPerBookingUplift < 0;
  const poolBNegative = results.poolBNetPerBooking < 0;

  return (
    <Card className="border-accent/20 bg-white">
      <CardContent className="space-y-6 p-5 sm:p-6 md:space-y-8 md:p-8">
        {hotelName ? (
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {hotelName}
          </p>
        ) : null}

        <div className="space-y-5">
          <div>
            <TierLabel>Annual OTA leakage recovery</TierLabel>
            <p
              className="mt-1 font-display text-3xl font-bold leading-tight text-accent md:text-4xl"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatRM(poolA)}
            </p>
            <p className="mt-1 text-sm italic text-muted">
              Guests who wanted to book direct but ended up on Agoda —
              redirected back through WhatsApp.
            </p>
          </div>

          <div>
            <TierLabel>Annual direct channel uplift</TierLabel>
            <p
              className="mt-1 font-display text-3xl font-bold leading-tight text-accent md:text-4xl"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatRM(poolB)}
            </p>
            <p className="mt-1 text-sm italic text-muted">
              Previously abandoned direct-intent guests (slow replies, clunky
              booking pages) — now converting through WhatsApp.
            </p>
          </div>

          <div className="h-px bg-black/10" />

          <div>
            <TierLabel>Combined annual uplift</TierLabel>
            <p
              className="mt-1 font-display font-bold leading-none text-accent"
              style={{
                fontVariantNumeric: "tabular-nums",
                fontSize: "clamp(40px, 9vw, 56px)",
              }}
            >
              {formatRM(combinedAnnual)}
            </p>
            <p
              className="mt-3 text-xl font-medium text-ink/80 md:text-2xl"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatRM(combinedMonthly)} / month
            </p>
            <p className="mt-2 text-sm text-muted">
              Recovered bookings per month: {formatInt(totalBookings)}
            </p>
          </div>
        </div>

        {poolANegative ? (
          <div className="flex gap-3 rounded-field border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <p>
              At these settings, each recovered booking nets slightly less than
              the OTA alternative. BookDirect.my still recovers demand that would
              otherwise be lost entirely, but the per-booking economics are
              tight. Consider a lower discount if parity can be maintained.
            </p>
          </div>
        ) : null}

        {poolBNegative ? (
          <div className="flex gap-3 rounded-field border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <p>
              At these settings, each Pool B recovered booking nets less than
              zero. Lower the discount or revisit the commission assumption.
            </p>
          </div>
        ) : null}

        <ComparisonTable results={results} />

        <ConservativeFootnote />

        <div className="h-px bg-black/10" />

        <MethodologySection />
      </CardContent>
    </Card>
  );
}
