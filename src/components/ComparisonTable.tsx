import type { CalculatorResults } from "@/lib/calculator";
import { formatInt, formatRM } from "@/lib/calculator";

interface ComparisonTableProps {
  results: CalculatorResults;
}

interface UpliftTableProps {
  label: string;
  perBooking: number;
  monthly: number;
  annual: number;
  monthlyCount: number;
}

function UpliftTable({
  label,
  perBooking,
  monthly,
  annual,
  monthlyCount,
}: UpliftTableProps) {
  const monthlyHeader = `Monthly (${formatInt(monthlyCount)} bookings)`;

  return (
    <>
      {/* Mobile: stacked definition list */}
      <div className="overflow-hidden rounded-field border border-black/10 bg-accent/5 md:hidden">
        <dl className="divide-y divide-black/5">
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <dt className="text-muted">Per booking {label.toLowerCase()}</dt>
            <dd
              className="font-semibold text-accent"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatRM(perBooking)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <dt className="text-muted">
              Monthly
              <span className="ml-1 text-xs normal-case tracking-normal text-muted/80">
                ({formatInt(monthlyCount)} bookings)
              </span>
            </dt>
            <dd
              className="font-semibold text-accent"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatRM(monthly)}
            </dd>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <dt className="text-muted">Annual</dt>
            <dd
              className="font-semibold text-accent"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatRM(annual)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-field border border-black/10 md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-paper/60 text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium"></th>
              <th className="px-4 py-3 font-medium">Per booking</th>
              <th className="px-4 py-3 font-medium">{monthlyHeader}</th>
              <th className="px-4 py-3 font-medium">Annual</th>
            </tr>
          </thead>
          <tbody className="text-ink">
            <tr className="border-t border-black/10 bg-accent/5 font-semibold">
              <td className="px-4 py-3">{label}</td>
              <td className="px-4 py-3 text-accent" style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatRM(perBooking)}
              </td>
              <td className="px-4 py-3 text-accent" style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatRM(monthly)}
              </td>
              <td className="px-4 py-3 text-accent" style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatRM(annual)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export function ComparisonTable({ results }: ComparisonTableProps) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          OTA leakage recovery breakdown
        </h3>
        <UpliftTable
          label="Uplift"
          perBooking={results.poolAPerBookingUplift}
          monthly={results.poolAMonthlyUplift}
          annual={results.poolAAnnualUplift}
          monthlyCount={results.poolANewBookings}
        />
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Direct channel uplift breakdown
        </h3>
        <UpliftTable
          label="Uplift"
          perBooking={results.poolBNetPerBooking}
          monthly={results.poolBMonthlyUplift}
          annual={results.poolBAnnualUplift}
          monthlyCount={results.poolBNewBookings}
        />
      </section>
    </div>
  );
}
