"use client";

interface ToneData {
  sentiment: { score: number; label: "positive" | "negative" | "neutral" };
  emotion: { joy: number; sadness: number; anger: number; fear: number };
  keywords: Array<{ text: string; relevance: number }>;
}

interface Props {
  tone: ToneData;
  questionLabel: string;
}

export default function InterviewToneCard({ tone, questionLabel }: Props) {
  const sentimentColor =
    tone.sentiment.label === "positive"
      ? "text-green-600"
      : tone.sentiment.label === "negative"
      ? "text-red-600"
      : "text-yellow-600";

  const sentimentBg =
    tone.sentiment.label === "positive"
      ? "bg-green-50"
      : tone.sentiment.label === "negative"
      ? "bg-red-50"
      : "bg-yellow-50";

  const topEmotion = Object.entries(tone.emotion)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2);

  const emotionColors: Record<string, string> = {
    joy: "#16a34a",
    sadness: "#6366f1",
    anger: "#dc2626",
    fear: "#d97706",
  };

  return (
    <div className="rounded-2xl border border-dove/20 bg-pure-white p-5 mt-3">
      <p className="text-caption font-medium text-graphite mb-3">
        Answer Tone Analysis — {questionLabel}
      </p>

      <div className="flex flex-wrap gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-caption text-ash">Sentiment:</span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-caption font-medium ${sentimentBg} ${sentimentColor}`}>
            {tone.sentiment.label === "positive" ? "😊" : tone.sentiment.label === "negative" ? "😟" : "😐"}
            {tone.sentiment.label} ({(tone.sentiment.score * 100).toFixed(0)}%)
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-3">
        {topEmotion.map(([name, score]) => (
          <div key={name} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: emotionColors[name] || "#a3a6af" }}
            />
            <span className="text-caption text-ash capitalize">
              {name}: {(score * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      {tone.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tone.keywords.map((kw, i) => (
            <span
              key={i}
              className="rounded-full bg-fog px-2.5 py-0.5 text-caption text-graphite"
              title={`Relevance: ${(kw.relevance * 100).toFixed(0)}%`}
            >
              {kw.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
