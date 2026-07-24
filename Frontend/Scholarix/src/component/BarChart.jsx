import React, { useState } from "react";
import "./BarChart.css";

/**
 * A small categorical/sequential bar chart, hand-rolled in HTML/CSS.
 *
 * data: [{ label, value, color }]
 * - Pass a different `color` per item for a categorical chart (e.g. status
 *   breakdown), or the same color on every item for a sequential one (e.g.
 *   a monthly trend or a ranked list).
 */
export default function BarChart({ data, formatValue = (v) => v.toLocaleString(), emptyMessage = "No data yet.", height = 180 }) {
  const [hovered, setHovered] = useState(null);

  const max = Math.max(...data.map((d) => d.value), 0);

  if (data.length === 0 || max === 0) {
    return (
      <div className="bc-empty" style={{ height }}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bc-root" style={{ height }}>
      <div className="bc-gridlines" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bc-gridline" />
        ))}
      </div>

      <div className="bc-bars" role="img" aria-label={data.map((d) => `${d.label}: ${formatValue(d.value)}`).join(", ")}>
        {data.map((d, i) => {
          const pct = Math.max((d.value / max) * 100, d.value > 0 ? 3 : 0);
          const isHovered = hovered === i;
          const isDimmed = hovered !== null && !isHovered;

          return (
            <div
              key={i}
              className="bc-col"
              tabIndex={0}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
            >
              {isHovered && (
                <div className="bc-tooltip">
                  <strong>{formatValue(d.value)}</strong>
                  <span>{d.label}</span>
                </div>
              )}
              <span className="bc-value">{formatValue(d.value)}</span>
              <div className="bc-track">
                <div
                  className="bc-bar"
                  style={{
                    height: `${pct}%`,
                    background: d.color,
                    opacity: isDimmed ? 0.45 : 1,
                  }}
                />
              </div>
              <span className="bc-label">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
