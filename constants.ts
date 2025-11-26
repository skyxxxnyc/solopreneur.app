

import { Contact, PipelineStage, Funnel, EmailCampaign, AgentConfiguration, EmailTemplate, WorkflowTemplate, SocialPost } from './types';

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'new', title: 'New Leads', color: 'border-l-cyan-400' },
  { id: 'contacted', title: 'Hot Leads', color: 'border-l-yellow-400' },
  { id: 'appointment', title: 'Booking Confirmed', color: 'border-l-orange-400' },
  { id: 'negotiation', title: 'Negotiation', color: 'border-l-pink-400' },
  { id: 'closed', title: 'Closed Won', color: 'border-l-lime-400' },
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Alice Freeman',
    company: 'TechFlow Inc.',
    email: 'alice@techflow.com',
    phone: '+1 (555) 012-3456',
    value: 5000,
    stage: 'new',
    lastContact: '2h ago',
    tags: ['referral', 'high-ticket'],
    customFields: [{ id: 'cf1', label: 'Source', value: 'LinkedIn' }]
  },
  {
    id: '2',
    name: 'Bob Smith',
    company: 'BuildRight LLC',
    email: 'bob@buildright.com',
    phone: '+1 (555) 987-6543',
    value: 12000,
    stage: 'contacted',
    lastContact: '1d ago',
    tags: ['construction'],
    customFields: []
  },
  {
    id: '3',
    name: 'Charlie Davis',
    company: 'Davis Legal',
    email: 'charlie@davislegal.com',
    phone: '+1 (555) 456-7890',
    value: 3500,
    stage: 'appointment',
    lastContact: '30m ago',
    tags: ['legal', 'urgent'],
    customFields: [{ id: 'cf2', label: 'Priority', value: 'High' }]
  },
  {
    id: '4',
    name: 'Dana Lee',
    company: 'Creative Studios',
    email: 'dana@creativestudios.com',
    phone: '+1 (555) 111-2222',
    value: 8000,
    stage: 'closed',
    lastContact: '1w ago',
    tags: ['design', 'retainer'],
    customFields: []
  }
];

