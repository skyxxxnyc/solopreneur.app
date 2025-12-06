

import { Contact, PipelineStage, Funnel, EmailCampaign, AgentConfiguration, EmailTemplate, WorkflowTemplate, SocialPost, Appointment, InboxThread, Tenant, User } from './types';

export const MOCK_TENANTS: Tenant[] = [
  { id: 't1', name: 'HQ Agency', type: 'agency' },
  { id: 't2', name: 'TechFlow Inc.', type: 'sub_account' },
  { id: 't3', name: 'BuildRight LLC', type: 'sub_account' }
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Agency Admin', email: 'admin@agency.com', role: 'agency_admin', tenantId: 't1', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 'u2', name: 'TechFlow Admin', email: 'alice@techflow.com', role: 'admin', tenantId: 't2', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 'u3', name: 'TechFlow Staff', email: 'staff@techflow.com', role: 'user', tenantId: 't2', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: 'u4', name: 'BuildRight Admin', email: 'bob@buildright.com', role: 'admin', tenantId: 't3', avatar: 'https://i.pravatar.cc/150?u=4' }
];

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
    tenantId: 't2',
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
    tenantId: 't3',
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
    tenantId: 't2',
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
    tenantId: 't2',
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
    tenantId: 't2',
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
    tenantId: 't3',
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

