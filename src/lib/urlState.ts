import type { CalculatorInputs } from "./calculator";
import { DEFAULT_INPUTS, BD_DISCOUNT_MIN } from "./calculator";

export interface PersistedState extends CalculatorInputs {
  hotelName: string;
}

const NUMERIC_KEYS: Array<keyof CalculatorInputs> = [
  "roomCount",
  "avgLengthOfStay",
  "adr",
  "occupancy",
  "otaShare",
  "otaCommission",
  "recoveryRate",
  "bdDiscount",
  "bdCommission",
  "directLiftRate",
];

const SHORT_KEYS: Record<string, keyof CalculatorInputs> = {
  rooms: "roomCount",
  alos: "avgLengthOfStay",
  adr: "adr",
  occ: "occupancy",
  ota: "otaShare",
  otacomm: "otaCommission",
  recov: "recoveryRate",
  disc: "bdDiscount",
  bdcomm: "bdCommission",
  dlift: "directLiftRate",
};

const REVERSE_SHORT: Record<keyof CalculatorInputs, string> = Object.entries(
  SHORT_KEYS,
).reduce(
  (acc, [short, full]) => {
    acc[full] = short;
    return acc;
  },
  {} as Record<keyof CalculatorInputs, string>,
);

export function readStateFromHash(): PersistedState {
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  const query = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(query);

  const state: PersistedState = {
    ...DEFAULT_INPUTS,
    hotelName: "",
  };

  const hotel = params.get("hotel");
  if (hotel) state.hotelName = hotel;

  for (const key of NUMERIC_KEYS) {
    const shortKey = REVERSE_SHORT[key];
    const raw = params.get(shortKey) ?? params.get(key);
    if (raw === null) continue;
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      state[key] = parsed;
    }
  }

  if (state.bdDiscount < BD_DISCOUNT_MIN) state.bdDiscount = BD_DISCOUNT_MIN;

  return state;
}

export function writeStateToHash(state: PersistedState): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();

  if (state.hotelName) params.set("hotel", state.hotelName);

  for (const key of NUMERIC_KEYS) {
    if (state[key] !== DEFAULT_INPUTS[key]) {
      params.set(REVERSE_SHORT[key], String(state[key]));
    }
  }

  const query = params.toString();
  const newHash = query ? `#${query}` : "";
  if (newHash !== window.location.hash) {
    const url = `${window.location.pathname}${window.location.search}${newHash}`;
    window.history.replaceState(null, "", url);
  }
}
