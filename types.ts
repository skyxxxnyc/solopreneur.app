
export type StageId = 'new' | 'contacted' | 'appointment' | 'negotiation' | 'closed';

export type UserRole = 'agency_admin' | 'admin' | 'user';

export interface Tenant {
  id: string;
  name: string;
  type: 'agency' | 'sub_account';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  avatar?: string;
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface Contact {
  id: string;
  tenantId: string;
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

export interface Company {
  id: string;
  tenantId: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  address: string;
  tags: string[];
  lastActivity: string;
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
  tenantId: string;
  name: string;
  status: 'draft' | 'published';
  elements: FunnelElement[];
  visits: number;
  conversions: number;
}

// Marketing Types
export interface EmailCampaign {
  id: string;
  tenantId: string;
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
  tenantId?: string; // Optional for global templates
  name: string;
  subject: string;
  body: string; // HTML content
  lastModified: string;
}

// Social Media Types
export type SocialPlatform = 'linkedin' | 'twitter' | 'instagram';

export interface SocialPost {
    id: string;
    tenantId: string;
    platform: SocialPlatform;
    content: string;
    image?: string;
    video?: string; // URL/Base64 for video content
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
  tenantId: string;
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

export interface AgentSession {
  id: string;
  tenantId: string;
  agentName: string;
  type: 'text' | 'voice';
  startTime: string; // ISO string
  duration: number; // seconds
  avgLatency?: number; // ms (text only)
  rating?: number; // 1-5
  status: 'completed' | 'aborted';
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

export interface WorkflowNodeStatus {
    id: string;
    status: 'idle' | 'running' | 'success' | 'error';
    errorMessage?: string;
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
  // Enrichment fields (Outreach Agent integration)
  decisionMaker?: string;
  decisionMakerTitle?: string;
  contactEmail?: string;
  enrichmentStatus?: 'idle' | 'searching' | 'complete' | 'failed';
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

// Inbox / Unified Messaging Types
export type MessageChannel = 'sms' | 'email' | 'whatsapp' | 'instagram';

export interface InboxMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  channel: MessageChannel;
  content: string;
  timestamp: string;
}

export interface InboxThread {
  id: string;
  tenantId: string;
  contactId: string;
  contactName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  platformIcon?: string;
  messages: InboxMessage[];
}

// Calendar / Scheduling Types
export interface Appointment {
  id: string;
  tenantId: string;
  title: string;
  contactId: string; // Link to CRM
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: 'confirmed' | 'pending' | 'cancelled';
  type: 'consultation' | 'onboarding' | 'demo';
}
