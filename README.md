# The Solopreneur App 🚀

A high-performance, **neo-brutalist CRM and Marketing Automation Operating System** designed for digital agencies and solopreneurs. This application leverages the full power of the **Google Gemini API** (Flash, Pro, Imagen, and Live) to provide autonomous agents, content generation, and real-time voice interaction.

## ✨ Key Features

### 🧠 AI Growth Engines
- **SDR Agent**: Autonomous lead finder using **Google Maps Grounding** to scout prospects and identify pain points based on industry heuristics.
- **Outreach Agent**: Intelligence tool using **Google Search Grounding** to find decision-maker names, titles, and verify contact info.
- **Social Planner**: AI-powered content studio that generates captions, hashtags, and **brand images** (via Imagen) for LinkedIn, Twitter, and Instagram.

### 💼 Smart CRM
- **Pipeline**: Kanban-style opportunity management with drag-and-drop stages.
- **Unified Inbox**: Centralized stream for SMS, Email, and Social DMs with **AI Smart Replies**.
- **Calendar**: Appointment scheduling and management.
- **Contacts**: Deep database with custom fields, tagging, and enrichment data.

### ⚡ Automation & Marketing
- **Workflow Builder**: Visual node-based automation editor with AI generation capabilities.
- **Marketing Suite**: Email campaign manager with A/B testing and rich-text template builder.
- **Funnels**: Drag-and-drop landing page builder.

### 🤖 AI Employees
- **Voice Agents**: Real-time, bidirectional voice conversations using **Gemini Live API**. Features visualizers and latency analytics.
- **Text Agents**: Configurable customer support bots with custom knowledge bases.
- **Analytics**: Dashboard tracking response times, CSAT scores, and sentiment.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **AI SDK**: `@google/genai` (Gemini 1.5/2.5 Flash, Pro, Live API)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Persistence**: LocalStorage (Simulated Backend)

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure Environment**
   Set your Google Gemini API key in your environment variables.
   ```bash
   export API_KEY="your_gemini_api_key_here"
   ```
4. **Run the development server**
   ```bash
   npm start
   ```

## 🎨 Design System

The app features a distinct **Neo-Brutalist** aesthetic:
- **Colors**: High contrast. Background `zinc-950`, Accents `lime-400`, `cyan-400`, `magenta-400`.
- **Typography**: `Inter` for UI, `JetBrains Mono` for data and labels.
- **UI Elements**: Thick borders (`2px solid zinc-800`), hard shadows (`4px 4px 0px 0px`), no border-radius on buttons.

## 🔌 API Integrations implemented

- `ai.models.generateContent`: Text generation, JSON extraction.
- `ai.models.generateImages`: Brand asset creation.
- `ai.live.connect`: Real-time audio streaming (WebSockets).
- `tools: [{ googleSearch: {} }]`: Grounding for outreach.
- `tools: [{ googleMaps: {} }]`: Grounding for prospecting.