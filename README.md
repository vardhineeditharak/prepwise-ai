# PrepWise AI

PrepWise AI is an intelligent, professional career preparation and interview training workspace. It leverages advanced AI model capabilities and modern cloud database architecture to help job seekers analyze their resume fit, practice mock interviews in real-time, get detailed response analysis, and receive tailored career coaching.

The application is styled using the **Steep** design reference—a daylight analytics workspace that emphasizes a clean, editorial aesthetic, rich typography, and minimal accent framing for a highly premium, human-centric workspace experience.

---

## 🚀 Core Features

- **📄 Client-Side Resume Analysis**: Upload your resume in PDF format to parse it fully in-browser, match details against your target role/experience level, and analyze skill gaps.
- **🎙️ Real-Time Mock Interview Practice**: Generate tailored, domain-specific interview questions dynamically. Practice answering them with interactive state tracking.
- **📊 AI Answer & Tone Analysis**: Get scored on answers, structured recommendations, and tone analyses utilizing sentiment and emotional context evaluation.
- **💬 Conversational AI Coach**: Engage with a persistent, dynamic career assistant that helps you refine your elevator pitches, practice negotiation, and review resume strengths.
- **📈 Progress Dashboard**: Track your overall prep history, recent interview scores, resume reports, and practice sessions at a glance.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & Authentication**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Core AI Models**: IBM Granite-3-8b-instruct via [WatsonX AI](https://www.ibm.com/watsonx)
- **Speech/Text Analysis**: [IBM Watson Natural Language Understanding (NLU)](https://cloud.ibm.com/catalog/services/natural-language-understanding)
- **PDF Extraction**: [PDF.js](https://mozilla.github.io/pdf.js/) for client-side text extraction

---

## ⚙️ Installation & Setup

### Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or later)
- [npm](https://www.npmjs.com/) (or yarn/pnpm)
- A [Supabase](https://supabase.com/) account
- An [IBM Cloud](https://cloud.ibm.com/) account (with WatsonX AI and Natural Language Understanding enabled)

### Step-by-Step Guide

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/prepwise-ai.git
   cd prepwise-ai
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Duplicate `.env.example` to create a local `.env` file:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and populate it with your API credentials:
   ```env
   # IBM Cloud Credentials (WatsonX)
   IBM_API_KEY=your_ibm_cloud_api_key
   IBM_PROJECT_ID=your_watsonx_project_id
   IBM_URL=https://us-south.ml.cloud.ibm.com

   # IBM Watson Natural Language Understanding
   IBM_NLU_API_KEY=your_nlu_api_key
   IBM_NLU_URL=https://api.us-south.natural-language-understanding.watson.cloud.ibm.com

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```

4. **Initialize the Database Schema**
   - Head over to your Supabase Console, navigate to the **SQL Editor**, and create a new query.
   - Copy the SQL statements from [supabase/schema.sql](file:///c:/tharak/Projects/IBM%20Internship/prepwise-ai/supabase/schema.sql) and run them. This will create all the necessary profiles, sessions, analyses, and message tables, along with Row Level Security (RLS) triggers and policies.

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## 📖 Usage Examples

### Running Locally
- Run the development server: `npm run dev`
- Build the production output: `npm run build`
- Start the production build locally: `npm run start`
- Run TypeScript checking and ESLint rules: `npm run lint`

### API Integrations
The application leverages backend routes under `/app/api` to communicate securely with WatsonX and Watson NLU services. Here is an example fetch body used internally to request response analysis:

```typescript
const response = await fetch('/api/analyze-interview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'session-uuid',
    answers: [
      { question: 'Tell me about yourself.', answer: '...' }
    ]
  })
});
const report = await response.json();
console.log('Performance Report:', report);
```
