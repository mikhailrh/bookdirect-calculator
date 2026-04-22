import React, { useState, useEffect, useRef } from "react";

export default function FounderDashboard() {
  const [bookings, setBookings] = useState([
    {
      id: 1,
      hotel: "Ara Dinawan Resort",
      code: "DNW",
      guest: "Sarah L.",
      nights: 3,
      total: 2400,
      commission: 120,
      time: "2m ago",
      fresh: false,
    },
    {
      id: 2,
      hotel: "Ibis Kota Kinabalu",
      code: "IBS",
      guest: "Ahmad R.",
      nights: 2,
      total: 450,
      commission: 22.5,
      time: "47m ago",
      fresh: false,
    },
    {
      id: 3,
      hotel: "Ara Dinawan Resort",
      code: "DNW",
      guest: "Michelle T.",
      nights: 5,
      total: 4200,
      commission: 210,
      time: "3h ago",
      fresh: false,
    },
    {
      id: 4,
      hotel: "Hilton Kota Kinabalu",
      code: "HLT",
      guest: "David C.",
      nights: 1,
      total: 550,
      commission: 27.5,
      time: "5h ago",
      fresh: false,
    },
  ]);

  const [pulse, setPulse] = useState(false);
  const [displayTotal, setDisplayTotal] = useState(380);
  const audioCtxRef = useRef(null);

  const actualTotal = bookings.reduce((sum, b) => sum + b.commission, 0);
  const bookingCount = bookings.length;
  const gmv = bookings.reduce((sum, b) => sum + b.total, 0);

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
      time: "just now",
      fresh: true,
    };

    playKaChing();
    setPulse(true);
    setTimeout(() => setPulse(false), 1200);
    setBookings((prev) => [newBooking, ...prev]);
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
            Ops · Wed 22 Apr
          </div>
        </div>
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
              background: green,
              animation: "breathe 2s ease-in-out infinite",
            }}
          />
          LIVE
        </div>
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
            Today's commission
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
              RM {(actualTotal / bookingCount).toFixed(0)}
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
        {[
          { label: "This week", value: "1,847", delta: "+12%" },
          { label: "This month", value: "6,432", delta: "+34%" },
          { label: "YTD", value: "24.1k", delta: "+8%" },
        ].map((s) => (
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
              {s.value}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: green,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                marginTop: "2px",
              }}
            >
              {s.delta}
            </div>
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
          {bookings.map((b, i) => (
            <div
              key={b.id}
              style={{
                padding: "16px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom:
                  i < bookings.length - 1 ? `1px solid ${line}` : "none",
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
                    {b.guest} · {b.nights}n · {b.time}
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
