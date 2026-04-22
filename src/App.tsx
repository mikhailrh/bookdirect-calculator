import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { InputsCard } from "@/components/InputsCard";
import { ResultsCard } from "@/components/ResultsCard";
import { ShareButton } from "@/components/ShareButton";
import type { CalculatorInputs } from "@/lib/calculator";
import { BD_DISCOUNT_MIN, calculate } from "@/lib/calculator";
import {
  readStateFromHash,
  writeStateToHash,
  type PersistedState,
} from "@/lib/urlState";

export default function App() {
  const [state, setState] = useState<PersistedState>(() => readStateFromHash());

  useEffect(() => {
    writeStateToHash(state);
  }, [state]);

  const updateInputs = (next: Partial<CalculatorInputs>) => {
    setState((prev) => {
      const merged = { ...prev, ...next };
      if (merged.bdDiscount < BD_DISCOUNT_MIN) {
        merged.bdDiscount = BD_DISCOUNT_MIN;
      }
      return merged;
    });
  };

  const results = useMemo(() => calculate(state), [state]);

  return (
    <div
      className="min-h-full w-full pb-24 pt-10 md:pt-16"
      style={{ backgroundColor: "#EFE9DD" }}
    >
      <div className="mx-auto w-full max-w-[800px] px-5">
        <header className="mb-10 space-y-5">
          <div>
            <label
              htmlFor="hotelName"
              className="text-xs font-semibold uppercase tracking-wider text-muted"
            >
              Hotel name
            </label>
            <Input
              id="hotelName"
              value={state.hotelName}
              onChange={(e) =>
                setState((prev) => ({ ...prev, hotelName: e.target.value }))
              }
              placeholder="e.g. Hilton Kota Kinabalu"
              className="mt-1 h-12 bg-transparent text-lg font-semibold md:text-xl"
            />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">
              WhatsApp Revenue Recovery Calculator
            </h1>
            <p className="mt-1 text-sm text-muted">
              by <span className="font-semibold text-accent">BookDirect.my</span>
            </p>
            <p className="mt-2 text-base text-ink/70">
              How much direct-booking revenue is your hotel leaving on the
              table?
            </p>
          </div>
        </header>

        <div className="space-y-8">
          <InputsCard inputs={state} onChange={updateInputs} />
          <ResultsCard results={results} hotelName={state.hotelName} />
        </div>

        <footer className="mt-12 text-center text-xs text-muted">
          Built by Mikhail — BookDirect.my ·{" "}
          <a
            href="mailto:mikhail@khalidascope.com"
            className="underline-offset-2 hover:text-ink hover:underline"
          >
            mikhail@khalidascope.com
          </a>{" "}
          · Questions? WhatsApp me{" "}
          <a
            href="https://wa.link/z8g9m9"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent underline underline-offset-2 hover:text-accent/80"
          >
            HERE
          </a>
          .
        </footer>
      </div>
      <ShareButton />
    </div>
  );
}
