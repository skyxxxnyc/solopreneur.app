
export type StageId = 'new' | 'contacted' | 'appointment' | 'negotiation' | 'closed';

export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  value: number;
  stage: StageId;
  lastContact: string;
  tags: string[];
  customFields: CustomField[];
}

// Backwards compatibility alias if needed, but we will migrate to Contact
export type Lead = Contact;

export interface PipelineStage {
  id: StageId;
  title: string;
  color: string;
}

export interface ChartData {
  name: string;
  value: number;
}

// Funnel Types
export type ElementType = 'header' | 'text' | 'image' | 'form' | 'button';

export interface FunnelElement {
  id: string;
  type: ElementType;
  content: string;
  props?: Record<string, any>;
}

export interface Funnel {
  id: string;
  name: string;
  status: 'draft' | 'published';
  elements: FunnelElement[];
  visits: number;
  conversions: number;
}

// Marketing Types
export interface EmailCampaign {
  id: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sent';
  audience: string; // e.g. "All Contacts" or Tag
  stats: {
    sent: number;
    opened: number;
    clicked: number;
  };
  sentAt: string;
  // A/B Testing Fields
  isABTest?: boolean;
  variantB?: {
    subject: string;
    body: string;
  };
  statsB?: {
    sent: number;
    opened: number;
    clicked: number;
  };
  winner?: 'A' | 'B' | 'tie' | 'pending';
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string; // HTML content
  lastModified: string;
}

// Social Media Types
export type SocialPlatform = 'linkedin' | 'twitter' | 'instagram';

export interface SocialPost {
    id: string;
    platform: SocialPlatform;
    content: string;
    image?: string;
    hashtags: string[];
    scheduledDate: string; // ISO String
    status: 'draft' | 'scheduled' | 'published';
}

// Conversation Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// Knowledge Base Types
export interface KnowledgeSource {
  id: string;
  type: 'url' | 'file';
  title: string;
  status: 'learning' | 'active' | 'error';
  addedAt: string;
}

export interface AgentConfiguration {
  id: string;
  name: string;
  type: 'text' | 'voice';
  systemInstruction: string;
  temperature: number;
  knowledgeSources: KnowledgeSource[];
  model?: string; // For text agents
  voiceName?: string; // For voice agents
  speakingRate?: number; // 0.5 to 2.0
  pitch?: number; // -20 to 20
}

// Automation Types
export type WorkflowNodeType = 'trigger' | 'action' | 'wait' | 'condition' | 'sms' | 'email';

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  title: string;
  description: string;
  // Runtime Status
  status?: 'idle' | 'running' | 'success' | 'error';
  errorMessage?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
}

export interface WorkflowLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  nodeId?: string;
}

// SDR Agent Types
export interface Prospect {
  id: string;
  name: string;
  address: string;
  rating: number;
  website?: string;
  reviewCount?: number;
  status: 'found' | 'added';
  analysis?: string; // AI Analysis based on KB
  leadScore?: number; // 0-100 score
  painPoints?: string[]; // Specific problems identified
  suggestedOutreach?: string; // Tailored hook/opener
}

// Outreach Agent Types
export interface EnrichedProfile {
  company: string;
  decisionMaker: string;
  title: string;
  contactInfo: string; // Inferred email or phone
  sources: string[];
  confidence: 'High' | 'Medium' | 'Low';
  notes: string;
}
