import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { CalculatorInputs } from "@/lib/calculator";
import { formatInt } from "@/lib/calculator";
import { AdvancedInputs } from "./AdvancedInputs";

interface InputsCardProps {
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

export function InputsCard({ inputs, onChange }: InputsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property details</CardTitle>
        <p className="mt-1 text-xs text-muted">
          No revenue data required — every input is either publicly visible or
          your estimate.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2 md:gap-y-5">
          <div>
            <Label htmlFor="roomCount">Room count</Label>
            <Input
              id="roomCount"
              type="number"
              min={10}
              max={600}
              value={inputs.roomCount}
              onChange={(e) => onChange({ roomCount: Number(e.target.value) })}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="adr">Average room rate</Label>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                RM
              </span>
              <Input
                id="adr"
                type="number"
                min={100}
                max={2000}
                value={inputs.adr}
                onChange={(e) => onChange({ adr: Number(e.target.value) })}
                className="pl-11"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <Label>
                Average length of stay
                <Pill>{inputs.avgLengthOfStay.toFixed(1)} nights</Pill>
              </Label>
            </div>
            <Slider
              className="mt-3"
              value={[inputs.avgLengthOfStay]}
              min={1}
              max={4}
              step={0.1}
              onValueChange={([v]) => onChange({ avgLengthOfStay: v })}
            />
          </div>

          <div className="md:col-span-2">
            <Label>
              Occupancy
              <Pill>{Math.round(inputs.occupancy)}%</Pill>
            </Label>
            <Slider
              className="mt-3"
              value={[inputs.occupancy]}
              min={20}
              max={100}
              step={1}
              onValueChange={([v]) => onChange({ occupancy: v })}
            />
          </div>

          <div className="md:col-span-2">
            <Label>
              OTA share of bookings
              <Pill>{Math.round(inputs.otaShare)}%</Pill>
            </Label>
            <Slider
              className="mt-3"
              value={[inputs.otaShare]}
              min={0}
              max={100}
              step={1}
              onValueChange={([v]) => onChange({ otaShare: v })}
            />
          </div>

          <div className="md:col-span-2">
            <Label>
              OTA commission
              <Pill>{inputs.otaCommission.toFixed(0)}%</Pill>
            </Label>
            <Slider
              className="mt-3"
              value={[inputs.otaCommission]}
              min={10}
              max={25}
              step={0.5}
              onValueChange={([v]) => onChange({ otaCommission: v })}
            />
            <p className="mt-1 text-xs text-muted">
              Typical Booking.com / Agoda / Expedia range is {formatInt(15)}–
              {formatInt(22)}%.
            </p>
          </div>
        </div>

        <AdvancedInputs inputs={inputs} onChange={onChange} />
      </CardContent>
    </Card>
  );
}
