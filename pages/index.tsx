import Head from "next/head";
import { useState } from "react";

type AaveRateRow = {
  tokenSymbol: string;
  tokenAddress: string;
  supplyAPY: number;
  variableBorrowAPY: number;
  stableBorrowAPY: number;
};

export default function Home() {
  const [rates, setRates] = useState<AaveRateRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  async function loadRates() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/aave-rates");
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const data = await res.json();
      const rows: AaveRateRow[] = Array.isArray(data.rates) ? data.rates : [];

      rows.sort((a, b) => (b.supplyAPY || 0) - (a.supplyAPY || 0));

      setRates(rows);
      setLastUpdated(
        data.updatedAt
          ? new Date(data.updatedAt).toLocaleString()
          : new Date().toLocaleString()
      );
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e);
      setError("Failed to load rates. Check the server logs.");
      setRates(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Aave Polygon v3 – Live Rates Tracker</title>
        <meta
          name="description"
          content="On-demand live rate tracker for Aave v3 on Polygon."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main
        style={{
          minHeight: "100vh",
          margin: 0,
          padding: "32px 20px",
          fontFamily:
            '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          background:
            "radial-gradient(circle at top left, #1e293b 0, #020617 46%) fixed, radial-gradient(circle at bottom right, #111827 0, #020617 54%) fixed",
          color: "#f9fafb"
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto"
          }}
        >
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 32
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  background:
                    "conic-gradient(from 160deg, #2ebac6, #b6509e, #4c6fff, #2ebac6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 25px rgba(22, 163, 255, 0.4)"
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: "#0b1024"
                  }}
                >
                  A
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div
                  style={{
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontSize: 11,
                    color: "#9ca3af"
                  }}
                >
                  DeFi Rates
                </div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>
                  Polygon Aave v3 Tracker
                </div>
              </div>
            </div>
          </header>

          <section
            style={{
              borderRadius: 24,
              border: "1px solid rgba(148, 163, 184, 0.5)",
              padding: 20,
              background:
                "radial-gradient(circle at top, rgba(46,186,198,0.22), transparent 60%), rgba(10,15,40,0.98)",
              boxShadow: "0 22px 45px rgba(15, 23, 42, 0.55)"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                marginBottom: 16,
                alignItems: "center"
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  Polygon Aave v3 – Live Stablecoin Rates
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 999,
                      border: "1px solid rgba(148, 163, 184, 0.4)",
                      background: "rgba(15,23,42,0.85)",
                      color: "#9ca3af"
                    }}
                  >
                    On‑demand · Mainnet
                  </span>
                </div>
                <p
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: "#9ca3af",
                    maxWidth: 520
                  }}
                >
                  Fetch DAI, USDC and USDT supply and borrow APYs directly from
                  the Aave v3 Protocol Data Provider on Polygon whenever you
                  click refresh.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  type="button"
                  onClick={loadRates}
                  disabled={loading}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.7)",
                    background: "rgba(15,23,42,0.9)",
                    color: "#e5e7eb",
                    fontSize: 13,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: loading ? "default" : "pointer",
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: loading ? "#f97373" : "#22c55e"
                    }}
                  />
                  {loading ? "Loading…" : "Refresh live rates"}
                </button>
                <span
                  style={{
                    fontSize: 11,
                    color: "#9ca3af"
                  }}
                >
                  {lastUpdated
                    ? `Last updated: ${lastUpdated}`
                    : "Not loaded yet"}
                </span>
              </div>
            </div>

            {error && (
              <div
                style={{
                  marginBottom: 12,
                  fontSize: 12,
                  color: "#fecaca"
                }}
              >
                {error}
              </div>
            )}

            <div
              style={{
                borderRadius: 18,
                border: "1px solid rgba(148,163,184,0.6)",
                background: "rgba(15,23,42,0.95)",
                padding: 12,
                overflowX: "auto"
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12
                }}
              >
                <thead>
                  <tr>
                    {["Token", "Supply APY %", "Variable borrow APY %", "Stable borrow APY %"].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "6px 8px",
                            borderBottom:
                              "1px solid rgba(148,163,184,0.3)",
                            color: "#9ca3af",
                            fontWeight: 500
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rates && rates.length > 0 ? (
                    rates.map((row) => (
                      <tr key={row.tokenAddress}>
                        <td style={{ padding: "6px 8px" }}>
                          {row.tokenSymbol}
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          {row.supplyAPY.toFixed(2)}
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          {row.variableBorrowAPY.toFixed(2)}
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          {row.stableBorrowAPY.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          padding: "8px",
                          color: "#9ca3af"
                        }}
                      >
                        {loading
                          ? "Fetching rates from Polygon Aave v3…"
                          : "Click “Refresh live rates” to load data from Polygon Aave v3."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

