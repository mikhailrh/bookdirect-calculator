import { describe, it, expect } from "vitest";
import { calculate, DEFAULT_INPUTS } from "./calculator";

const within2pct = (actual: number, expected: number) =>
  Math.abs(actual - expected) / expected <= 0.02;

describe("calculate — Pool A (OTA leakage recovery)", () => {
  it("matches the worked example within 2% tolerance", () => {
    const r = calculate({
      ...DEFAULT_INPUTS,
      roomCount: 305,
      avgLengthOfStay: 1.8,
      adr: 520,
      occupancy: 68,
      otaShare: 70,
      otaCommission: 18,
      recoveryRate: 12.5,
      bdDiscount: 8,
      bdCommission: 5,
    });

    expect(within2pct(r.monthlyBookings, 3456)).toBe(true);
    expect(within2pct(r.poolANewBookings, 302)).toBe(true);
    expect(r.oldNetPerBooking).toBeCloseTo(426.4, 1);
    expect(r.newNetPerBooking).toBeCloseTo(454.48, 1);
    expect(within2pct(r.poolAMonthlyUplift, 8480)).toBe(true);
    expect(within2pct(r.poolAAnnualUplift, 101760)).toBe(true);
  });

  it("returns zeros when occupancy is zero", () => {
    const r = calculate({
      ...DEFAULT_INPUTS,
      roomCount: 100,
      avgLengthOfStay: 2,
      adr: 400,
      occupancy: 0,
      otaShare: 60,
    });

    expect(r.monthlyBookings).toBe(0);
    expect(r.poolANewBookings).toBe(0);
    expect(r.oldMonthlyNet).toBe(0);
    expect(r.newMonthlyNet).toBe(0);
    expect(r.poolAMonthlyUplift).toBe(0);
    expect(r.poolAAnnualUplift).toBe(0);
    expect(r.poolBNewBookings).toBe(0);
    expect(r.poolBMonthlyUplift).toBe(0);
    expect(r.combinedAnnualUplift).toBe(0);
    expect(r.oldNetPerBooking).toBeCloseTo(332, 0);
  });

  it("flags negative Pool A per-booking uplift when discount + BD commission exceeds OTA commission", () => {
    const r = calculate({
      ...DEFAULT_INPUTS,
      roomCount: 50,
      avgLengthOfStay: 2,
      adr: 400,
      occupancy: 65,
      otaShare: 60,
      otaCommission: 10,
      recoveryRate: 12.5,
      bdDiscount: 15,
      bdCommission: 5,
    });

    expect(r.oldNetPerBooking).toBeCloseTo(360, 0);
    expect(r.newNetPerBooking).toBeCloseTo(323, 0);
    expect(r.poolAPerBookingUplift).toBeLessThan(0);
    expect(r.poolAMonthlyUplift).toBeLessThan(0);
  });
});

describe("calculate — Pool B (Direct channel uplift) and combined", () => {
  const ibis = {
    ...DEFAULT_INPUTS,
    roomCount: 187,
    avgLengthOfStay: 1.8,
    adr: 250,
    occupancy: 65,
    otaShare: 70,
    otaCommission: 17,
    recoveryRate: 12.5,
    bdDiscount: 8,
    bdCommission: 5,
    directLiftRate: 7,
  };

  it("computes Pool B components for the Ibis KK scenario", () => {
    const r = calculate(ibis);

    // monthlyBookings = 187 * 0.65 * 30 / 1.8 ≈ 2025.83
    expect(within2pct(r.monthlyBookings, 2026)).toBe(true);

    // poolBNewBookings = 2025.83 * 0.30 * 0.07 ≈ 42.54
    expect(within2pct(r.poolBNewBookings, 42.54)).toBe(true);

    // poolBNetPerBooking = 250 * 0.92 * 0.95 = 218.50 (no marginal cost deduction)
    expect(r.poolBNetPerBooking).toBeCloseTo(218.5, 1);

    // poolBAnnualUplift ≈ 42.54 * 218.50 * 12 ≈ RM 111,546
    expect(within2pct(r.poolBAnnualUplift, 111546)).toBe(true);
  });

  it("computes combined total for Ibis scenario (Pool A + Pool B)", () => {
    const r = calculate(ibis);

    // Pool A annual ≈ RM 23,398; Pool B annual ≈ RM 111,546; total ≈ RM 134,944
    expect(within2pct(r.combinedAnnualUplift, 134944)).toBe(true);
    expect(r.combinedAnnualUplift).toBeCloseTo(
      r.poolAAnnualUplift + r.poolBAnnualUplift,
      2,
    );
  });

  it("leaves negative Pool B net per booking code path unreachable at valid inputs", () => {
    // With marginal cost removed, poolBNetPerBooking = adr * (1-disc) * (1-bdcomm) is
    // always positive at valid input ranges (discount 8-15%, bd commission 5%).
    // The guard/warning logic remains in place but is effectively unreachable.
    const r = calculate({
      ...DEFAULT_INPUTS,
      adr: 200,
      bdDiscount: 15,
      bdCommission: 5,
    });

    // net per booking = 200 * 0.85 * 0.95 = 161.50 — still positive.
    expect(r.poolBNetPerBooking).toBeGreaterThan(0);
  });
});