export const INITIAL_FUNNELS: Funnel[] = [
  {
    id: 'f1',
    name: 'Webinar Registration',
    status: 'published',
    visits: 1240,
    conversions: 35,
    elements: [
      { id: 'e1', type: 'header', content: 'Free Marketing Masterclass' },
      { id: 'e2', type: 'text', content: 'Learn the secrets to 10x your agency growth in 30 days.' },
      { id: 'e3', type: 'form', content: 'Register Now' },
    ]
  },
  {
    id: 'f2',
    name: 'Consultation Booking',
    status: 'draft',
    visits: 0,
    conversions: 0,
    elements: [
      { id: 'e4', type: 'header', content: 'Book Your Strategy Call' },
      { id: 'e5', type: 'image', content: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80' },
      { id: 'e6', type: 'button', content: 'Select a Time' },
    ]
  }
];

export const INITIAL_CAMPAIGNS: EmailCampaign[] = [
  {
    id: 'c1',
    subject: 'March Newsletter: Top Trends',
    status: 'sent',
    audience: 'All Contacts',
    stats: { sent: 120, opened: 45, clicked: 12 },
    sentAt: '2023-10-15'
  },
  {
    id: 'c2',
    subject: 'Exclusive Offer for Designers',
    status: 'draft',
    audience: 'Tag: design',
    stats: { sent: 0, opened: 0, clicked: 0 },
    sentAt: '-'
  },
  {
    id: 'c3',
    subject: 'A/B Test: New Service Launch',
    status: 'sent',
    audience: 'Tag: high-ticket',
    stats: { sent: 50, opened: 15, clicked: 5 }, // Variant A
    sentAt: '2023-11-01',
    isABTest: true,
    variantB: {
      subject: 'You are invited: VIP Launch',
      body: '<p>Standard body content for B...</p>'
    },
    statsB: { sent: 50, opened: 28, clicked: 12 }, // Variant B performed better
    winner: 'B'
  }
];

export const INITIAL_TEMPLATES: EmailTemplate[] = [
  {
    id: 't1',
    name: 'Welcome Series #1',
    subject: 'Welcome to the Solopreneur Club!',
    body: '<h1>Welcome Aboard!</h1><p>We are thrilled to have you here.</p><p>Here is what you can expect...</p>',
    lastModified: '2023-10-20'
  },
  {
    id: 't2',
    name: 'Consultation Follow-up',
    subject: 'Great chatting with you today',
    body: '<p>Hi there,</p><p>It was great connecting earlier. As discussed, here are the next steps.</p><ul><li>Step 1</li><li>Step 2</li></ul>',
    lastModified: '2023-11-05'
  }
];

export const INITIAL_SOCIAL_POSTS: SocialPost[] = [
    {
        id: '1',
        platform: 'linkedin',
        content: "Just launched my new agency! 🚀 It's been a wild ride but I'm excited to help small businesses grow. #entrepreneur #growth",
        hashtags: ['#entrepreneur', '#growth', '#agency'],
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'scheduled',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80'
    },
    {
        id: '2',
        platform: 'twitter',
        content: "Pro tip: Automation isn't about being lazy, it's about being efficient. What are you automating today?",
        hashtags: ['#automation', '#productivity'],
        scheduledDate: new Date(Date.now() - 86400000).toISOString(),
        status: 'published'
    }
];

export const INITIAL_AGENT_CONFIGS: AgentConfiguration[] = [
  {
    id: '1',
    name: 'Basic Support',
    type: 'text',
    systemInstruction: 'You are a helpful customer support assistant for a digital marketing agency called "The Solopreneur". Be concise, professional, and friendly.',
    temperature: 0.7,
    model: 'gemini-3-pro-preview',
    knowledgeSources: []
  },
  {
    id: '2',
    name: 'Sales Coach (Aggressive)',
    type: 'voice',
    systemInstruction: 'You are an aggressive sales coach helping the user practice objection handling. Challenge the user constantly. Do not be polite.',
    temperature: 0.9,
    voiceName: 'Fenrir',
    speakingRate: 1.2,
    pitch: -5,
    knowledgeSources: []
  },
  {
    id: '3',
    name: 'Tech Troubleshooter',
    type: 'text',
    systemInstruction: 'You are a technical support engineer. Focus on solving software issues with step-by-step instructions. Ask clarifying questions.',
    temperature: 0.2,
    model: 'gemini-2.5-flash',
    knowledgeSources: []
  },
  {
    id: '4',
    name: 'Empathetic Listener',
    type: 'voice',
    systemInstruction: 'You are an empathetic listener. Use a soothing tone and validate the users feelings. Keep responses short and encouraging.',
    temperature: 0.6,
    voiceName: 'Kore',
    speakingRate: 0.9,
    pitch: 2,
    knowledgeSources: []
  }
];

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
    {
        id: 'wt1',
        name: 'Simple Lead Nurture',
        description: 'Standard 2-step follow up for new leads from any source.',
        nodes: [
            { id: '1', type: 'trigger', title: 'New Contact Created', description: 'Any Source' },
            { id: '2', type: 'email', title: 'Welcome Email', description: 'Subject: Welcome to the family!' },
            { id: '3', type: 'wait', title: 'Wait 2 Days', description: 'Delay' },
            { id: '4', type: 'email', title: 'Value Add Email', description: 'Subject: Here is a free resource' },
            { id: '5', type: 'sms', title: 'Check-in SMS', description: 'Hey, did you get my email?' }
        ]
    },
    {
        id: 'wt2',
        name: 'Webinar Reminder Sequence',
        description: 'Ensure high attendance rates with timely reminders.',
        nodes: [
            { id: '1', type: 'trigger', title: 'Form Submitted', description: 'Webinar Registration' },
            { id: '2', type: 'email', title: 'Confirmation', description: 'Subject: You are registered!' },
            { id: '3', type: 'wait', title: 'Wait until 1h before', description: 'Event Date' },
            { id: '4', type: 'sms', title: 'Starting Soon', description: 'We go live in 1 hour!' },
            { id: '5', type: 'email', title: 'Link to Join', description: 'Subject: Join now' }
        ]
    },
    {
        id: 'wt3',
        name: 'Appointment No-Show',
        description: 'Re-engage leads who missed their scheduled call.',
        nodes: [
            { id: '1', type: 'trigger', title: 'Appointment Status', description: 'Changed to No-Show' },
            { id: '2', type: 'email', title: 'Sorry we missed you', description: 'Subject: Reschedule?' },
            { id: '3', type: 'wait', title: 'Wait 1 Day', description: 'Delay' },
            { id: '4', type: 'action', title: 'Create Task', description: 'Manual Follow-up Call' }
        ]
    }
];

// Extracted from user's PDF
export const SDR_KNOWLEDGE_BASE = `
**Client Profile:** Web Design & Digital Marketing Agency.
**Services:** Web dev, SEO, AI automation.
**Target:** SMBs.
**Packages:** Basic (Startups), Standard (SMBs), Premium (Enterprise).

**Industry Specific Opportunities:**
- **Restaurants/Cafes:** Need AI chatbots for reservations, menu recommendations, SMS reminders. Pain point: No-shows, manual reservations.
- **Healthcare/Clinics:** Need appointment scheduling bots, patient intake automation. Pain point: Admin burden, patient follow-up.
- **Real Estate:** Need lead qualification bots, virtual tour scheduling. Pain point: Slow response to inquiries.
- **Retail:** Need inventory alerts, support bots. Pain point: Support volume.
- **Salons/Spas:** Need booking automation, reminder systems.

**Pain Point Identification Heuristics:**
1. **Low Rating (< 4.0):** Indicates poor customer service or reputation management issues. Opportunity: Reputation Management Package.
2. **Low Review Count:** Indicates lack of social proof or automated review generation. Opportunity: Review automation system.
3. **No Website:** Critical gap. Opportunity: Basic Website Package.
4. **General:** "Manual processes" inferred from business type (e.g., calling for reservations) = AI Automation opportunity.

**Scoring Criteria:**
- **High Priority:** Matches ICP perfectly, clear digital gap (e.g. bad rating), high value industry (Healthcare, Real Estate).
- **Medium Priority:** Good potential, moderate gaps.
`;