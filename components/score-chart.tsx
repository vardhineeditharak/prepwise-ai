"use client";

interface Session {
  id: string;
  role: string;
  analysis: { overallScore: number } | null;
  created_at: string;
}

export default function ScoreChart({ sessions }: { sessions: Session[] }) {
  const scored = sessions
    .filter((s): s is Session & { analysis: { overallScore: number } } =>
      s.analysis !== null && typeof s.analysis.overallScore === "number"
    )
    .slice(0, 10)
    .reverse();

  if (scored.length < 2) {
    return (
      <div className="rounded-3xl bg-pure-white shadow-card p-6">
        <h3 className="text-body-lg font-medium text-ink mb-4">Score Trend</h3>
        <div className="h-48 flex items-center justify-center">
          <p className="text-caption text-graphite">
            Complete at least 2 practice sessions to see your trend.
          </p>
        </div>
      </div>
    );
  }

  const scores = scored.map((s) => s.analysis.overallScore);
  const max = Math.max(...scores, 100);
  const min = Math.max(Math.min(...scores) - 10, 0);
  const range = max - min || 1;
  const W = 400;
  const H = 160;
  const pad = { top: 10, bottom: 24, left: 30, right: 10 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const xScale = (i: number) => pad.left + (i / Math.max(scored.length - 1, 1)) * chartW;
  const yScale = (v: number) => pad.top + chartH - ((v - min) / range) * chartH;

  const points = scores.map((s, i) => `${xScale(i)},${yScale(s)}`).join(" ");
  const gradientId = "score-gradient";

  const areaPoints = `${xScale(0)},${yScale(min)} ${points} ${xScale(scored.length - 1)},${yScale(min)}`;

  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  return (
    <div className="rounded-3xl bg-pure-white shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-body-lg font-medium text-ink">Score Trend</h3>
        <div className="flex items-center gap-3">
          <span className="text-caption text-graphite">
            Avg: <strong className="text-ink">{avg}</strong>
          </span>
          <span className="text-caption text-graphite">
            Latest: <strong className="text-ink">{scores[scores.length - 1]}</strong>
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5d2a1a" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#5d2a1a" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {scores.map((s, i) => (
          <circle
            key={i}
            cx={xScale(i)}
            cy={yScale(s)}
            r="4"
            fill="#5d2a1a"
            className="transition-all duration-500"
          >
            <title>{s} — {scored[i].role}</title>
          </circle>
        ))}

        <polygon points={areaPoints} fill={`url(#${gradientId})`} />
        <polyline points={points} fill="none" stroke="#5d2a1a" strokeWidth="2" strokeLinejoin="round" />

        {/* Y-axis labels */}
        {[min, min + range / 2, max].map((v) => (
          <text
            key={v}
            x={pad.left - 8}
            y={yScale(v) + 4}
            textAnchor="end"
            className="text-[9px] fill-graphite"
          >
            {Math.round(v)}
          </text>
        ))}

        {/* X-axis labels (first, middle, last) */}
        {[0, Math.floor((scored.length - 1) / 2), scored.length - 1].map((i) => (
          <text
            key={i}
            x={xScale(i)}
            y={H - 4}
            textAnchor="middle"
            className="text-[9px] fill-graphite"
          >
            {new Date(scored[i].created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </text>
        ))}
      </svg>
    </div>
  );
}
