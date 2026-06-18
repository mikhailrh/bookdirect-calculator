import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

const FOUNDER_EMAIL = "kyle.razakharris@gmail.com";

// Demo dataset shown until a founder logs in. createdAt is a ms epoch so the
// day/week/month toggle has data spread across periods to filter.
function makeDemoBookings() {
  const now = Date.now();
  const MIN = 60000, HR = 3600000, DAY = 86400000;
  return [
    // Today (sums to RM 380 commission — the headline default)
    { id: 1, hotel: "Ara Dinawan Resort", code: "DNW", guest: "Sarah L.", nights: 3, total: 2400, commission: 120, createdAt: now - 2 * MIN, fresh: false },
    { id: 2, hotel: "Ibis Kota Kinabalu", code: "IBS", guest: "Ahmad R.", nights: 2, total: 450, commission: 22.5, createdAt: now - 47 * MIN, fresh: false },
    { id: 3, hotel: "Ara Dinawan Resort", code: "DNW", guest: "Michelle T.", nights: 5, total: 4200, commission: 210, createdAt: now - 3 * HR, fresh: false },
    { id: 4, hotel: "Hilton Kota Kinabalu", code: "HLT", guest: "David C.", nights: 1, total: 550, commission: 27.5, createdAt: now - 5 * HR, fresh: false },
    // Earlier this week
    { id: 5, hotel: "Ara Dinawan Resort", code: "DNW", guest: "Wei Lin", nights: 4, total: 3200, commission: 160, createdAt: now - 2 * DAY, fresh: false },
    { id: 6, hotel: "Ibis Kota Kinabalu", code: "IBS", guest: "Priya S.", nights: 2, total: 440, commission: 22, createdAt: now - 4 * DAY, fresh: false },
    // Earlier this month
    { id: 7, hotel: "Hilton Kota Kinabalu", code: "HLT", guest: "Raj P.", nights: 3, total: 1650, commission: 82.5, createdAt: now - 12 * DAY, fresh: false },
    { id: 8, hotel: "Ara Dinawan Resort", code: "DNW", guest: "Nurul A.", nights: 6, total: 4800, commission: 240, createdAt: now - 20 * DAY, fresh: false },
    // Older (shows up only in YTD)
    { id: 9, hotel: "Ibis Kota Kinabalu", code: "IBS", guest: "Haziq M.", nights: 2, total: 460, commission: 23, createdAt: now - 45 * DAY, fresh: false },
    { id: 10, hotel: "Hilton Kota Kinabalu", code: "HLT", guest: "Emma K.", nights: 2, total: 1100, commission: 55, createdAt: now - 70 * DAY, fresh: false },
  ];
}

