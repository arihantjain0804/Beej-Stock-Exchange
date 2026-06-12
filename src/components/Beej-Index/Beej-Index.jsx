import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis
} from 'recharts';

import { BSI_CONSTITUENTS } from '../../data/tokens';

export default function BeejIndex() {
  const [modalOpen, setModalOpen] = useState(false);
  const [timeframe, setTimeframe] = useState('1D');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(t);
  }, []);

  const indexVal = 1247.35;
  const indexChg = 14.22;
  const indexPct = 1.15;

  const sectors = [
    { name: 'Grains', pct: 32, color: '#C8860A' },
    { name: 'Oilseeds', pct: 24, color: '#8F6A25' },
    { name: 'Cash Crops', pct: 18, color: '#5E7B3D' },
    { name: 'Spices', pct: 14, color: '#B86A28' },
    { name: 'Others', pct: 12, color: '#4B5D6E' },
  ];

  const chartData = {
    '1D': [
      { label: '9AM', value: 10 },
      { label: '11AM', value: 12318 },
      { label: '1PM', value: 13225 },
      { label: '3PM', value: 1247 },
    ],

    '1W': [
      { label: 'Mon', value: 1185 },
      { label: 'Tue', value: 1198 },
      { label: 'Wed', value: 1212 },
      { label: 'Thu', value: 1230 },
      { label: 'Fri', value: 1247 },
    ],

    '1M': [
      { label: 'W1', value: 1120 },
      { label: 'W2', value: 1160 },
      { label: 'W3', value: 1200 },
      { label: 'W4', value: 1247 },
    ],

    '3M': [
      { label: 'Jan', value: 980 },
      { label: 'Feb', value: 1110 },
      { label: 'Mar', value: 1247 },
    ],

    '1Y': [
      { label: 'Q1', value: 820 },
      { label: 'Q2', value: 960 },
      { label: 'Q3', value: 1080 },
      { label: 'Q4', value: 1247 },
    ],
  };

  return (
    <>
      <section id="bse-index">
        <div className="bsi-inner">

          <div className="bsi-hero reveal">

            <div className="bsi-hero-left">

              <div className="bsi-eyebrow">
                BSE Aggregate Index · बीज-50
              </div>

              <h2 className="bsi-title">
                BEEJ-50 <em>Index</em>
              </h2>

              <p className="bsi-subtitle">
                INDIA'S FIRST AGRICULTURAL TOKEN MARKET INDEX
              </p>

              <div className="bsi-main-val-wrap">

                <div className="bsi-main-val">
                  {indexVal.toLocaleString()}
                </div>

                <div className="bsi-change-wrap">
                  <span className="bsi-change up">
                    ▲ {indexChg} (+{indexPct}%)
                  </span>

                  <span className="bsi-change-label">
                    TODAY
                  </span>
                </div>

              </div>

              <div className="bsi-meta-row">

                <div className="bsi-meta-stat">
                  <span className="bsi-meta-label">Volume</span>
                  <span className="bsi-meta-val">₹2.4Cr</span>
                </div>

                <div className="bsi-meta-stat">
                  <span className="bsi-meta-label">Market Cap</span>
                  <span className="bsi-meta-val">₹18.7Cr</span>
                </div>

                <div className="bsi-meta-stat">
                  <span className="bsi-meta-label">Constituents</span>
                  <span className="bsi-meta-val">8</span>
                </div>

              </div>

            </div>

            <div className="bsi-hero-right">
              <button
                className="projects-view-all"
                onClick={() => setModalOpen(true)}
              >
                Expand Index →
              </button>
            </div>

          </div>

          <div className="bsi-constituents">

            {BSI_CONSTITUENTS.map(c => (
              <div key={c.symbol} className="bsi-constituent">

                <div className="bsi-c-top">
                  <span className="bsi-c-symbol">{c.symbol}</span>
                  <span className="bsi-c-weight">{c.weight}</span>
                </div>

                <div className="bsi-c-name">{c.name}</div>
                <div className="bsi-c-region">{c.region}</div>

                <div className="bsi-c-bottom">
                  <span className="bsi-c-price">{c.price}</span>

                  <span className={`bsi-c-change ${c.changeDir}`}>
                    {c.change}
                  </span>
                </div>

                <div
                  className="bsi-c-bar"
                  style={{
                    width: loaded ? `${c.barW * 5}px` : 0
                  }}
                />

              </div>
            ))}

          </div>

          <div className="bsi-bottom">

            <div className="bsi-ring-wrap">

              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={sectors}
                    dataKey="pct"
                    innerRadius={45}
                    outerRadius={75}
                  >
                    {sectors.map((s, i) => (
                      <Cell key={i} fill={s.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="bsi-ring-center">
                <span className="bsi-ring-center-val">
                  100%
                </span>

                <span className="bsi-ring-center-label">
                  Allocation
                </span>
              </div>

            </div>

            <div className="bsi-sector-legend">

              {sectors.map(sec => (
                <div key={sec.name} className="bsi-legend-row">

                  <span
                    className="bsi-legend-dot"
                    style={{ background: sec.color }}
                  />

                  <div className="bsi-legend-info">
                    <span className="bsi-legend-name">
                      {sec.name}
                    </span>

                    <span className="bsi-legend-pct">
                      {sec.pct}%
                    </span>
                  </div>

                </div>
              ))}

            </div>

          </div>

        </div>
      </section>

      <div
        id="bsi-modal-backdrop"
        className={modalOpen ? 'open' : ''}
      >
        <div className="bsi-modal-topbar">

          <div className="bsi-modal-brand">
            <span className="bsi-modal-eyebrow">BEEJ-50</span>
            <span className="bsi-modal-title">
              Expanded Market View
            </span>
          </div>

          <div className="bsi-modal-live">
            <span className="bsi-modal-val">{indexVal}</span>
            <span className="bsi-modal-chg up">
              +{indexPct}%
            </span>
          </div>

          <button
            className="bsi-modal-close"
            onClick={() => setModalOpen(false)}
          >
            ✕
          </button>

        </div>

        <div className="bsi-modal-body">

          <div className="bsi-modal-chart-wrap">

            <div className="bsi-modal-chart-controls">

              <div className="bsi-modal-stats">
                <div className="bsi-modal-stat">
                  <span className="bsi-modal-stat-label">High</span>
                  <span className="bsi-modal-stat-val">1256</span>
                </div>

                <div className="bsi-modal-stat">
                  <span className="bsi-modal-stat-label">Low</span>
                  <span className="bsi-modal-stat-val">1187</span>
                </div>
              </div>

              <div className="bsi-modal-tf-tabs">

                {['1D', '1W', '1M', '3M', '1Y'].map(tf => (
                  <button
                    key={tf}
                    className={`bsi-modal-tf-tab ${
                      timeframe === tf ? 'active' : ''
                    }`}
                    onClick={() => setTimeframe(tf)}
                  >
                    {tf}
                  </button>
                ))}

              </div>

            </div>

            <div style={{ flex: 1, minHeight: 500 }}>
              <ResponsiveContainer width="100%" height="100%">

                <AreaChart data={chartData[timeframe]}>

                  <defs>
                    <linearGradient id="beejFill">
                      <stop offset="5%" stopColor="#C8860A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C8860A" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="rgba(255,255,255,0.06)" />

                  <XAxis dataKey="label" />
                  <YAxis />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#C8860A"
                    fill="url(#beejFill)"
                    strokeWidth={2}
                    animationDuration={500}
                  />

                </AreaChart>

              </ResponsiveContainer>
            </div>

          </div>

          <div className="bsi-modal-breakdown">
            <div className="bsi-modal-breakdown-header">
              <span className="bsi-modal-breakdown-title">
                Constituents
              </span>
            </div>

            <div className="bsi-modal-breakdown-list">

              {BSI_CONSTITUENTS.map((c, i) => (
                <div key={c.symbol} className="bsi-bd-row">

                  <span className="bsi-bd-rank">
                    {i + 1}
                  </span>

                  <div className="bsi-bd-info">
                    <div className="bsi-bd-symbol">
                      {c.symbol}
                    </div>

                    <div className="bsi-bd-name">
                      {c.name}
                    </div>
                  </div>

                  <div className="bsi-bd-right">
                    <span className="bsi-bd-price">
                      {c.price}
                    </span>

                    <span className={`bsi-bd-chg ${c.changeDir}`}>
                      {c.change}
                    </span>
                  </div>

                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </>
  );
}