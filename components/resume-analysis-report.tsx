interface AnalysisResult {
  overallScore: number;
  skillGaps: { skill: string; status: "strong" | "weak" | "missing" }[];
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

export function ResumeAnalysisReport({ analysis }: { analysis: AnalysisResult }) {
  const scoreColor =
    analysis.overallScore >= 80
      ? "text-green-600"
      : analysis.overallScore >= 60
      ? "text-yellow-600"
      : "text-red-600";

  const scoreRingColor =
    analysis.overallScore >= 80
      ? "#16a34a"
      : analysis.overallScore >= 60
      ? "#ca8a04"
      : "#dc2626";

  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference - (analysis.overallScore / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <div className="bg-pure-white rounded-3xl shadow-card p-8 text-center">
        <h3 className="text-subheading font-medium text-ink mb-6">Overall Fit Score</h3>
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#f7f7f8"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={scoreRingColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-heading font-display ${scoreColor}`}>
              {analysis.overallScore}
            </span>
          </div>
        </div>
        <p className="text-caption text-graphite">out of 100</p>
      </div>

      {/* Skill Matrix */}
      {analysis.skillGaps.length > 0 && (
        <div className="bg-pure-white rounded-3xl shadow-card p-6">
          <h3 className="text-body-lg font-medium text-ink mb-4">Skill Matrix</h3>
          <div className="space-y-2">
            {analysis.skillGaps.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-fog last:border-0">
                <span className="text-body text-ink">{item.skill}</span>
                <span
                  className={`rounded-full px-3 py-1 text-caption font-medium ${
                    item.status === "strong"
                      ? "bg-green-50 text-green-700"
                      : item.status === "weak"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {item.status === "strong" ? "Strong" : item.status === "weak" ? "Weak" : "Missing"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div className="bg-pure-white rounded-3xl shadow-card p-6">
          <h3 className="text-body-lg font-medium text-ink mb-4">Strengths</h3>
          <ul className="space-y-2">
            {analysis.strengths.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-body text-ash">
                <span className="text-green-600 mt-1">&#10003;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {analysis.improvements.length > 0 && (
        <div className="bg-pure-white rounded-3xl shadow-card p-6">
          <h3 className="text-body-lg font-medium text-ink mb-4">Areas for Improvement</h3>
          <ul className="space-y-2">
            {analysis.improvements.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-body text-ash">
                <span className="text-yellow-600 mt-1">&#9888;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-sky-wash rounded-3xl p-6">
          <h3 className="text-body-lg font-medium text-ink mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {analysis.recommendations.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-body text-ash">
                <span className="text-rust mt-1">&#10148;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
