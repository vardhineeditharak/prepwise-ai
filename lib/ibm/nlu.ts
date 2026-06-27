export interface ToneAnalysis {
  sentiment: {
    score: number;
    label: "positive" | "negative" | "neutral";
  };
  emotion: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
  };
  keywords: Array<{ text: string; relevance: number }>;
}

export async function analyzeTone(text: string): Promise<ToneAnalysis | null> {
  const apiKey = process.env.IBM_NLU_API_KEY;
  const url = process.env.IBM_NLU_URL || "https://api.us-south.natural-language-understanding.watson.cloud.ibm.com";

  if (!apiKey) return null;

  try {
    const res = await fetch(`${url}/v1/analyze?version=2021-08-01`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`apikey:${apiKey}`).toString("base64"),
      },
      body: JSON.stringify({
        text: text.slice(0, 5000),
        features: {
          sentiment: {},
          emotion: {},
          keywords: { limit: 5 },
        },
      }),
    });

    if (!res.ok) {
      console.warn(`NLU API error: ${res.status}`);
      return null;
    }

    const data = await res.json();

    return {
      sentiment: {
        score: data.sentiment?.document?.score ?? 0,
        label: data.sentiment?.document?.label ?? "neutral",
      },
      emotion: {
        joy: data.emotion?.document?.emotion?.joy ?? 0,
        sadness: data.emotion?.document?.emotion?.sadness ?? 0,
        anger: data.emotion?.document?.emotion?.anger ?? 0,
        fear: data.emotion?.document?.emotion?.fear ?? 0,
      },
      keywords: (data.keywords || []).map((k: any) => ({
        text: k.text,
        relevance: k.relevance,
      })),
    };
  } catch (err) {
    console.error("NLU analysis failed:", err);
    return null;
  }
}
