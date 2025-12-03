# Lovable / AI Builder Prompt

Copy and paste the following prompt into Lovable or your AI coding assistant to generate the core structure of The Solopreneur App.

---

**Project Goal:** Build a "Neo-Brutalist Agency Operating System" called "The Solopreneur App". It is a comprehensive CRM, Marketing, and AI Automation platform.

**Tech Stack:** React, TypeScript, Tailwind CSS, Lucide React, Recharts, and the `@google/genai` SDK.

**Design Aesthetic (Crucial):**
- **Style:** Neo-brutalist / Claymorphism hybrid.
- **Mode:** Dark Mode only.
- **Colors:** Background `#09090b` (zinc-950). Borders `#27272a` (zinc-800). Primary Accent `#a3e635` (lime-400). Secondary Accents: Cyan, Pink, Orange.
- **Shapes:** Sharp edges (no rounded corners on containers). Buttons have hard shadows (`box-shadow: 4px 4px 0px 0px #3f3f46`) that depress on hover.
- **Typography:** Headings in `Inter` (Black/Bold). Data and labels in `JetBrains Mono`.

**Navigation Structure (Sidebar):**
1.  **Agency Switcher:** A visual dropdown to toggle between "Agency Level" and "Sub-Account".
2.  **Launchpad (Dashboard):** High-level KPI cards and charts.
3.  **Sales & CRM:**
    *   **Opportunities:** Kanban board (Drag & drop).
    *   **Contacts:** Data table with filters.
    *   **Calendars:** Weekly/Monthly view for appointments.
    *   **Conversations (Inbox):** Unified chat interface (SMS/Email) with AI Smart Replies.
4.  **Growth Engines:**
    *   **SDR Agent:** Input niche/location -> Uses AI (Maps Grounding) to find business leads -> Displays cards.
    *   **Outreach Agent:** Input company/city -> Uses AI (Search Grounding) to find "Decision Maker" names/emails.
    *   **Funnels:** Drag-and-drop page builder (Sidebar with components, Canvas area).
    *   **Marketing:** Email campaign builder (Rich text) and A/B testing setup.
    *   **Social Planner:** Calendar view of posts. AI Content & Image generator modal.
5.  **Automation:**
    *   **Workflows:** Visual node-based editor (Trigger -> Wait -> Action).
    *   **AI Employees:** Builder for Text Agents and Real-time Voice Agents (Gemini Live).

**Core Functionality Requirements:**

1.  **Mock Backend:** Use a custom hook `useLocalStorage` to persist all data (Contacts, Pipelines, Campaigns, Threads) so the app feels real and retains state on refresh.
2.  **Gemini Service Layer:** Create a `geminiService.ts` file that handles all AI logic.
    *   Use `gemini-2.5-flash` for fast text/JSON tasks (SDR results, email drafts).
    *   Use `gemini-live` (WebSockets) for the Voice Agent.
    *   Use `gemini-2.5-flash-image` or Imagen for generating social media images.
3.  **SDR Agent Logic:** When searching, the AI must return a JSON array of businesses with a "Lead Score" and "Pain Points" based on the industry.
4.  **Voice Agent:** Implement a visualizer component that reacts to microphone input volume. Use the `GoogleGenAI` Live API to stream audio to/from the model.
5.  **Analytics:** In the AI Agents section, include charts (Recharts) for Response Latency, Sentiment Analysis (Pie chart), and Session volume.

**Implementation Details:**
- **App.tsx:** Handle routing via a state variable `currentView` (no complex router needed for this demo).
- **Icons:** Use `lucide-react` for everything.
- **Charts:** Use `recharts` for the Dashboard and Analytics.

**Prompt for the AI:**
"Build the complete 'Solopreneur App' described above. Start by setting up the mock data in `constants.ts` and the types in `types.ts`. Then build the `Sidebar` and `Layout`. Proceed to build each view component (`Dashboard`, `Pipeline`, `Inbox`, `LeadFinder`, `SocialPlanner`, `Conversations`) one by one. Ensure the design is strictly neo-brutalist with lime green accents and hard borders."
