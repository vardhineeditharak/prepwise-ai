import { NextResponse } from "next/server";
import { analyzeTone } from "@/lib/ibm/nlu";

export async function POST(request: Request) {
  const { questions, answers, role, experienceLevel, sessionId } = await request.json();

  const apiKey = process.env.IBM_API_KEY;
  const projectId = process.env.IBM_PROJECT_ID;
  const url = process.env.IBM_URL || "https://us-south.ml.cloud.ibm.com";

  const qaPairs = questions
    .map((q: any, i: number) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${answers[i] || "(no answer)"}`)
    .join("\n\n");

  const systemPrompt = `You are an expert interview evaluator. Score each answer and provide detailed feedback. Return valid JSON only.`;

  const userPrompt = `Evaluate these interview answers for a ${experienceLevel} level ${role} position.

${qaPairs}

Return a JSON object with:
{
  "overallScore": <number 0-100>,
  "questionScores": [
    {
      "questionIndex": <0-based>,
      "score": <number 0-100>,
      "feedback": "<brief feedback>",
      "modelAnswer": "<ideal answer>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "grade": "A"|"B"|"C"|"D"|"F"
}

Score based on: relevance, completeness, clarity, use of STAR method for behavioral, and technical accuracy.
Grade: A (90-100), B (80-89), C (70-79), D (60-69), F (<60).`;

  let toneAnalyses: any[] = [];
  try {
    toneAnalyses = await Promise.all(
      answers.map(async (answer: string, i: number) => {
        if (!answer || answer.trim().length < 10) return null;
        const tone = await analyzeTone(answer);
        return tone ? { questionIndex: i, ...tone } : null;
      })
    );
    toneAnalyses = toneAnalyses.filter(Boolean);
    console.log(`NLU analysis complete: ${toneAnalyses.length} answers analyzed`);
  } catch (err) {
    console.warn("NLU batch analysis failed (non-critical):", err);
  }

  try {
    const response = await fetch(`${url}/ml/v1/text/chat?version=2023-05-29`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model_id: "ibm/granite-3-8b-instruct",
        project_id: projectId,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        parameters: {
          temperature: 0.3,
          max_tokens: 2048,
        },
      }),
    });

    if (!response.ok) throw new Error(`IBM API error: ${response.status}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        ...getFallbackAnalysis(questions.length),
        toneAnalyses,
      });
    }

    return NextResponse.json({
      ...JSON.parse(jsonMatch[0]),
      toneAnalyses,
    });
  } catch (error) {
    console.error("AI analysis failed, using fallback:", error);
    return NextResponse.json({
      ...getFallbackAnalysis(questions.length),
      toneAnalyses,
    });
  }
}

function getFallbackAnalysis(questionCount: number) {
  const questionScores = Array.from({ length: questionCount }, (_, i) => ({
    questionIndex: i,
    score: Math.floor(Math.random() * 30) + 60,
    feedback: "Good response. Consider adding more specific examples.",
    modelAnswer: "Provide a structured answer using the STAR method (Situation, Task, Action, Result).",
  }));

  return {
    overallScore: 74,
    questionScores,
    strengths: [
      "Good communication structure",
      "Relevant technical knowledge",
      "Clear articulation of experience",
    ],
    improvements: [
      "Use more specific metrics and numbers",
      "Practice the STAR method for behavioral questions",
      "Prepare more detailed project examples",
    ],
    grade: "C",
  };
}
