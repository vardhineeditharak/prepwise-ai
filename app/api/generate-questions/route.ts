import { NextResponse } from "next/server";
import { searchSimilar } from "@/lib/ibm/knowledge-store";

export async function POST(request: Request) {
  const { role, experienceLevel, resumeText } = await request.json();

  const apiKey = process.env.IBM_API_KEY;
  const projectId = process.env.IBM_PROJECT_ID;
  const url = process.env.IBM_URL || "https://us-south.ml.cloud.ibm.com";

  let ragContext = "";
  try {
    const similar = await searchSimilar(`interview questions for ${role} ${experienceLevel}`, { limit: 3 });
    if (similar.length > 0) {
      ragContext = `\nReference patterns from successful interview preparation:\n${similar
        .map((s) => `- ${s.content.substring(0, 300)}`)
        .join("\n")}`;
    }
  } catch (err) {
    console.warn("RAG retrieval failed (non-critical):", err);
  }

  const systemPrompt = `You are an expert interview coach. Generate interview questions and model answers tailored to the candidate's profile. Return JSON array.`;

  const userPrompt = `Generate 10 interview questions for a ${experienceLevel} level ${role} position.
${resumeText ? `Resume context: ${resumeText}` : ""}
${ragContext}
Return a JSON array of objects with "question", "answer", and "category" fields. Category must be one of: Technical, Behavioral, Situational.`;

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
          temperature: 0.7,
          max_tokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`IBM API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(getFallbackQuestions(role));
    }

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error("AI generation failed, using fallback:", error);
    return NextResponse.json(getFallbackQuestions(role));
  }
}

function getFallbackQuestions(role: string) {
  return [
    {
      question: `Tell me about your experience with ${role} responsibilities.`,
      answer: `Provide a structured response covering your key achievements, tools used, and impact made in ${role} roles.`,
      category: "Behavioral",
    },
    {
      question: `What technical skills do you consider most important for a ${role}?`,
      answer: `Discuss the core technical competencies, frameworks, and methodologies relevant to ${role}.`,
      category: "Technical",
    },
    {
      question: `Describe a challenging project you worked on and how you handled it.`,
      answer: `Use the STAR method: Situation, Task, Action, Result. Focus on problem-solving and outcomes.`,
      category: "Behavioral",
    },
    {
      question: `How do you handle disagreements with team members?`,
      answer: `Emphasize communication, empathy, finding common ground, and focusing on project goals over personal preferences.`,
      category: "Situational",
    },
    {
      question: `What is your approach to learning new technologies?`,
      answer: `Discuss hands-on projects, documentation, community resources, and applying learning to real problems.`,
      category: "Behavioral",
    },
    {
      question: `Where do you see yourself in 5 years?`,
      answer: `Align your growth trajectory with the company's path, showing ambition while staying realistic.`,
      category: "Situational",
    },
    {
      question: `How do you prioritize tasks when working on multiple projects?`,
      answer: `Discuss prioritization frameworks, communication with stakeholders, and maintaining quality under pressure.`,
      category: "Situational",
    },
    {
      question: `What is your experience with agile methodologies?`,
      answer: `Discuss sprints, standups, retrospectives, and how agile improved your team's delivery.`,
      category: "Technical",
    },
    {
      question: `Describe a time you had to explain a complex concept to someone.`,
      answer: `Show ability to simplify, use analogies, check understanding, and adapt communication style.`,
      category: "Behavioral",
    },
    {
      question: `What interests you about this ${role} position?`,
      answer: `Connect your skills and passions to the role's requirements and the company's mission.`,
      category: "Situational",
    },
  ];
}
