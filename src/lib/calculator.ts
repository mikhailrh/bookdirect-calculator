export interface CalculatorInputs {
  roomCount: number;
  avgLengthOfStay: number;
  adr: number;
  occupancy: number;
  otaShare: number;
  otaCommission: number;
  recoveryRate: number;
  bdDiscount: number;
  bdCommission: number;
  directLiftRate: number;
}

export interface CalculatorResults {
  monthlyBookings: number;

  // Pool A — OTA leakage recovery
  poolANewBookings: number;
  oldNetPerBooking: number;
  newNetPerBooking: number;
  poolAPerBookingUplift: number;
  oldMonthlyNet: number;
  newMonthlyNet: number;
  poolAMonthlyUplift: number;
  poolAAnnualUplift: number;

  // Pool B — Direct channel uplift
  poolBNewBookings: number;
  poolBNetPerBooking: number;
  poolBMonthlyUplift: number;
  poolBAnnualUplift: number;

  // Combined
  combinedMonthlyUplift: number;
  combinedAnnualUplift: number;
}

export const DEFAULT_INPUTS: CalculatorInputs = {
  roomCount: 183,
  avgLengthOfStay: 1.8,
  adr: 200,
  occupancy: 65,
  otaShare: 65,
  otaCommission: 17,
  recoveryRate: 11,
  bdDiscount: 8,
  bdCommission: 5,
  directLiftRate: 5,
};

export const BD_DISCOUNT_MIN = 8;

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    roomCount,
    avgLengthOfStay,
    adr,
    occupancy,
    otaShare,
    otaCommission,
    recoveryRate,
    bdDiscount,
    bdCommission,
    directLiftRate,
  } = inputs;

  const safeAlos = avgLengthOfStay > 0 ? avgLengthOfStay : 1;

  const monthlyBookings = (roomCount * (occupancy / 100) * 30) / safeAlos;

  // Pool A — OTA leakage recovery
  const poolANewBookings =
    monthlyBookings * (otaShare / 100) * (recoveryRate / 100);

  const oldNetPerBooking = adr * (1 - otaCommission / 100);

  const discountedRate = adr * (1 - bdDiscount / 100);
  const newNetPerBooking = discountedRate * (1 - bdCommission / 100);

  const poolAPerBookingUplift = newNetPerBooking - oldNetPerBooking;

  const oldMonthlyNet = poolANewBookings * oldNetPerBooking;
  const newMonthlyNet = poolANewBookings * newNetPerBooking;
  const poolAMonthlyUplift = newMonthlyNet - oldMonthlyNet;
  const poolAAnnualUplift = poolAMonthlyUplift * 12;

  // Pool B — Direct channel uplift (symmetric with Pool A: no marginal cost deduction)
  const directBookings = monthlyBookings * (1 - otaShare / 100);
  const poolBNewBookings = directBookings * (directLiftRate / 100);
  const poolBNetPerBooking =
    adr * (1 - bdDiscount / 100) * (1 - bdCommission / 100);
  const poolBMonthlyUplift = poolBNewBookings * poolBNetPerBooking;
  const poolBAnnualUplift = poolBMonthlyUplift * 12;

  const combinedMonthlyUplift = poolAMonthlyUplift + poolBMonthlyUplift;
  const combinedAnnualUplift = poolAAnnualUplift + poolBAnnualUplift;

  return {
    monthlyBookings,
    poolANewBookings,
    oldNetPerBooking,
    newNetPerBooking,
    poolAPerBookingUplift,
    oldMonthlyNet,
    newMonthlyNet,
    poolAMonthlyUplift,
    poolAAnnualUplift,
    poolBNewBookings,
    poolBNetPerBooking,
    poolBMonthlyUplift,
    poolBAnnualUplift,
    combinedMonthlyUplift,
    combinedAnnualUplift,
  };
}

export function formatRM(value: number, fractionDigits = 0): string {
  if (!Number.isFinite(value)) return "RM 0";
  const rounded =
    fractionDigits === 0 ? Math.round(value) : Number(value.toFixed(fractionDigits));
  return `RM ${rounded.toLocaleString("en-MY", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

export function formatInt(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return Math.round(value).toLocaleString("en-MY");
}
