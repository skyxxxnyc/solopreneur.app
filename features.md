# TheSolopreneur.app - Feature Set

A comprehensive, neo-brutalist CRM and Marketing Automation platform designed for solopreneurs, powered by Google Gemini Models (2.5 Flash, 2.5 Pro, Live API).

## 1. Core CRM & Sales
- **Smart CRM**: Manage contacts with custom fields, tags, and lifecycle stages.
- **Pipeline Kanban**: Drag-and-drop opportunity management with automatic value calculation.
- **SDR Agent (Lead Finder)**: 
  - AI-powered prospecting using **Google Maps Grounding**.
  - Intelligent analysis using a custom **Knowledge Base** (PDF-based heuristics).
  - Auto-scoring and pain-point identification.
- **Outreach Agent**: 
  - Decision-maker hunter using **Google Search Grounding**.
  - Finds names, titles, and sources from public directories (Yelp, Manta).

## 2. Marketing Suite
- **Email Campaigns**: 
  - Compose, schedule, and track broadcasts.
  - **A/B Testing**: Split test subject lines and content with automatic winner declaration.
  - **AI Content Generator**: Generate high-converting copy using Gemini.
- **Template Builder**: 
  - Rich Text Editor for reusable email layouts.
  - AI-assisted template generation.
- **Audience Segmentation**: Filter by tags or sync directly with CRM data.

## 3. Funnel Builder
- **Drag-and-Drop Editor**: Visual page builder for landing pages.
- **Component Library**: Headers, Text, Images, Forms, Buttons.
- **Analytics**: Track visits and conversion rates.

## 4. Social Media Planner
- **Calendar View**: Drag-and-drop scheduling interface.
- **Multi-Platform Support**: LinkedIn, Twitter (X), Instagram.
- **AI Content Studio**: 
  - Generate captions + hashtags based on topics.
  - **AI Image Generation**: Create brand assets using Gemini Imagen models.
- **Live Previews**: Real-time "What You See Is What You Get" mockups for each platform.

## 5. Automation
- **Visual Workflow Builder**: Create trigger-based sequences (Email, SMS, Delays).
- **AI Architect**: Generate entire workflows from natural language prompts.
- **Simulation Engine**: Test run workflows with visual status indicators and error simulation (random chaos monkey).
- **Template Library**: Pre-built flows for common scenarios (Webinar, No-show).

## 6. AI Agents (Conversations)
- **Text Agents**: Configurable chatbots (System Instructions, Temperature, Model selection).
- **Voice Agents**: 
  - Real-time bidirectional voice interaction using **Gemini Live API**.
  - Customizable voice personalities (Puck, Kore, Fenrir, etc.).
  - Speech dynamics control (Pitch, Rate).
- **Knowledge Base**: Train agents on specific URLs or Files.
- **Persona Management**: Save and load different agent configurations.

## 7. Settings & Infrastructure
- **Brand Identity**: AI Logo Generator to create neo-brutalist assets.
- **Persistence Layer**: LocalStorage-based backend simulating a real database.
- **Data Management**: "Danger Zone" to wipe/reset application data.