export default function FounderDashboard() {
  const [bookings, setBookings] = useState(makeDemoBookings);

  // Auth + live-data state. Demo data shows until a founder logs in.
  const [live, setLive] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authMsg, setAuthMsg] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState(FOUNDER_EMAIL);
  const [password, setPassword] = useState("");

  const [pulse, setPulse] = useState(false);
  const [displayTotal, setDisplayTotal] = useState(380);
  const audioCtxRef = useRef(null);

  // Paginate the activity list so the page stops growing once it's long enough.
  const PAGE_SIZE = 6;
  const [page, setPage] = useState(0);

  // Day / week / month period filter for the whole view.
  const [period, setPeriod] = useState("day");

  const startOf = (p) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (p === "week") {
      const dow = (d.getDay() + 6) % 7; // Monday = start of week
      d.setDate(d.getDate() - dow);
    } else if (p === "month") {
      d.setDate(1);
    } else if (p === "year") {
      d.setMonth(0, 1);
    }
    return d.getTime();
  };

  const timeAgo = (ts) => {
    const diff = Date.now() - ts;
    const MIN = 60000, HR = 3600000, DAY = 86400000;
    if (diff < MIN) return "just now";
    if (diff < HR) return `${Math.floor(diff / MIN)}m ago`;
    if (diff < DAY) return `${Math.floor(diff / HR)}h ago`;
    return `${Math.floor(diff / DAY)}d ago`;
  };

  // Headline + activity are scoped to the selected period.
  const filtered = bookings.filter((b) => b.createdAt >= startOf(period));
  const actualTotal = filtered.reduce((sum, b) => sum + b.commission, 0);
  const bookingCount = filtered.length;
  const gmv = filtered.reduce((sum, b) => sum + b.total, 0);
  const avg = bookingCount ? actualTotal / bookingCount : 0;

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const pageBookings = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  // Standing trend tiles with REAL period-to-date deltas: this period so far vs
  // the same window in the previous period. Delta is null (hidden) when there's
  // no prior-period baseline to compare against.
  const sumBetween = (start, end) =>
    bookings
      .filter((b) => b.createdAt >= start && (end == null || b.createdAt < end))
      .reduce((s, b) => s + b.commission, 0);

  const prevStart = (p) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (p === "week") return startOf("week") - 7 * 86400000;
    if (p === "month") {
      d.setDate(1);
      d.setMonth(d.getMonth() - 1);
      return d.getTime();
    }
    d.setMonth(0, 1);
    d.setFullYear(d.getFullYear() - 1);
    return d.getTime();
  };

  const nowMs = Date.now();
  const trend = ["week", "month", "year"].map((p, i) => {
    const curStart = startOf(p);
    const pStart = prevStart(p);
    const elapsed = nowMs - curStart;
    const cur = sumBetween(curStart, null);
    const prev = sumBetween(pStart, pStart + elapsed);
    return {
      label: ["This week", "This month", "YTD"][i],
      value: cur,
      delta: prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null,
    };
  });

  const periodLabel =
    period === "day"
      ? "Today's commission"
      : period === "week"
      ? "This week's commission"
      : "This month's commission";

  const headerDate = new Date().toLocaleDateString("en-MY", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  useEffect(() => {
    if (displayTotal === actualTotal) return;
    const diff = actualTotal - displayTotal;
    const step = diff / 30;
    const interval = setInterval(() => {
      setDisplayTotal((prev) => {
        const next = prev + step;
        if (Math.abs(next - actualTotal) < Math.abs(step)) {
          clearInterval(interval);
          return actualTotal;
        }
        return next;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [actualTotal]);

  // Load real metrics for the authenticated founder; fall back to demo otherwise.
  useEffect(() => {
    let active = true;
    const apply = async (sess) => {
      if (!active) return;
      setSession(sess);
      const em = sess?.user?.email?.toLowerCase();
      if (sess && em === FOUNDER_EMAIL) {
        setLoading(true);
        setAuthMsg("");
        const { data, error } = await supabase.functions.invoke("ops-metrics");
        if (!active) return;
        setLoading(false);
        if (error) {
          setAuthMsg("Couldn't load live data — showing demo.");
          return;
        }
        setBookings(data.bookings || []);
        setLive(true);
        setLoginOpen(false);
        setPage(0);
      } else {
        setLive(false);
        setBookings(makeDemoBookings());
      }
    };
    supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) =>
      apply(sess)
    );
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async () => {
    setAuthMsg("Signing in…");
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    // On success, onAuthStateChange loads live data and closes this panel.
    if (error) setAuthMsg(error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setLive(false);
    setBookings(makeDemoBookings());
    setPage(0);
  };

  const playKaChing = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const tones = [
        { freq: 1760, start: 0, dur: 0.15 },
        { freq: 2637, start: 0.08, dur: 0.25 },
        { freq: 2093, start: 0.2, dur: 0.4 },
      ];
      tones.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + start);
        gain.gain.linearRampToValueAtTime(0.3, now + start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur);
      });
    } catch (e) {
      console.log("Audio blocked:", e);
    }
  };

  const simulateBooking = () => {
    const hotelOpts = [
      { hotel: "Ara Dinawan Resort", code: "DNW", rate: 800 },
      { hotel: "Ibis Kota Kinabalu", code: "IBS", rate: 220 },
      { hotel: "Hilton Kota Kinabalu", code: "HLT", rate: 550 },
    ];
    const guests = [
      "James W.",
      "Priya S.",
      "Haziq M.",
      "Emma K.",
      "Wei Lin",
      "Raj P.",
      "Nurul A.",
    ];
    const pick = hotelOpts[Math.floor(Math.random() * hotelOpts.length)];
    const guest = guests[Math.floor(Math.random() * guests.length)];
    const nights = Math.floor(Math.random() * 5) + 1;
    const total = nights * pick.rate;
    const commission = total * 0.05;

    const newBooking = {
      id: Date.now(),
      hotel: pick.hotel,
      code: pick.code,
      guest,
      nights,
      total,
      commission,
      createdAt: Date.now(),
      fresh: true,
    };

    playKaChing();
    setPulse(true);
    setTimeout(() => setPulse(false), 1200);
    setBookings((prev) => [newBooking, ...prev]);
    setPage(0); // jump back to the newest page so the fresh booking is visible
    setTimeout(() => {
      setBookings((prev) =>
        prev.map((b) => (b.id === newBooking.id ? { ...b, fresh: false } : b))
      );
    }, 3000);
  };

  const cream = "#F5EDE0";
  const creamDeep = "#EDE3D2";
  const navy = "#0F1F3F";
  const muted = "#8A7F6E";
  const line = "#E5DAC4";
  const green = "#0F9D58";
  const red = "#C0392B";

  const pagerBtn = (disabled) => ({
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    border: `1px solid ${line}`,
    background: disabled ? "transparent" : creamDeep,
    color: disabled ? line : navy,
    fontSize: "16px",
    lineHeight: 1,
    cursor: disabled ? "default" : "pointer",
    fontFamily: '"DM Sans", sans-serif',
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#E8E4DD",
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
        color: navy,
      }}
    >
      <div
        style={{
          background: cream,
          padding: "20px 18px 140px",
          maxWidth: "430px",
          margin: "0 auto",
          minHeight: "100vh",
          position: "relative",
        }}
      >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
          paddingTop: "8px",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "20px",
              fontWeight: 500,
              letterSpacing: "-0.3px",
              color: navy,
            }}
          >
            BookDirect
            <span style={{ fontStyle: "italic", color: muted }}>.my</span>
          </div>
          <div
            style={{
              fontSize: "11px",
              color: muted,
              letterSpacing: "0.5px",
              marginTop: "2px",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            Ops · {headerDate}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 10px",
              background: "rgba(15, 31, 63, 0.05)",
              borderRadius: "100px",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.3px",
              color: navy,
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: live ? green : muted,
                animation: live ? "breathe 2s ease-in-out infinite" : "none",
              }}
            />
            {live ? "LIVE" : "DEMO"}
          </div>
          <button
            onClick={() => (live ? logout() : setLoginOpen((v) => !v))}
            style={{
              padding: "6px 10px",
              borderRadius: "100px",
              border: `1px solid ${line}`,
              background: "transparent",
              color: navy,
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: '"DM Sans", sans-serif',
            }}
          >
            {live ? "Log out" : "Log in"}
          </button>
        </div>
      </div>

      {loginOpen && !live && (
        <div
          style={{
            background: "#FFFBF2",
            border: `1px solid ${line}`,
            borderRadius: "16px",
            padding: "14px",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: muted,
              fontWeight: 600,
              marginBottom: "8px",
              letterSpacing: "0.3px",
            }}
          >
            Founder login — switch to real revenue
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              style={{
                minWidth: 0,
                padding: "9px 12px",
                borderRadius: "10px",
                border: `1px solid ${line}`,
                background: cream,
                fontSize: "13px",
                color: navy,
                fontFamily: '"DM Sans", sans-serif',
              }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && signIn()}
              placeholder="Password"
              style={{
                minWidth: 0,
                padding: "9px 12px",
                borderRadius: "10px",
                border: `1px solid ${line}`,
                background: cream,
                fontSize: "13px",
                color: navy,
                fontFamily: '"DM Sans", sans-serif',
              }}
            />
            <button
              onClick={signIn}
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                border: "none",
                background: navy,
                color: cream,
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              Log in
            </button>
          </div>
          {authMsg && (
            <div style={{ fontSize: "11px", color: muted, marginTop: "8px" }}>
              {authMsg}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div
          style={{
            fontSize: "11px",
            color: muted,
            textAlign: "center",
            marginBottom: "10px",
            letterSpacing: "0.3px",
          }}
        >
          Loading live data…
        </div>
      )}

      {/* Day / week / month period toggle */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          padding: "4px",
          background: creamDeep,
          borderRadius: "100px",
          border: `1px solid ${line}`,
          marginBottom: "14px",
        }}
      >
        {["day", "week", "month"].map((p) => (
          <button
            key={p}
            onClick={() => {
              setPeriod(p);
              setPage(0);
            }}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: "100px",
              border: "none",
              background: period === p ? navy : "transparent",
              color: period === p ? cream : muted,
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.3px",
              textTransform: "capitalize",
              fontFamily: '"DM Sans", sans-serif',
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div
        style={{
          background: navy,
          borderRadius: "24px",
          padding: "28px 26px 26px",
          marginBottom: "14px",
          position: "relative",
          overflow: "hidden",
          transform: pulse ? "scale(1.015)" : "scale(1)",
          transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          boxShadow: pulse
            ? "0 20px 60px rgba(15, 157, 88, 0.25), 0 0 0 1px rgba(15, 157, 88, 0.3)"
            : "0 10px 30px rgba(15, 31, 63, 0.15)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            border: "1px solid rgba(245, 237, 224, 0.08)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            border: "1px solid rgba(245, 237, 224, 0.05)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "2px",
              color: "rgba(245, 237, 224, 0.5)",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            {periodLabel}
          </div>
          <div
            style={{
              fontSize: "10px",
              fontFamily: '"JetBrains Mono", monospace',
              color: "rgba(245, 237, 224, 0.4)",
              letterSpacing: "0.5px",
            }}
          >
            5.00%
          </div>
        </div>

        <div
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: "56px",
            fontWeight: 400,
            letterSpacing: "-1.5px",
            lineHeight: 1,
            color: cream,
            fontVariantNumeric: "tabular-nums",
            display: "flex",
            alignItems: "baseline",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "20px",
              color: "rgba(245, 237, 224, 0.5)",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            RM
          </span>
          {displayTotal.toLocaleString("en-MY", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>

        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "22px",
            paddingTop: "18px",
            borderTop: "1px solid rgba(245, 237, 224, 0.1)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "9px",
                letterSpacing: "1.5px",
                color: "rgba(245, 237, 224, 0.45)",
                textTransform: "uppercase",
                fontWeight: 600,
                marginBottom: "3px",
              }}
            >
              Bookings
            </div>
            <div
              style={{
                fontSize: "16px",
                color: cream,
                fontWeight: 500,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {bookingCount}
            </div>
          </div>
          <div style={{ width: "1px", background: "rgba(245, 237, 224, 0.1)" }} />
          <div>
            <div
              style={{
                fontSize: "9px",
                letterSpacing: "1.5px",
                color: "rgba(245, 237, 224, 0.45)",
                textTransform: "uppercase",
                fontWeight: 600,
                marginBottom: "3px",
              }}
            >
              GMV
            </div>
            <div
              style={{
                fontSize: "16px",
                color: cream,
                fontWeight: 500,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              RM {gmv.toLocaleString()}
            </div>
          </div>
          <div style={{ width: "1px", background: "rgba(245, 237, 224, 0.1)" }} />
          <div>
            <div
              style={{
                fontSize: "9px",
                letterSpacing: "1.5px",
                color: "rgba(245, 237, 224, 0.45)",
                textTransform: "uppercase",
                fontWeight: 600,
                marginBottom: "3px",
              }}
            >
              Avg
            </div>
            <div
              style={{
                fontSize: "16px",
                color: cream,
                fontWeight: 500,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              RM {avg.toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "8px",
          marginBottom: "32px",
        }}
      >
        {trend.map((s) => (
          <div
            key={s.label}
            style={{
              padding: "14px 12px",
              background: creamDeep,
              borderRadius: "16px",
              border: `1px solid ${line}`,
            }}
          >
            <div
              style={{
                fontSize: "9px",
                color: muted,
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                color: navy,
                letterSpacing: "-0.3px",
              }}
            >
              <span style={{ fontSize: "10px", color: muted, marginRight: "2px" }}>
                RM
              </span>
              {s.value.toLocaleString("en-MY", { maximumFractionDigits: 0 })}
            </div>
            {s.delta != null && (
              <div
                style={{
                  fontSize: "10px",
                  color: s.delta >= 0 ? green : red,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                  marginTop: "2px",
                }}
              >
                {s.delta >= 0 ? "+" : ""}
                {s.delta}%
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "1.5px",
              color: navy,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Activity
          </div>
          <div
            style={{
              fontSize: "11px",
              color: muted,
              fontWeight: 500,
            }}
          >
            View all →
          </div>
        </div>

        <div
          style={{
            background: "#FFFBF2",
            borderRadius: "18px",
            border: `1px solid ${line}`,
            overflow: "hidden",
          }}
        >
          {pageBookings.length === 0 && (
            <div
              style={{
                padding: "28px 18px",
                textAlign: "center",
                fontSize: "12px",
                color: muted,
                fontWeight: 500,
              }}
            >
              No bookings {period === "day" ? "today" : "this " + period} yet.
            </div>
          )}
          {pageBookings.map((b, i) => (
            <div
              key={b.id}
              style={{
                padding: "16px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom:
                  i < pageBookings.length - 1 ? `1px solid ${line}` : "none",
                background: b.fresh
                  ? "linear-gradient(90deg, rgba(15, 157, 88, 0.08), transparent)"
                  : "transparent",
                transition: "background 0.6s ease",
                animation: b.fresh ? "slideIn 0.5s ease" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "12px",
                    background: navy,
                    color: cream,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    flexShrink: 0,
                  }}
                >
                  {b.code}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: navy,
                      marginBottom: "2px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {b.hotel}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: muted,
                      fontWeight: 500,
                    }}
                  >
                    {b.guest} · {b.nights}n · {timeAgo(b.createdAt)}
                  </div>
                </div>
              </div>
              <div
                style={{
                  textAlign: "right",
                  flexShrink: 0,
                  marginLeft: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: b.fresh ? green : navy,
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "-0.2px",
                  }}
                >
                  +{b.commission.toFixed(2)}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: muted,
                    fontVariantNumeric: "tabular-nums",
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  of {b.total.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {pageCount > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "14px",
              marginTop: "14px",
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={pagerBtn(page === 0)}
              aria-label="Previous page"
            >
              ‹
            </button>
            <div
              style={{
                fontSize: "11px",
                color: muted,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "0.5px",
              }}
            >
              {page + 1} / {pageCount}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page === pageCount - 1}
              style={pagerBtn(page === pageCount - 1)}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: "10px",
          color: muted,
          textAlign: "center",
          letterSpacing: "0.5px",
          fontFamily: '"JetBrains Mono", monospace',
        }}
      >
        Yes Can Do Sdn Bhd · Private
      </div>

      {!live && (
        <button
          onClick={simulateBooking}
          style={{
            position: "fixed",
            bottom: "28px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "14px 28px",
            background: navy,
            border: "none",
            borderRadius: "100px",
            color: cream,
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.3px",
            fontFamily: '"DM Sans", sans-serif',
            cursor: "pointer",
            boxShadow:
              "0 12px 32px rgba(15, 31, 63, 0.35), 0 0 0 1px rgba(15, 31, 63, 0.1)",
            zIndex: 10,
          }}
        >
          Simulate
        </button>
      )}

      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateX(-8px);
            background: rgba(15, 157, 88, 0.2);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        * { box-sizing: border-box; }
      `}</style>
      </div>
    </div>
  );
}
