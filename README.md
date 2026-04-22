# BookDirect.my — WhatsApp Revenue Recovery Calculator

**Live:** https://bookdirect-calculator.vercel.app/

A single-page sales tool for showing hotel owners and GMs how much revenue
they're leaving on the table — both from OTA commissions on direct-intent
guests, and from existing direct-booking demand that silently leaks through
clunky booking UX.

## Design constraint

**The calculator never asks for sensitive revenue data.** Every input is either
publicly visible (room count from the Booking.com listing) or operational
gut-feel supplied by the owner (average room rate, occupancy %, OTA share %,
direct channel lift %). Total revenue is never shown or stored — all math
derives from per-booking numbers.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # run unit tests
npm run build    # produce deployable dist/
```

## The math model — two pools

All math lives in [`src/lib/calculator.ts`](src/lib/calculator.ts) as pure
functions. Unit tests in
[`src/lib/calculator.test.ts`](src/lib/calculator.test.ts) pin the worked
example, Pool B math for the Ibis scenario, a zero-occupancy edge case, and
the Pool A negative-uplift case.

### Shared volume

```
monthlyBookings = (rooms × occupancy × 30) / avgLengthOfStay
```

### Pool A — OTA leakage recovery

Guests who *wanted* to book direct, hit a clunky direct channel, gave up, and
ended up on Booking.com / Agoda. The recovery rate captures the share
BookDirect.my redirects back to direct.

```
poolANewBookings     = monthlyBookings × otaShare × recoveryRate

oldNetPerBooking     = adr × (1 − otaCommission)
newNetPerBooking     = adr × (1 − bdDiscount) × (1 − bdCommission)

poolAMonthlyUplift   = poolANewBookings × (newNetPerBooking − oldNetPerBooking)
poolAAnnualUplift    = poolAMonthlyUplift × 12
```

### Pool B — Direct channel uplift

Net-new bookings captured by improving the direct channel itself: faster
WhatsApp replies, FAQ resolution, mobile conversion. These are guests who would
have abandoned entirely — they don't show up in your OTA numbers *or* your
current direct numbers.

```
directBookings       = monthlyBookings × (1 − otaShare)
poolBNewBookings     = directBookings × directLiftRate

poolBNetPerBooking   = adr × (1 − bdDiscount) × (1 − bdCommission)

poolBMonthlyUplift   = poolBNewBookings × poolBNetPerBooking
poolBAnnualUplift    = poolBMonthlyUplift × 12
```

Pool B is symmetric with Pool A's BookDirect.my side of the comparison — no
marginal cost deduction — so both pools use the same per-booking economics.

### Combined

```
combinedMonthlyUplift = poolAMonthlyUplift + poolBMonthlyUplift
combinedAnnualUplift  = combinedMonthlyUplift × 12
```

## Input reference

| Input | Default | Range | Source |
|---|---|---|---|
| Room count | 183 | 10–600 | Public (Booking.com listing) |
| Avg length of stay | 1.8 nights | 1.0–4.0 | Operational |
| Average room rate | RM 200 | 100–2000 | Your estimate (owner-supplied ADR) |
| Occupancy | 65% | 20–100% | Operational gut-feel |
| OTA share of bookings | 65% | 0–100% | Operational gut-feel |
| OTA commission | 17% | 10–25% | Typical 15–22% |
| Recovery rate | 11% | 5–22% | Bottom of 11–15% research range (conservative anchor) |
| BookDirect.my discount | 8% | **8%**–15% | Floored at 8% for OTA parity |
| BookDirect.my commission | 5% | fixed | Flat on discounted rate |
| Direct channel lift rate | 5% | 3–12% | Bottom of 5–10% Quicktext / Asksuite / Meta range |

### Research basis for Pool B

- **Quicktext, Asksuite, Meta WhatsApp Business** case studies report 5–10%
  uplift in direct booking conversion when a WhatsApp-native channel replaces
  email / webform / phone.
- **Baymard Institute** cart-abandonment research suggests 60–70% of
  hospitality direct-booking attempts abandon before completion, primarily due
  to response latency, lack of FAQ resolution, and mobile-unfriendly booking
  forms — the exact failure modes a WhatsApp channel fixes.

### Why this is still deliberately conservative

The model explicitly does **not** count:

- Net new demand from Google ranking the BookDirect.my page (traffic beyond
  current)
- Upsells via the WhatsApp concierge (higher room categories, extra nights,
  ancillaries)
- Reduced front-desk workload on pre-booking inquiries
- Long-term compounding as the page accumulates FAQ content and SEO authority

The real number is usually higher.

## Worked example — Ibis KK

Inputs: 187 rooms, 1.8 ALOS, RM 250 ADR, 65% occupancy, 70% OTA share, 17% OTA
commission, 12.5% recovery, 8% discount, 5% BD commission, 7% direct lift.

| | Per booking | Monthly | Annual |
|---|---|---|---|
| Pool A uplift | RM 11.00 | ~RM 1,950 | ~**RM 23,398** |
| Pool B uplift | RM 218.50 | ~RM 9,296 | ~**RM 111,546** |
| **Combined**  | | | ~**RM 134,945** |

## Sharing scenarios

Hotel name and any input that differs from default is encoded in the URL hash:

```
/#hotel=Ibis%20KK&rooms=187&adr=250&occ=65&ota=70&otacomm=17&dlift=7
```

Short keys: `rooms`, `alos`, `adr`, `occ`, `ota`, `otacomm`, `recov`, `disc`,
`bdcomm`, `dlift`.

A floating **"Copy share link w current inputs"** button (bottom-right on
every viewport) copies the current URL — including hash state — to the
clipboard, so a sales rep can dial in a property's numbers and share the
live scenario in one click. Uses the modern Clipboard API with a legacy
`execCommand` fallback for older browsers / insecure contexts.

## In-app methodology

The results card has a collapsible **"How this is calculated"** section
that explains both pools, cites the research basis for the recovery and
direct-lift defaults, and lists what the model deliberately excludes.
Default-closed so it doesn't clutter the headline number, but available
for any GM who wants to audit the assumptions live.

## Tech

- Vite + React + TypeScript
- Tailwind CSS with a warm paper palette (#EFE9DD page, white cards)
- Radix primitives (Slider, Collapsible, Label) wrapped shadcn-style
- Vitest for the math tests — no UI-level tests
- Fully responsive: mobile-stacked comparison cards, tap-friendly info
  tooltips, safe-area-aware floating CTA
- Deployed to Vercel; no backend, no storage, no auth

## Built by

Mikhail — [mikhail@khalidascope.com](mailto:mikhail@khalidascope.com) · WhatsApp via [wa.link/z8g9m9](https://wa.link/z8g9m9)
