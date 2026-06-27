import { NextResponse } from "next/server";
import { searchSimilar } from "@/lib/ibm/knowledge-store";

export async function POST(request: Request) {
  const { messages, resumeContext, role } = await request.json();
  const lastMessage = messages?.[messages.length - 1]?.content || "";

  const apiKey = process.env.IBM_API_KEY;
  const projectId = process.env.IBM_PROJECT_ID;
  const url = process.env.IBM_URL || "https://us-south.ml.cloud.ibm.com";

  let ragContext = "";
  try {
    const similar = await searchSimilar(lastMessage, { limit: 3 });
    if (similar.length > 0) {
      ragContext = `\n\nRelevant knowledge for context:\n${similar
        .map((s) => `- ${s.content}`)
        .join("\n")}`;
    }
  } catch (err) {
    console.warn("RAG retrieval failed (non-critical):", err);
  }

  const systemPrompt = `You are PrepWise AI Coach — an expert interview coach and career advisor. You help users prepare for job interviews by:

1. Explaining different question types (behavioral, technical, situational)
2. Teaching answering frameworks like STAR (Situation, Task, Action, Result)
3. Providing sample answers and critiques
4. Giving tips on body language, tone, and confidence
5. Helping practice specific questions based on their target role
6. Reviewing their answers and suggesting improvements

Be encouraging, specific, and actionable. Keep responses concise but helpful.
${role ? `The user is preparing for a "${role}" position.` : ""}
${resumeContext ? `Their resume background: ${resumeContext.substring(0, 500)}` : ""}
${ragContext}

You can use markdown formatting for clarity.`;

  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    })),
  ];

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
        messages: apiMessages,
        parameters: {
          temperature: 0.7,
          max_tokens: 1024,
        },
      }),
    });

    if (!response.ok) throw new Error(`IBM API error: ${response.status}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I'm here to help with your interview preparation. What would you like to practice?";

    return NextResponse.json({ content });
  } catch (error) {
    console.error("AI chat failed:", error);
    return NextResponse.json({
      content: getFallbackResponse(messages[messages.length - 1]?.content || ""),
    });
  }
}

function getFallbackResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes("behavioral") || lower.includes("star")) {
    return `### Mastering Behavioral Questions (STAR Method)

Behavioral questions focus on your past behavior to predict future performance. You should always structure your response using the **STAR** method:

*   **Situation:** Describe the context or situation you were in.
*   **Task:** Explain the challenge or responsibility you had.
*   **Action:** Detail the *exact* steps you took to address the challenge.
*   **Result:** Quantify the final outcome or business impact.

> **Example Case:** "Tell me about a time you solved a difficult problem"
> *   **Situation:** Our checkout page had a 45% abandonment rate.
> *   **Task:** I was assigned to research and redesign the checkout experience.
> *   **Action:** I analyzed user sessions, removed three unnecessary form inputs, and optimized the layout.
> *   **Result:** Redesigned flow reduced abandonment to 18%, boosting sales by 22%.

What behavioral question would you like to mock-practice right now?`;
  }

  if (lower.includes("weakness") || lower.includes("weak")) {
    return `### Answering "What is your greatest weakness?"

The key is to show **self-awareness**, **authenticity**, and **active improvement**. Do not use "humble-brags" like "I work too hard."

1.  **Choose a real, non-critical weakness:** Pick something that doesn't disqualify you from the job core duties.
2.  **Explain the impact:** Briefly state how it affects your work.
3.  **Show active steps of improvement:** Describe the tools, courses, or habits you've built to fix it.

*   **Example Answer:**
    > "Earlier in my career, I sometimes took on too many tasks myself to ensure things were perfect, which occasionally caused bottlenecks. I've since learned to delegate more effectively, trust my team, and use project boards like Trello to distribute workloads transparently."

Try writing your weakness response, and I'll give you feedback!`;
  }

  if (lower.includes("strength") || lower.includes("strong")) {
    return `### Answering "What are your greatest strengths?"

Avoid generic labels like "hard worker" or "good team player." Instead, focus on **competencies** supported by **proof**.

1.  **Select 1-2 core strengths:** Choose skills directly aligned with the job description.
2.  **Back it up with a story:** Share a quick win where this strength made a difference.
3.  **Connect to the target role:** Show how this strength will benefit *their* team.

*   **Example Answer:**
    > "My greatest strength is database optimization. In my previous role, our application dashboard was loading very slowly. I analyzed the query logs, implemented compound indexes, and refactored the SQL queries, which reduced load times by 70% and cut server utilization costs."

What strength would you like to pitch for your role?`;
  }

  if (lower.includes("negotiat") || lower.includes("salary") || lower.includes("offer") || lower.includes("comp")) {
    return `### Smart Salary & Offer Negotiation Strategy

Negotiating starts before you receive the offer. Here is how to handle the conversation:

1.  **Research beforehand:** Use Glassdoor, Levels.fyi, and LinkedIn to find the market rate for the role, level, and location.
2.  **Deflect early queries:** If asked about salary expectations early on, redirect:
    > "Right now, I'm focused on finding the right fit. I'd love to learn more about the role's responsibilities before discussing numbers."
3.  **Thank them and ask for time:** Once they extend an offer, thank them and ask for the details in writing. Do not accept immediately.
4.  **Counter with data:** Frame your request around market value and the value you bring, not your personal needs:
    > "Thank you for the offer. Based on my research and the database optimization experience I bring, I was hoping we could look closer to $X base salary. Is there any flexibility here?"

Do you have an active offer you'd like to practice countering?`;
  }

  if (lower.includes("introduce") || lower.includes("tell me about") || lower.includes("introduction") || lower.includes("pitch")) {
    return `### Pitching Your Elevator Story ("Tell me about yourself")

This is your first impression. Keep it between **60 and 90 seconds** and follow the **Present-Past-Future** framework:

*   **Present:** Start with your current role, level, and a major recent accomplishment.
*   **Past:** Share 1-2 key milestones in your history (projects, skills, or promotions) that shaped your path.
*   **Future:** Explain why you are excited about *this* specific opportunity and how it fits your next step.

> **Example Pitch:**
> "I'm currently a senior frontend engineer with 5 years of experience building responsive dashboards. Most recently, I led a team of three to rebuild our product search interface, which improved mobile load times by 40%. Before this, I worked at a fintech startup where I developed real-time charting utilities. I've loved building scalable interfaces, but I'm ready to apply my frontend expertise to a company focused on AI coaching like yours, which is why I'm excited about this role."

Try writing your introduction pitch below, and I'll review it!`;
  }

  if (lower.includes("resume") || lower.includes("cv") || lower.includes("gap") || lower.includes("profile")) {
    return `### Actionable Resume & CV Best Practices

To pass applicant tracking systems (ATS) and catch an interviewer's eye:

1.  **Use Action Verbs:** Start bullet points with strong verbs (e.g., *Led*, *Architected*, *Optimized*, *Refactored*), not "Responsible for."
2.  **Quantify Outcomes:** Always try to show a metric: **[Accomplished X] as measured by [Y], by doing [Z]**.
3.  **Address Gaps honestly:** If you have employment gaps, explain them briefly and positively (e.g., skill training, family care, personal projects) without sounding defensive.
4.  **Align with Target Role:** Customize your skills matrix to match the keywords in the job description.

Would you like me to analyze a specific bullet point from your resume?`;
  }

  if (lower.includes("ask") || lower.includes("question for interviewer") || lower.includes("questions for the interviewer")) {
    return `### Smart Questions to Ask the Interviewer

At the end of the interview, asking insightful questions shows your interest and helps you assess if the company is a good fit.

*   **Role Specific:**
    > "What does success look like in the first 90 days for someone in this role?"
*   **Team & Culture:**
    > "How does the team handle code reviews and technical disagreements?"
*   **Company Strategy:**
    > "I saw that the company recently launched X. How will that affect this team's roadmap?"
*   **The Interviewer:**
    > "What is your favorite part about working here, and what is your biggest challenge?"

Avoid asking about salary, benefits, or vacation policies in the first round. Save those for the HR negotiation!`;
  }

  if (lower.includes("technical")) {
    return `### Technical Interview Success Framework

Technical interviews test your problem-solving, coding, and communication. Follow this structure:

1.  **Ask Clarifying Questions:** Confirm constraints (input sizes, types, edge cases like null/empty) before coding.
2.  **Discuss Approaches First:** Outline two or three possible solutions, analyze their time/space complexity ($O(n)$, $O(\log n)$), and agree on the best one.
3.  **Write Clean Code:** Use descriptive variable names and comment on tricky logic.
4.  **Dry Run with Test Cases:** Walk through your code line-by-line using a small test input.
5.  **Identify Improvements:** Mention how you would scale the solution (e.g., caching, DB index updates).

Do you want to practice a mock technical coding problem or system design scenario?`;
  }

  return `### Hello! I am your PrepWise AI Interview Coach.

I am ready to help you ace your next interview. I can support you in the following areas:

*   **Elevator Pitch:** Type "tell me about yourself" to practice your introduction.
*   **Behavioral Questions:** Ask me about the "STAR method" or mock behavioral questions.
*   **Salary Negotiation:** Type "salary tips" to learn how to negotiate offers.
*   **Technical Prep:** Ask me for a mock technical interview or coding guidance.
*   **Resume Optimization:** Ask how to refine your CV bullet points.

What would you like to practice today?`;
}
