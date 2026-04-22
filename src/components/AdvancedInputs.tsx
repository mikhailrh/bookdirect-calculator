import { Info, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { CalculatorInputs } from "@/lib/calculator";
import { BD_DISCOUNT_MIN } from "@/lib/calculator";
import { useEffect, useRef, useState } from "react";

interface AdvancedInputsProps {
  inputs: CalculatorInputs;
  onChange: (next: Partial<CalculatorInputs>) => void;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
      {children}
    </span>
  );
}

export function AdvancedInputs({ inputs, onChange }: AdvancedInputsProps) {
  const [showDiscountTip, setShowDiscountTip] = useState(false);
  const discountTipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDiscountTip) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (
        discountTipRef.current &&
        !discountTipRef.current.contains(e.target as Node)
      ) {
        setShowDiscountTip(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [showDiscountTip]);

  return (
    <section className="mt-8 border-t border-black/10 pt-6">
      <h2 className="mb-5 text-lg font-semibold tracking-tight text-ink">
        Advanced assumptions
      </h2>
      <div className="space-y-6">
        <div>
          <Label>
            Recovery rate
            <Pill>{inputs.recoveryRate.toFixed(1)}%</Pill>
          </Label>
          <Slider
            className="mt-3"
            value={[inputs.recoveryRate]}
            min={5}
            max={22}
            step={0.5}
            onValueChange={([v]) => onChange({ recoveryRate: v })}
          />
          <p className="mt-1 text-xs text-muted">
            Research suggests 11–15% for boutique properties, up to 22% for
            logistically complex destinations.
          </p>
        </div>

        <div ref={discountTipRef}>
          <div className="flex items-center justify-between">
            <Label>
              BookDirect.my discount
              <Pill>{inputs.bdDiscount.toFixed(0)}%</Pill>
            </Label>
            <button
              type="button"
              className="p-1 text-muted hover:text-ink"
              onClick={() => setShowDiscountTip((v) => !v)}
              aria-expanded={showDiscountTip}
              aria-label="Why 8% minimum"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <Slider
              className="mt-3"
              value={[inputs.bdDiscount]}
              min={BD_DISCOUNT_MIN}
              max={15}
              step={1}
              onValueChange={([v]) => onChange({ bdDiscount: v })}
            />
            <div className="mt-1 flex items-center gap-1 text-[11px] text-muted">
              <Lock className="h-3 w-3" />
              <span>{BD_DISCOUNT_MIN}% minimum</span>
            </div>
          </div>
          <p className="mt-1 text-xs italic text-muted">
            Below 8%, guests don't switch from Agoda. Your combined cost — 8%
            discount plus 5% commission on the discounted rate — lands around
            12.6%. OTA commission is 15–22%. You keep the difference.
          </p>
          {showDiscountTip ? (
            <div className="mt-2 rounded-md border border-black/10 bg-white p-3 text-xs text-ink shadow-sm">
              Minimum 8% is required for OTA parity via the closed-user-group
              architecture. Anything lower breaks parity with Booking.com /
              Agoda.
            </div>
          ) : null}
        </div>

        <div>
          <Label className="flex items-center">
            BookDirect.my commission
            <Pill>{inputs.bdCommission.toFixed(0)}%</Pill>
          </Label>
          <p className="mt-2 text-xs text-muted">
            BookDirect.my charges a flat {inputs.bdCommission}% on the
            discounted rate. Not editable.
          </p>
        </div>

        <div>
          <Label>
            Direct channel lift rate
            <Pill>{inputs.directLiftRate.toFixed(0)}%</Pill>
          </Label>
          <Slider
            className="mt-3"
            value={[inputs.directLiftRate]}
            min={3}
            max={12}
            step={1}
            onValueChange={([v]) => onChange({ directLiftRate: v })}
          />
          <p className="mt-1 text-xs text-muted">
            Industry research (Quicktext, Asksuite, Meta case studies) suggests
            WhatsApp-native direct channels add 5–10% to direct booking volume
            by improving response time, FAQ resolution, and mobile conversion.
          </p>
        </div>
      </div>
    </section>
  );
}
