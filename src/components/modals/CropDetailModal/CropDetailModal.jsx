import { useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const MOCK_PRICE_DATA = [
  { date: "Apr 1", price: 488 },
  { date: "Apr 8", price: 491 },
  { date: "Apr 15", price: 495 },
  { date: "Apr 22", price: 493 },
  { date: "Apr 29", price: 498 },
  { date: "May 6", price: 500 },
  { date: "May 13", price: 500 },
];

export default function CropDetailModal() {
  const { cropDetail, setCropDetail, handleBookmark, watchlist, handleInvest } = useAppContext();
  const [activeTab, setActiveTab] = useState("overview");

  if (!cropDetail) return null;

  function handleClose() {
    setCropDetail(null);
    setActiveTab("overview");
  }

  const isWatchlisted = watchlist.includes(cropDetail.id);

  return (
    <div id="crop-modal-backdrop" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className={`cem-shell ${cropDetail.risk === "med" ? "risk-med" : ""}`}>

        {/* Header */}
        <div className="cem-header">
          <div>
            <p className="cem-eyebrow">BSE Crop Listing · Season 2025</p>
            <h2 className="cem-crop-name">{cropDetail.name}</h2>
            <p className="cem-crop-variety">{cropDetail.variety}</p>
          </div>
          <div className="cem-header-right">
            <span className={`cem-risk-badge ${cropDetail.risk === "med" ? "cem-risk-med" : "cem-risk-low"}`}>
              {cropDetail.risk === "med" ? "MED RISK" : "LOW RISK"}
            </span>
            <button className="cem-close" onClick={handleClose}>✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="cem-tabs">
          {["overview", "agronomist", "weather", "chart"].map((tab) => (
            <button
              key={tab}
              className={`cem-tab${activeTab === tab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "overview" && "Overview"}
              {tab === "agronomist" && "Agronomist Notes"}
              {tab === "weather" && "Weather Risk"}
              {tab === "chart" && "Token Price"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="cem-body">

          {/* TAB: Overview */}
          <div className={`cem-tab-panel${activeTab === "overview" ? " active" : ""}`}>
            <div className="cem-stats-grid">
              <div className="cem-stat">
                <span className="cem-stat-val">{cropDetail.landArea ?? "14.5 Acres"}</span>
                <span className="cem-stat-key">Land Area</span>
              </div>
              <div className="cem-stat">
                <span className="cem-stat-val">{cropDetail.estYield ?? "52 Q/Acre"}</span>
                <span className="cem-stat-key">Est. Yield</span>
              </div>
              <div className="cem-stat">
                <span className="cem-stat-val">{cropDetail.harvestIn ?? "38 days"}</span>
                <span className="cem-stat-key">Harvest In</span>
              </div>
              <div className="cem-stat">
                <span className="cem-stat-val">{cropDetail.fundingTarget ?? "₹8,40,000"}</span>
                <span className="cem-stat-key">Funding Target</span>
              </div>
              <div className="cem-stat">
                <span className="cem-stat-val highlight">{cropDetail.projectedReturn ?? "21.4%"}</span>
                <span className="cem-stat-key">Projected Return</span>
              </div>
              <div className="cem-stat">
                <span className="cem-stat-val">{cropDetail.tokenPrice ?? "₹500"}</span>
                <span className="cem-stat-key">Token Price</span>
              </div>
            </div>

            <div className="cem-funding-block">
              <div className="cem-funding-header">
                <span className="cem-funding-label">Funding Progress</span>
                <span className="cem-funding-pct">{cropDetail.fundingPct ?? "94"}%</span>
              </div>
              <div className="cem-funding-bar-bg">
                <div
                  className="cem-funding-bar-fill"
                  style={{ width: `${cropDetail.fundingPct ?? 94}%` }}
                ></div>
              </div>
              <div className="cem-funding-amounts">
                <span>{cropDetail.fundedAmt ?? "₹7,89,600 raised"}</span>
                <span>{cropDetail.remainingAmt ?? "₹50,400 remaining"}</span>
              </div>
            </div>

            <div className="cem-farmer-strip">
              <div className="cem-farmer-avatar">{cropDetail.farmerAvatar ?? "👨‍🌾"}</div>
              <div>
                <span className="cem-farmer-name">{cropDetail.farmerName ?? "Harpreet Singh"}</span>
                <span className="cem-farmer-loc">{cropDetail.farmerLoc ?? "Ludhiana, Punjab"}</span>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <span className="cem-farmer-badge">{cropDetail.farmerBadge ?? "3rd Season · Verified"}</span>
              </div>
            </div>
          </div>

          {/* TAB: Agronomist Notes */}
          <div className={`cem-tab-panel${activeTab === "agronomist" ? " active" : ""}`}>
            <div className="cem-agro-section">
              <div className="cem-agro-head">
                <div className="cem-agro-icon">🔬</div>
                <div>
                  <div className="cem-agro-title">{cropDetail.agroTitle ?? `Field Assessment — ${cropDetail.name}`}</div>
                  <div className="cem-agro-sub">{cropDetail.agroDate ?? "Reviewed by BSE Agronomist Team · April 2025"}</div>
                </div>
              </div>
              <div
                className="cem-agro-note"
                dangerouslySetInnerHTML={{ __html: cropDetail.agroNote ?? `This is an <strong>exceptionally well-managed plot</strong> in the Ludhiana belt — one of India's most productive wheat corridors. The HD-2967 variety shows <strong>strong resistance to yellow rust</strong>, which has been a concern this season across Punjab. Soil samples indicate optimal nitrogen levels, and the farmer's drip-irrigated system significantly reduces water risk. Yield projections of 52 quintals/acre are conservative; actual harvest could exceed 55–58 Q/acre based on current crop health.` }}
              />
              <div className="cem-agro-checklist">
                {(cropDetail.agroChecklist ?? [
                  { text: "Soil nitrogen levels verified — optimal range", warn: false },
                  { text: "Drip irrigation system operational & inspected", warn: false },
                  { text: "HD-2967 variety — rust-resistant, high-yield certified seed", warn: false },
                  { text: "Land ownership documents verified (Khatauni on file)", warn: false },
                  { text: "3 consecutive successful harvests — strong track record", warn: false },
                  { text: "Mild aphid pressure observed — preventive spray scheduled", warn: true },
                ]).map((item, i) => (
                  <div key={i} className="cem-agro-check">
                    <div className={`cem-agro-check-dot${item.warn ? " warn" : ""}`}></div>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TAB: Weather Risk */}
          <div className={`cem-tab-panel${activeTab === "weather" ? " active" : ""}`}>
            <div className="cem-weather-grid">
              {(cropDetail.weatherCards ?? [
                { icon: "🌡️", label: "Temperature Forecast", value: "22–28°C · Stable", fill: 25 },
                { icon: "🌧️", label: "Rainfall Probability", value: "Low · 18% chance", fill: 20 },
                { icon: "💨", label: "Wind / Storm Risk", value: "Minimal · Calm season", fill: 15 },
                { icon: "🌾", label: "Harvest Window Risk", value: "Low · 38-day buffer", fill: 22 },
              ]).map((card, i) => (
                <div key={i} className="cem-weather-card">
                  <span className="cem-wc-icon">{card.icon}</span>
                  <span className="cem-wc-label">{card.label}</span>
                  <span className="cem-wc-value">{card.value}</span>
                  <div className="cem-wc-risk-bar">
                    <div className="cem-wc-risk-fill risk-fill-low" style={{ width: `${card.fill}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="cem-risk-summary">
              <span className="cem-risk-sum-label">Overall Weather Risk Assessment</span>
              <p
                className="cem-risk-sum-text"
                dangerouslySetInnerHTML={{ __html: cropDetail.weatherSummary ?? `Punjab's Rabi season forecast for the harvest window (May–June) is historically stable with low monsoon interference. No extreme weather events are expected based on IMD long-range forecasts. The 38-day buffer before harvest provides ample contingency time. Risk is rated <strong>LOW</strong>.` }}
              />
            </div>
          </div>

          {/* TAB: Token Price */}
          <div className={`cem-tab-panel${activeTab === "chart" ? " active" : ""}`}>
            <div className="cem-chart-wrap">
              <div className="cem-chart-header">
                <div>
                  <div className="cem-chart-title">Token Price History · Since Listing</div>
                  <div style={{ marginTop: "0.3rem", display: "flex", alignItems: "baseline", gap: "0.6rem" }}>
                    <span className="cem-chart-price">{cropDetail.tokenPrice ?? "₹500"}</span>
                    <span className="cem-chart-change">{cropDetail.chartChange ?? "+₹12 (2.4%) since listing"}</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={cropDetail.priceHistory ?? MOCK_PRICE_DATA}>
                  <XAxis dataKey="date" tick={{ fill: "var(--straw-dim)", fontSize: 10 }} />
                  <YAxis domain={["auto", "auto"]} tick={{ fill: "var(--straw-dim)", fontSize: 10 }} width={45} />
                  <Tooltip
                    contentStyle={{ background: "#0c0904", border: "1px solid var(--glass-border)", color: "var(--grain)" }}
                    formatter={(val) => [`₹${val}`, "Price"]}
                  />
                  <Line type="linear" dataKey="price" stroke="var(--harvest)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="cem-token-meta">
              <div className="cem-tm-item">
                <span className="cem-tm-val">{cropDetail.tokenSymbol ?? "WHT-25"}</span>
                <span className="cem-tm-key">Symbol</span>
              </div>
              <div className="cem-tm-item">
                <span className="cem-tm-val">{cropDetail.totalSupply ?? "1,680"}</span>
                <span className="cem-tm-key">Total Supply</span>
              </div>
              <div className="cem-tm-item">
                <span className="cem-tm-val">{cropDetail.tokensSold ?? "1,579"}</span>
                <span className="cem-tm-key">Tokens Sold</span>
              </div>
              <div className="cem-tm-item">
                <span className="cem-tm-val">{cropDetail.tokensAvailable ?? "101"}</span>
                <span className="cem-tm-key">Available</span>
              </div>
            </div>
          </div>

        </div>{/* /cem-body */}

        {/* Footer */}
        <div className="cem-footer">
          <div className="cem-footer-left">🔒 Smart Contract Settlement · SEBI AgriToken Framework</div>
          <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
            <button className="cem-watchlist-btn" onClick={() => handleBookmark(cropDetail)}>
              {isWatchlisted ? "✓ Watchlisted" : "+ Watchlist"}
            </button>
            <button className="cem-invest-btn" onClick={() => handleInvest(cropDetail)}>
              Invest Now →
            </button>
          </div>
        </div>

      </div>{/* /cem-shell */}
    </div>
  );
}