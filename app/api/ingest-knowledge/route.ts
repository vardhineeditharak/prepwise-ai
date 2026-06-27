import { NextResponse } from "next/server";
import { storeKnowledge } from "@/lib/ibm/knowledge-store";

const KNOWLEDGE_SEED = [
  {
    category: "star-method",
    content: `The STAR method is a structured technique for answering behavioral interview questions. STAR stands for Situation, Task, Action, Result. Situation: Set the context and describe the scenario. Task: Explain your responsibility or challenge. Action: Describe the specific steps you took. Result: Share the outcome and impact, using metrics when possible. Example: "Our checkout page had a 45% abandonment rate (Situation). I was assigned to redesign the checkout (Task). I analyzed sessions, removed 3 unnecessary inputs, optimized layout (Action). Abandonment dropped to 18%, boosting sales by 22% (Result)."`,
    metadata: { type: "framework", difficulty: "beginner" },
  },
  {
    category: "star-method",
    content: `Behavioral questions start with phrases like "Tell me about a time when..." or "Give me an example of...". These questions test past behavior as a predictor of future performance. Always use the STAR method. Common topics: conflict resolution, leadership, failure, teamwork, problem-solving, adapting to change, meeting deadlines.`,
    metadata: { type: "guide" },
  },
  {
    category: "weakness",
    content: `How to answer "What is your greatest weakness?": 1. Choose a real, non-critical weakness. 2. Explain the impact briefly. 3. Show active improvement steps. Avoid humble-brags like "I work too hard." Example: "I used to take on too many tasks myself to ensure perfection, causing bottlenecks. I've since learned to delegate using Trello and trust my team."`,
    metadata: { type: "question", difficulty: "common" },
  },
  {
    category: "strength",
    content: `How to answer "What are your greatest strengths?": 1. Select 1-2 core strengths aligned with the job. 2. Back with a story or proof. 3. Connect to the target role. Avoid generic labels like "hard worker." Example: "My greatest strength is database optimization. I analyzed slow queries, implemented indexes, and reduced load times by 70%."`,
    metadata: { type: "question", difficulty: "common" },
  },
  {
    category: "salary-negotiation",
    content: `Salary negotiation strategy: 1. Research using Glassdoor, Levels.fyi, LinkedIn for market rates. 2. Deflect early salary questions: "I'd like to learn more about the role before discussing numbers." 3. When you receive an offer, thank them and ask for it in writing. 4. Counter with data: "Based on my research and experience, I was hoping for closer to $X base salary."`,
    metadata: { type: "guide" },
  },
  {
    category: "elevator-pitch",
    content: `The "Tell me about yourself" pitch should be 60-90 seconds using Present-Past-Future: Present: Current role and major accomplishment. Past: 1-2 key career milestones. Future: Why this role excites you. Example: "I'm a senior frontend engineer who rebuilt our search interface, improving mobile load times by 40%. Before that, I built real-time charts at a fintech startup. I'm excited to apply my expertise to your AI coaching platform."`,
    metadata: { type: "framework" },
  },
  {
    category: "technical-interview",
    content: `Technical interview framework: 1. Ask clarifying questions about constraints (input sizes, edge cases). 2. Discuss 2-3 approaches with time/space complexity. 3. Write clean code with descriptive variable names. 4. Dry run with test cases. 5. Discuss improvements and scaling. Communication is as important as the correct answer.`,
    metadata: { type: "framework", difficulty: "intermediate" },
  },
  {
    category: "questions-for-interviewer",
    content: `Smart questions to ask the interviewer: Role-specific: "What does success look like in the first 90 days?" Team: "How does the team handle disagreements?" Company: "How will product X affect this team's roadmap?" Interviewer: "What's your favorite and most challenging part about working here?" Avoid salary/benefits questions in the first round.`,
    metadata: { type: "guide" },
  },
  {
    category: "resume-tips",
    content: `Resume best practices: 1. Use action verbs (Led, Architected, Optimized). 2. Quantify outcomes: "Reduced load time by 40%." 3. Address gaps honestly and positively. 4. Align keywords with the job description. 5. Use the format: [Accomplished X] as measured by [Y], by doing [Z].`,
    metadata: { type: "guide" },
  },
  {
    category: "general",
    content: `Interview preparation checklist: Research the company and its products. Review the job description and align your experience. Prepare 3-5 stories using STAR method. Prepare questions for the interviewer. Test your tech setup for virtual interviews. Dress professionally. Arrive 10 minutes early. Send a thank-you email within 24 hours.`,
    metadata: { type: "checklist" },
  },
  {
    category: "general",
    content: `Common interview types: Behavioral (past behavior), Technical (coding/problem-solving), Situational (hypothetical scenarios), Case (business problems), Panel (multiple interviewers), Phone screening (HR fit check), Take-home (async assignment). Each type requires different preparation strategies.`,
    metadata: { type: "guide" },
  },
  {
    category: "general",
    content: `Body language tips for interviews: Maintain eye contact (or look at camera for virtual). Sit up straight with open posture. Nod to show understanding. Speak at a moderate pace. Pause before answering to collect thoughts. Avoid filler words (um, uh, like). Smile naturally. Use hand gestures to emphasize points.`,
    metadata: { type: "tips" },
  },
  {
    category: "star-method",
    content: `STAR method example for teamwork: "Our team missed two consecutive sprint goals (Situation). As the lead developer, I identified poor task estimation as the root cause (Task). I introduced story point voting, broke epics into smaller tickets, and started daily standup refinements (Action). We met the next three sprint goals on time with 95% accuracy (Result)."`,
    metadata: { type: "example" },
  },
  {
    category: "star-method",
    content: `STAR method example for leadership: "Junior developers were spending 40% of time debugging environment issues (Situation). I took initiative to solve this (Task). I created a Docker-based development environment with one-command setup and documented it with video walkthroughs (Action). Onboarding time dropped from 2 weeks to 2 days (Result)."`,
    metadata: { type: "example" },
  },
  {
    category: "general",
    content: `Follow-up after interview: Send a personalized thank-you email within 24 hours. Reference a specific topic discussed. Reiterate your interest and value. If no response in a week, send a brief follow-up. Keep it professional and concise.`,
    metadata: { type: "tips" },
  },
];

export async function POST() {
  try {
    await storeKnowledge(KNOWLEDGE_SEED);
    return NextResponse.json({
      success: true,
      count: KNOWLEDGE_SEED.length,
      message: `Seeded ${KNOWLEDGE_SEED.length} knowledge items.`,
    });
  } catch (error) {
    console.error("Knowledge ingestion failed:", error);
    return NextResponse.json(
      { success: false, message: "Knowledge ingestion failed." },
      { status: 500 }
    );
  }
}
