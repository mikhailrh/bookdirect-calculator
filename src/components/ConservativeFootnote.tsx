export function ConservativeFootnote() {
  return (
    <div className="space-y-2 text-xs italic leading-relaxed text-muted">
      <p>
        This calculator models two recovery streams: OTA leakage (guests
        redirected from OTAs back to direct) and direct channel uplift (existing
        direct inquiries converting more reliably through WhatsApp). It still
        doesn't count:
      </p>
      <ul className="ml-4 list-disc space-y-1">
        <li>
          New bookings from Google ranking your BookDirect.my page (net new
          demand beyond current traffic)
        </li>
        <li>
          Upsells via the WhatsApp concierge (higher room categories, extra
          nights, ancillaries)
        </li>
        <li>Reduced front-desk workload handling pre-booking inquiries</li>
        <li>
          Long-term compounding as the page accumulates FAQ content and SEO
          authority
        </li>
      </ul>
      <p className="pt-1 not-italic text-ink/70">The real number is likely higher.</p>
    </div>
  );
}
