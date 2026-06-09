import { useState, useEffect, useRef } from 'react';
import { BSI_CONSTITUENTS } from '../../data/tokens';

// ─── BEEJ-50 Index Section ────────────────────────────────────────────────────
// Displays the aggregate crop market index with a sparkline chart
// and a grid of all 8 index constituents.

export default function BeejIndex() {
  const [indexVal] = useState(1247.35);
  const [indexChg] = useState(+14.22);
  const [indexPct] = useState(+1.15);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Generate a random-walk price history for the sparkline
    const pts = [];
    let v = 1180;
    for (let i = 0; i < 50; i++) {
      v += (Math.random() - 0.46) * 12;
      pts.push(v);
    }

    const min = Math.min(...pts);
    const max = Math.max(...pts);
    const range = max - min;
    const coords = pts.map((p, i) => ({
      x: (i / (pts.length - 1)) * W,
      y: H - 4 - ((p - min) / range) * (H - 8),
    }));

    // Gradient fill under the line
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(200,134,10,0.25)');
    grad.addColorStop(1, 'rgba(200,134,10,0)');
    ctx.beginPath();
    ctx.moveTo(coords[0].x, H);
    coords.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(coords[coords.length - 1].x, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line stroke
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    coords.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = '#C8860A';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }, []);

  return (
    <section id="bse-index">
      <div className="section-inner">

        <div style={{ marginBottom: '2.5rem' }} className="reveal">
          <div className="bsi-eyebrow">BSE Aggregate Index · बीज-50</div>
          <div className="bsi-title">BEEJ-50 Index</div>
        </div>

        <div className="bsi-hero reveal">
          <div>
            <div className="bsi-main-val">{indexVal.toLocaleString()}</div>
            <div className={`bsi-change ${indexChg >= 0 ? 'up' : 'down'}`}>
              {indexChg >= 0 ? '▲' : '▼'} {Math.abs(indexChg)} ({indexChg >= 0 ? '+' : ''}{indexPct}%) Today
            </div>
            <div className="bsi-meta">
              {[['Volume', '₹2.4Cr'], ['Market Cap', '₹18.7Cr'], ['Constituents', '8']].map(([l, v]) => (
                <div key={l} className="bsi-meta-stat">
                  <span className="bsi-meta-label">{l}</span>
                  <span className="bsi-meta-val">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <canvas
            ref={canvasRef}
            width={380}
            height={130}
            style={{ display: 'block', cursor: 'pointer' }}
          />
        </div>

        <div
          style={{ marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          className="reveal"
        >
          <span style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: '0.56rem', letterSpacing: '0.3em',
            textTransform: 'uppercase', color: 'var(--straw-dim)', opacity: 0.45,
          }}>
            Index Constituents
          </span>
        </div>

        <div className="bsi-constituents reveal reveal-d1">
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
                <span className={`bsi-c-change ${c.changeDir}`}>{c.change}</span>
              </div>
              <div className="bsi-c-bar" style={{ width: `${c.barW * 5}px` }}></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}