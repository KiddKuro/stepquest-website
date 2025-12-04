// src/pages/Insights.jsx
import { useMemo } from "react";
import { useQuest } from "../context/QuestContext";

const MONTH_LABELS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

// Helper to generate a distribution over 12 bars
const BASE_WEIGHTS = [0.9, 1.1, 1.0, 1.3, 1.6, 1.2, 0.8, 0.9, 1.0, 1.4, 1.3, 1.1];

export default function Insights() {
  const { totalSteps } = useQuest();

  // Derive some fake-but-consistent yearly stats from totalSteps
  const {
    yearlyTotal,
    monthlySteps,
    bestMonthIndex,
    bestMonthSteps,
    avgSteps,
    linePoints,
  } = useMemo(() => {
    const yearlyTotal = totalSteps;

    if (yearlyTotal <= 0) {
      return {
        yearlyTotal: 0,
        monthlySteps: new Array(12).fill(0),
        bestMonthIndex: 0,
        bestMonthSteps: 0,
        avgSteps: 0,
        linePoints: "",
      };
    }

    const weightSum = BASE_WEIGHTS.reduce((a, b) => a + b, 0);
    const monthlyStepsRaw = BASE_WEIGHTS.map(
      (w) => (yearlyTotal * w) / weightSum
    );

    const monthlySteps = monthlyStepsRaw.map((v) => Math.round(v));

    const bestMonthSteps = Math.max(...monthlySteps);
    const bestMonthIndex = monthlySteps.indexOf(bestMonthSteps);
    const avgSteps = Math.round(yearlyTotal / 12);

    const maxForChart = bestMonthSteps || 1;
    const linePoints = monthlySteps
      .map((value, idx) => {
        const x =
          (idx / (monthlySteps.length - 1 || 1)) * 100; // 0–100 across
        const y = 100 - (value / maxForChart) * 100; // invert for SVG
        return `${x},${y}`;
      })
      .join(" ");

    return {
      yearlyTotal,
      monthlySteps,
      bestMonthIndex,
      bestMonthSteps,
      avgSteps,
      linePoints,
    };
  }, [totalSteps]);

  const yearLabel = new Date().getFullYear();

  return (
    <div className="page">
      <h1 className="page-title">Insights</h1>

      <div className="insights-shell">
        {/* Header row: "Best Year" + Steps pill */}
        <div className="insights-header">
          <div>
            <p className="insights-label">Best Year</p>
            <p className="insights-year">{yearLabel}</p>
            <p className="insights-total">
              {yearlyTotal.toLocaleString()}{" "}
              <span className="insights-total-unit">steps</span>
            </p>
          </div>

          <button className="insights-mode-pill">Steps ▾</button>
        </div>

        {/* Tabs row */}
        <div className="insights-tabs">
          <button className="insights-tab">Day</button>
          <button className="insights-tab">Week</button>
          <button className="insights-tab insights-tab-active">Month</button>
          <button className="insights-tab">Year</button>
        </div>

        {/* Chart */}
        <div className="insights-chart-wrapper">
          {/* Target & average labels */}
          <div className="insights-chart-bg">
            <div className="insights-line insights-line-top" />
            <div className="insights-line insights-line-mid" />

            <span className="insights-line-label insights-line-label-top">
              {bestMonthSteps.toLocaleString()}
            </span>
            <span className="insights-line-label insights-line-label-mid">
              AVG {avgSteps.toLocaleString()}
            </span>
          </div>

          {/* SVG line graph */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="insights-line-chart"
          >
            {yearlyTotal > 0 && (
              <>
                <polyline
                  points={linePoints}
                  className="insights-line-path"
                />
                {monthlySteps.map((value, idx) => {
                  const maxForChart = bestMonthSteps || 1;
                  const x =
                    (idx / (monthlySteps.length - 1 || 1)) * 100;
                  const y = 100 - (value / maxForChart) * 100;

                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r={1.8}
                      className={
                        "insights-dot" +
                        (idx === bestMonthIndex ? " insights-dot-best" : "")
                      }
                    />
                  );
                })}
              </>
            )}
          </svg>

          {/* Month labels under chart */}
          <div className="insights-month-row">
            {MONTH_LABELS.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        {/* Summary text */}
        <p className="insights-summary">
          {yearlyTotal > 0 ? (
            <>
              You walked{" "}
              <span className="insights-highlight">
                {yearlyTotal.toLocaleString()}
              </span>{" "}
              steps in {yearLabel}. That’s an impressive record.
            </>
          ) : (
            <>Start walking to unlock your yearly insights.</>
          )}
        </p>
      </div>
    </div>
  );
}