export const FUNNEL_TEMPLATES: Funnel[] = [
  {
    id: 'tpl_lead_magnet',
    tenantId: 't1',
    name: 'Simple Lead Magnet',
    status: 'draft',
    visits: 0,
    conversions: 0,
    elements: [
       { id: 'e1', type: 'header', content: 'Free E-Book: The Solopreneur Guide' },
       { id: 'e2', type: 'image', content: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80' },
       { id: 'e3', type: 'text', content: 'Download our comprehensive guide to scaling your one-person business.' },
       { id: 'e4', type: 'form', content: 'Email Address' },
       { id: 'e5', type: 'button', content: 'Get It Now' },
    ]
  },
  {
      id: 'tpl_webinar',
      tenantId: 't1',
      name: 'Webinar Registration',
      status: 'draft',
      visits: 0,
      conversions: 0,
      elements: [
          { id: 'e1', type: 'header', content: 'Live Masterclass: AI Automation' },
          { id: 'e2', type: 'text', content: 'Join us live to learn how to automate 80% of your work.' },
          { id: 'e3', type: 'image', content: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80' },
          { id: 'e4', type: 'text', content: 'Limited spots available. Reserve yours today.' },
          { id: 'e5', type: 'form', content: 'Enter your email' },
          { id: 'e6', type: 'button', content: 'Register for Free' }
      ]
  },
   {
      id: 'tpl_booking',
      tenantId: 't1',
      name: 'Consultation Booking',
      status: 'draft',
      visits: 0,
      conversions: 0,
      elements: [
          { id: 'e1', type: 'header', content: 'Book Your Strategy Call' },
          { id: 'e2', type: 'text', content: 'Ready to take your business to the next level? Lets talk.' },
          { id: 'e3', type: 'image', content: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80' },
          { id: 'e4', type: 'button', content: 'Select a Time' }
      ]
  },
  {
      id: 'tpl_product',
      tenantId: 't1',
      name: 'Product Sales Page',
      status: 'draft',
      visits: 0,
      conversions: 0,
      elements: [
          { id: 'e1', type: 'header', content: 'The Ultimate AI Toolkit' },
          { id: 'e2', type: 'image', content: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80' },
          { id: 'e3', type: 'text', content: 'Everything you need to build, scale, and automate. One price.' },
          { id: 'e4', type: 'header', content: '$97 - Limited Time' },
          { id: 'e5', type: 'button', content: 'Buy Now' },
          { id: 'e6', type: 'text', content: '"This toolkit changed my life." - Verified Customer' }
      ]
  },
  {
      id: 'tpl_agency_app',
      tenantId: 't1',
      name: 'High-Ticket Application',
      status: 'draft',
      visits: 0,
      conversions: 0,
      elements: [
          { id: 'e1', type: 'header', content: 'Apply for our Exclusive Partnership' },
          { id: 'e2', type: 'image', content: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80' },
          { id: 'e3', type: 'text', content: 'We only work with 5 new clients per month. Watch the video below to see if you qualify.' },
          { id: 'e4', type: 'text', content: 'VIDEO PLACEHOLDER (Embed VSL Here)' },
          { id: 'e5', type: 'button', content: 'Apply Now' }
      ]
  },
  {
      id: 'tpl_waitlist',
      tenantId: 't1',
      name: 'Product Waitlist',
      status: 'draft',
      visits: 0,
      conversions: 0,
      elements: [
          { id: 'e1', type: 'header', content: 'Something Big is Coming...' },
          { id: 'e2', type: 'text', content: 'Be the first to know when we launch and get an exclusive 50% early-bird discount.' },
          { id: 'e3', type: 'form', content: 'Enter your email' },
          { id: 'e4', type: 'text', content: 'Only 500 spots available for early access.' }
      ]
  },
  {
      id: 'tpl_challenge',
      tenantId: 't1',
      name: '5-Day Challenge',
      status: 'draft',
      visits: 0,
      conversions: 0,
      elements: [
          { id: 'e1', type: 'header', content: 'Join the 5-Day Lead Gen Challenge' },
          { id: 'e2', type: 'image', content: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80' },
          { id: 'e3', type: 'text', content: 'Day 1: Mindset. Day 2: Tools. Day 3: Strategy. Day 4: Execution. Day 5: Scale.' },
          { id: 'e4', type: 'form', content: 'Reserve My Spot' },
          { id: 'e5', type: 'button', content: 'Join Challenge' }
      ]
  },
  {
      id: 'tpl_real_estate',
      tenantId: 't1',
      name: 'Real Estate Listing',
      status: 'draft',
      visits: 0,
      conversions: 0,
      elements: [
          { id: 'e1', type: 'header', content: 'Luxury Downtown Penthouse' },
          { id: 'e2', type: 'image', content: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80' },
          { id: 'e3', type: 'text', content: '3 Bed, 2 Bath. Floor to ceiling windows. Gym and Pool access included.' },
          { id: 'e4', type: 'text', content: 'Price: $1,200,000' },
          { id: 'e5', type: 'form', content: 'Your Phone Number' },
          { id: 'e6', type: 'button', content: 'Schedule Viewing' }
      ]
  },
  {
      id: 'tpl_saas_demo',
      tenantId: 't1',
      name: 'SaaS Demo Request',
      status: 'draft',
      visits: 0,
      conversions: 0,
      elements: [
          { id: 'e1', type: 'header', content: 'See the Platform in Action' },
          { id: 'e2', type: 'text', content: 'Automate your workflow, save time, and increase revenue with our all-in-one solution.' },
          { id: 'e3', type: 'form', content: 'Work Email' },
          { id: 'e4', type: 'button', content: 'Book Live Demo' }
      ]
  },
  {
      id: 'tpl_affiliate',
      tenantId: 't1',
      name: 'Affiliate Bridge Page',
      status: 'draft',
      visits: 0,
      conversions: 0,
      elements: [
          { id: 'e1', type: 'header', content: 'My Honest Review of Tool X' },
          { id: 'e2', type: 'text', content: 'I used this tool for 30 days and here is what happened...' },
          { id: 'e3', type: 'image', content: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80' },
          { id: 'e4', type: 'text', content: 'Bonus: Get my setup guide free when you sign up below.' },
          { id: 'e5', type: 'button', content: 'Get The Tool + Bonuses' }
      ]
  },
  {
      id: 'tpl_quiz',
      tenantId: 't1',
      name: 'Quiz Landing Page',
      status: 'draft',
      visits: 0,
      conversions: 0,
      elements: [
          { id: 'e1', type: 'header', content: 'What is your Marketing Archetype?' },
          { id: 'e2', type: 'text', content: 'Take this 60-second quiz to find out your hidden strengths and weaknesses.' },
          { id: 'e3', type: 'image', content: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&q=80' },
          { id: 'e4', type: 'button', content: 'Start Quiz' }
      ]
  },
  {
      id: 'tpl_ecommerce_deal',
      tenantId: 't1',
      name: 'E-commerce Flash Sale',
      status: 'draft',
      visits: 0,
      conversions: 0,
      elements: [
          { id: 'e1', type: 'header', content: 'Flash Sale: 48 Hours Only!' },
          { id: 'e2', type: 'image', content: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' },
          { id: 'e3', type: 'text', content: 'Premium Smart Watch. Tracks steps, heart rate, and sleep.' },
          { id: 'e4', type: 'header', content: '50% OFF - $49.99' },
          { id: 'e5', type: 'button', content: 'Add to Cart' },
          { id: 'e6', type: 'text', content: '⭐⭐⭐⭐⭐ "Best watch I ever owned" - Jane D.' }
      ]
  },
  {
      id: 'tpl_podcast',
      tenantId: 't1',
      name: 'Podcast Launch Team',
      status: 'draft',
      visits: 0,
      conversions: 0,
      elements: [
          { id: 'e1', type: 'header', content: 'Join the Launch Team' },
          { id: 'e2', type: 'text', content: 'Help us hit #1 on iTunes and get exclusive swag and shoutouts.' },
          { id: 'e3', type: 'image', content: 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?w=800&q=80' },
          { id: 'e4', type: 'form', content: 'Email Address' },
          { id: 'e5', type: 'button', content: 'I am In!' }
      ]
  },
  {
      id: 'tpl_local_service',
      tenantId: 't1',
      name: 'Local Service Estimate',
      status: 'draft',
      visits: 0,
      conversions: 0,
      elements: [
          { id: 'e1', type: 'header', content: 'Get a Free Roofing Estimate' },
          { id: 'e2', type: 'text', content: 'Protect your home before winter comes. Fast, reliable service in Austin.' },
          { id: 'e3', type: 'form', content: 'Zip Code' },
          { id: 'e4', type: 'form', content: 'Phone Number' },
          { id: 'e5', type: 'button', content: 'Get Quote' }
      ]
  }
];

export const INITIAL_CAMPAIGNS: EmailCampaign[] = [
  {
    id: 'c1',
    tenantId: 't2',
    subject: 'March Newsletter: Top Trends',
    status: 'sent',
    audience: 'All Contacts',
    stats: { sent: 120, opened: 45, clicked: 12 },
    sentAt: '2023-10-15'
  },
  {
    id: 'c2',
    tenantId: 't2',
    subject: 'Exclusive Offer for Designers',
    status: 'draft',
    audience: 'Tag: design',
    stats: { sent: 0, opened: 0, clicked: 0 },
    sentAt: '-'
  },
  {
    id: 'c3',
    tenantId: 't2',
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
    tenantId: 't1',
    name: 'Welcome Series #1',
    subject: 'Welcome to the Solopreneur Club!',
    body: '<h1>Welcome Aboard!</h1><p>We are thrilled to have you here.</p><p>Here is what you can expect...</p>',
    lastModified: '2023-10-20'
  },
  {
    id: 't2',
    tenantId: 't2',
    name: 'Consultation Follow-up',
    subject: 'Great chatting with you today',
    body: '<p>Hi there,</p><p>It was great connecting earlier. As discussed, here are the next steps.</p><ul><li>Step 1</li><li>Step 2</li></ul>',
    lastModified: '2023-11-05'
  }
];

export const INITIAL_SOCIAL_POSTS: SocialPost[] = [
    {
        id: '1',
        tenantId: 't2',
        platform: 'linkedin',
        content: "Just launched my new agency! 🚀 It's been a wild ride but I'm excited to help small businesses grow. #entrepreneur #growth",
        hashtags: ['#entrepreneur', '#growth', '#agency'],
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'scheduled',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80'
    },
    {
        id: '2',
        tenantId: 't2',
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
    tenantId: 't2',
    name: 'Basic Support',
    type: 'text',
    systemInstruction: 'You are a helpful customer support assistant for a digital marketing agency called "The Solopreneur". Be concise, professional, and friendly.',
    temperature: 0.7,
    model: 'gemini-3-pro-preview',
    knowledgeSources: []
  },
  {
    id: '2',
    tenantId: 't2',
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
    tenantId: 't3',
    name: 'Tech Troubleshooter',
    type: 'text',
    systemInstruction: 'You are a technical support engineer. Focus on solving software issues with step-by-step instructions. Ask clarifying questions.',
    temperature: 0.2,
    model: 'gemini-2.5-flash',
    knowledgeSources: []
  },
  {
    id: '4',
    tenantId: 't2',
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

// --- WORKFLOW TEMPLATES LIBRARY ---
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
    },
    {
        id: 'wt4',
        name: 'Lead Magnet Delivery',
        description: 'Deliver file and upsell immediately.',
        nodes: [
            { id: '1', type: 'trigger', title: 'Form Submitted', description: 'E-book Download' },
            { id: '2', type: 'email', title: 'Here is your download', description: 'Link to PDF' },
            { id: '3', type: 'wait', title: 'Wait 20 Minutes', description: 'Delay' },
            { id: '4', type: 'email', title: 'Did you see this?', description: 'Upsell to Consultation' }
        ]
    },
    {
        id: 'wt5',
        name: 'Review Request',
        description: 'Ask happy clients for a Google Review.',
        nodes: [
            { id: '1', type: 'trigger', title: 'Opportunity Won', description: 'Service Completed' },
            { id: '2', type: 'wait', title: 'Wait 3 Days', description: 'Let them enjoy service' },
            { id: '3', type: 'email', title: 'Quick Question', description: 'How was your experience?' },
            { id: '4', type: 'condition', title: 'Clicked Positive?', description: 'If Rating > 4' },
            { id: '5', type: 'sms', title: 'Google Link', description: 'Please leave a review here!' }
        ]
    },
    {
        id: 'wt6',
        name: 'Birthday Promo',
        description: 'Send an automated offer on their special day.',
        nodes: [
            { id: '1', type: 'trigger', title: 'Date Arrived', description: 'Contact Birthday' },
            { id: '2', type: 'email', title: 'Happy Birthday!', description: 'Subject: A gift for you' },
            { id: '3', type: 'wait', title: 'Wait 2 Days', description: 'Delay' },
            { id: '4', type: 'sms', title: 'Gift Exiring', description: 'Don\'t forget your code!' }
        ]
    },
    {
        id: 'wt7',
        name: 'Abandoned Cart Recovery',
        description: 'Recover lost sales from checkout.',
        nodes: [
            { id: '1', type: 'trigger', title: 'Cart Abandoned', description: 'Checkout page' },
            { id: '2', type: 'wait', title: 'Wait 1 Hour', description: 'Delay' },
            { id: '3', type: 'email', title: 'Forgot something?', description: 'Link to cart' },
            { id: '4', type: 'wait', title: 'Wait 24 Hours', description: 'Delay' },
            { id: '5', type: 'sms', title: '10% Off Code', description: 'Use code SAVE10' }
        ]
    },
    {
        id: 'wt8',
        name: 'Cold Outreach Sequence',
        description: 'Aggressive B2B prospecting flow.',
        nodes: [
            { id: '1', type: 'trigger', title: 'Tag Added', description: 'Tag: Cold-Prospect' },
            { id: '2', type: 'email', title: 'Quick Question', description: 'Intro email' },
            { id: '3', type: 'wait', title: 'Wait 2 Days', description: 'Delay' },
            { id: '4', type: 'email', title: 'Bump', description: 'Any thoughts?' },
            { id: '5', type: 'wait', title: 'Wait 3 Days', description: 'Delay' },
            { id: '6', type: 'action', title: 'Add to Call List', description: 'Manual Task' }
        ]
    },
    {
        id: 'wt9',
        name: 'Reactivation Campaign',
        description: 'Wake up dormant leads.',
        nodes: [
            { id: '1', type: 'trigger', title: 'Last Contact > 90 Days', description: 'Inactivity' },
            { id: '2', type: 'email', title: 'Are you still looking?', description: '9-word email' },
            { id: '3', type: 'wait', title: 'Wait 5 Days', description: 'Delay' },
            { id: '4', type: 'email', title: 'Closing your file', description: 'Breakup email' }
        ]
    },
    {
        id: 'wt10',
        name: 'New Client Onboarding',
        description: 'Collect info after deal signed.',
        nodes: [
            { id: '1', type: 'trigger', title: 'Deal Won', description: 'Contract Signed' },
            { id: '2', type: 'email', title: 'Welcome!', description: 'Link to onboarding form' },
            { id: '3', type: 'action', title: 'Notify Team', description: 'Slack/Internal Email' },
            { id: '4', type: 'wait', title: 'Wait 3 Days', description: 'Check form status' },
            { id: '5', type: 'sms', title: 'Form Reminder', description: 'Please complete setup' }
        ]
    },
    {
        id: 'wt11',
        name: 'Webinar Replay',
        description: 'Send recording to non-attendees.',
        nodes: [
            { id: '1', type: 'trigger', title: 'Webinar Ended', description: 'Tag: Did-Not-Attend' },
            { id: '2', type: 'email', title: 'You missed it!', description: 'Here is the replay link' },
            { id: '3', type: 'wait', title: 'Wait 48 Hours', description: 'Delay' },
            { id: '4', type: 'email', title: 'Replay expiring', description: 'Last chance to watch' }
        ]
    },
    {
        id: 'wt12',
        name: 'Appointment Confirmation',
        description: 'Reduce no-shows immediately.',
        nodes: [
            { id: '1', type: 'trigger', title: 'Appointment Booked', description: 'Calendar' },
            { id: '2', type: 'email', title: 'Confirmed', description: 'Calendar Invite attached' },
            { id: '3', type: 'sms', title: 'Confirmed', description: 'See you at {time}' },
            { id: '4', type: 'wait', title: 'Wait 24h Before', description: 'Event time' },
            { id: '5', type: 'email', title: 'Reminder', description: 'Location details' }
        ]
    },
    {
        id: 'wt13',
        name: 'Churn Prevention',
        description: 'Flag at-risk customers.',
        nodes: [
            { id: '1', type: 'trigger', title: 'Usage Low', description: 'Login < 1 per month' },
            { id: '2', type: 'action', title: 'Alert Account Manager', description: 'High Priority Task' },
            { id: '3', type: 'email', title: 'Need help?', description: 'Book a success call' }
        ]
    },
    {
        id: 'wt14',
        name: 'VIP Up-sell',
        description: 'Offer premium tier to best clients.',
        nodes: [
            { id: '1', type: 'trigger', title: 'Lifetime Value > $10k', description: 'Revenue Trigger' },
            { id: '2', type: 'email', title: 'Exclusive Invite', description: 'Join our VIP program' },
            { id: '3', type: 'action', title: 'Add Tag', description: 'Tag: VIP-prospect' }
        ]
    },
    {
        id: 'wt15',
        name: 'Contract Renewal',
        description: 'Remind client before expiry.',
        nodes: [
            { id: '1', type: 'trigger', title: 'Contract Date', description: '30 Days Before' },
            { id: '2', type: 'email', title: 'Renewal coming up', description: 'Review your plan' },
            { id: '3', type: 'wait', title: 'Wait 15 Days', description: 'Delay' },
            { id: '4', type: 'action', title: 'Create Task', description: 'Call client' }
        ]
    },
    {
        id: 'wt16',
        name: 'Networking Follow-up',
        description: 'Simple scan card follow up.',
        nodes: [
            { id: '1', type: 'trigger', title: 'Contact Created', description: 'Source: Event' },
            { id: '2', type: 'wait', title: 'Wait 3 Hours', description: 'Look natural' },
            { id: '3', type: 'email', title: 'Nice meeting you', description: 'Let\'s grab coffee' },
            { id: '4', type: 'action', title: 'Connect on LinkedIn', description: 'Manual Task' }
        ]
    },
    {
        id: 'wt17',
        name: 'Holiday Greeting',
        description: 'Seasonal blast.',
        nodes: [
            { id: '1', type: 'trigger', title: 'Specific Date', description: 'Dec 24th' },
            { id: '2', type: 'email', title: 'Happy Holidays', description: 'From the team' }
        ]
    },
    {
        id: 'wt18',
        name: 'Beta Tester Invite',
        description: 'Invite users to test new features.',
        nodes: [
            { id: '1', type: 'trigger', title: 'Tag Added', description: 'Power-User' },
            { id: '2', type: 'email', title: 'Early Access', description: 'Try new features first' },
            { id: '3', type: 'wait', title: 'Wait 3 Days', description: 'Delay' },
            { id: '4', type: 'sms', title: 'Feedback?', description: 'What did you think?' }
        ]
    },
    {
        id: 'wt19',
        name: 'Invoice Overdue',
        description: 'Chasing payments automatically.',
        nodes: [
            { id: '1', type: 'trigger', title: 'Invoice Status', description: 'Overdue 1 Day' },
            { id: '2', type: 'email', title: 'Payment Failed', description: 'Please update card' },
            { id: '3', type: 'wait', title: 'Wait 3 Days', description: 'Delay' },
            { id: '4', type: 'sms', title: 'Urgent: Service Suspension', description: 'Please pay now' }
        ]
    },
    {
        id: 'wt20',
        name: 'Gamification High Score',
        description: 'Reward user activity.',
        nodes: [
            { id: '1', type: 'trigger', title: 'Points > 1000', description: 'Gamification' },
            { id: '2', type: 'email', title: 'You are a legend!', description: 'Badge unlocked' },
            { id: '3', type: 'sms', title: 'Reward Unlocked', description: 'Click to claim prize' }
        ]
    }
];

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

export const INITIAL_APPOINTMENTS: Appointment[] = [
    {
        id: 'a1',
        tenantId: 't2',
        title: 'Strategy Call - Alice Freeman',
        contactId: '1',
        startTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
        endTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
        status: 'confirmed',
        type: 'consultation'
    },
    {
        id: 'a2',
        tenantId: 't3',
        title: 'Demo - Bob Smith',
        contactId: '2',
        startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
        endTime: new Date(new Date().setHours(14, 30, 0, 0)).toISOString(),
        status: 'pending',
        type: 'demo'
    }
];

export const INITIAL_THREADS: InboxThread[] = [
    {
        id: 'th1',
        tenantId: 't2',
        contactId: '1',
        contactName: 'Alice Freeman',
        lastMessage: 'Sounds good, see you then!',
        lastMessageTime: '10:30 AM',
        unreadCount: 1,
        messages: [
            { id: 'm1', direction: 'outbound', channel: 'sms', content: 'Hi Alice, confirming our call for tomorrow at 10am?', timestamp: '10:00 AM' },
            { id: 'm2', direction: 'inbound', channel: 'sms', content: 'Sounds good, see you then!', timestamp: '10:30 AM' }
        ]
    },
    {
        id: 'th2',
        tenantId: 't3',
        contactId: '2',
        contactName: 'Bob Smith',
        lastMessage: 'Can you send the proposal?',
        lastMessageTime: 'Yesterday',
        unreadCount: 0,
        messages: [
            { id: 'm3', direction: 'inbound', channel: 'email', content: 'Hi, thanks for the demo today. Can you send the proposal?', timestamp: 'Yesterday' }
        ]
    }
];
