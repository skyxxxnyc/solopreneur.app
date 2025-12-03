
import { GoogleGenAI, Type } from "@google/genai";
import { Contact, StageId, WorkflowNode, Prospect, EnrichedProfile, InboxThread } from "../types";
import { SDR_KNOWLEDGE_BASE } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- PICA OS HELPERS ---

const picaFetch = async (endpoint: string, connectionKey: string | undefined, actionId: string, body: any) => {
    if (!process.env.PICA_SECRET_KEY || !connectionKey) {
        console.warn(`Missing keys for Pica endpoint: ${endpoint}. Ensure PICA_SECRET_KEY and connection keys are set.`);
        return null;
    }

    try {
        const url = endpoint.startsWith('http') ? endpoint : `https://api.picaos.com/v1/passthrough/${endpoint}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'x-pica-secret': process.env.PICA_SECRET_KEY,
                'x-pica-connection-key': connectionKey,
                'x-pica-action-id': actionId,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.error(`Pica API Error ${response.status}:`, await response.text());
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Pica Network Error:", error);
        return null;
    }
};

const base64UrlEncode = (str: string) => {
    return btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

// --- CORE GENERATION (Gemini) ---

export const generateLeads = async (count: number = 3): Promise<Contact[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} realistic B2B sales leads for a digital marketing agency. 
      They should be diverse industries. 
      Return purely JSON data compatible with the schema provided.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              company: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              value: { type: Type.NUMBER, description: "Deal value between 1000 and 20000" },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["name", "company", "email", "value", "tags"],
          },
        },
      },
    });

    const rawLeads = JSON.parse(response.text || "[]");

    return rawLeads.map((lead: any, index: number) => ({
      ...lead,
      id: `gen-${Date.now()}-${index}`,
      stage: 'new' as StageId,
      lastContact: 'Just now',
      customFields: [],
      phone: lead.phone || '+1 (555) 000-0000'
    }));
  } catch (error) {
    console.error("Failed to generate leads:", error);
    return [];
  }
};

export const generateEmailDraft = async (leadName: string, company: string): Promise<string> => {
   try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a short, punchy cold outreach email to ${leadName} at ${company}. 
      Keep it under 50 words. Neo-brutalist tone: direct, no fluff.`,
    });
    return response.text || "Could not generate draft.";
   } catch (error) {
     return "Error generating draft.";
   }
};

export const generateMarketingCampaign = async (prompt: string): Promise<{ subject: string; body: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a high-converting email marketing campaign based on this context: "${prompt}".
      Return a JSON object with 'subject' and 'body'.
      Tone: Neo-brutalist, direct, high-impact, professional.
      Keep the body concise (under 150 words).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING },
          },
          required: ["subject", "body"],
        },
      },
    });

    return JSON.parse(response.text || '{"subject": "", "body": ""}');
  } catch (error) {
    console.error("Campaign gen error:", error);
    return { subject: "Error Generating", body: "Please try again." };
  }
};

export const generateBrandAsset = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }]
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Failed to generate image:", error);
        return null;
    }
}

export const generateWorkflow = async (prompt: string): Promise<WorkflowNode[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Create a marketing automation workflow based on the following request: "${prompt}".
            Return a JSON array of nodes representing the sequence steps.
            Supported types: 'trigger', 'action', 'wait', 'condition', 'sms', 'email'.
            The first node must be a trigger.
            Make it logical (e.g., Trigger -> Wait -> Email).`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['trigger', 'action', 'wait', 'condition', 'sms', 'email'] },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                        },
                        required: ["id", "type", "title", "description"]
                    }
                }
            }
        });
        
        return JSON.parse(response.text || "[]");
    } catch (error) {
        console.error("Workflow gen error:", error);
        return [];
    }
}

export const generateSocialPost = async (topic: string, platform: string): Promise<{ content: string; hashtags: string[] }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a social media post for ${platform} about: "${topic}".
            Tone: Professional yet engaging, suitable for a solopreneur.
            Return JSON with 'content' (the post text) and 'hashtags' (array of strings).
            Keep it under 280 characters if platform is Twitter.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        content: { type: Type.STRING },
                        hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["content", "hashtags"]
                }
            }
        });
        return JSON.parse(response.text || '{"content": "", "hashtags": []}');
    } catch (error) {
        console.error("Social post gen error:", error);
        return { content: "Error generating content", hashtags: [] };
    }
}

export const generateSmartReply = async (thread: InboxThread): Promise<string> => {
    try {
        const context = thread.messages.map(m => `${m.direction === 'inbound' ? 'Customer' : 'Me'}: ${m.content}`).join('\n');
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are an AI assistant for a digital agency. Read the following conversation history and generate a helpful, professional, yet brief response to the customer.
            History: ${context}
            Response rules: Be concise. If they asked for a time, propose one. If they asked for info, offer to send it. Do not sign off with "Best regards" or names.`,
        });
        return response.text || "";
    } catch (error) {
        console.error("Smart reply error", error);
        return "";
    }
}

// --- SDR & OUTREACH (Real Perplexity Integration via Pica) ---

export const findProspects = async (niche: string, location: string): Promise<Prospect[]> => {
    console.log("Using Real SDR Agent (Perplexity via Pica)");
    
    // Fallback to Gemini if Pica keys are missing
    if (!process.env.PICA_PERPLEXITY_CONNECTION_KEY) {
        console.warn("PICA_PERPLEXITY_CONNECTION_KEY not found. Falling back to Gemini Mock.");
        // Re-using old Gemini logic as fallback
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Find 5 ${niche} businesses in ${location}. Return JSON array with: name, address, rating, website, reviewCount, analysis, leadScore, painPoints, suggestedOutreach.`,
                config: { tools: [{ googleMaps: {} }] }
            });
            let jsonStr = response.text || "[]";
            jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
            const rawData = JSON.parse(jsonStr);
            return rawData.map((item: any, idx: number) => ({ ...item, id: `prospect-${Date.now()}-${idx}`, status: 'found' }));
        } catch (e) { return []; }
    }

    const prompt = `Research and find 5 specific ${niche} businesses in ${location}.
    
    Use the following KNOWLEDGE BASE for analysis:
    ${SDR_KNOWLEDGE_BASE}

    RETURN ONLY A VALID JSON ARRAY. No markdown, no intro.
    Each object must have:
    - name (string)
    - address (string)
    - rating (number, estimate if needed)
    - website (string or empty)
    - reviewCount (number)
    - analysis (string: why this lead fits based on KB)
    - leadScore (number: 0-100)
    - painPoints (array of strings)
    - suggestedOutreach (string: 1 sentence hook)
    `;

    const result = await picaFetch(
        'chat/completions',
        process.env.PICA_PERPLEXITY_CONNECTION_KEY,
        'conn_mod_def::GCY0iK-iGks::TKAh9sv2Ts2HJdLJc5a60A',
        {
            model: 'sonar',
            messages: [{ role: 'user', content: prompt }]
        }
    );

    if (result && result.choices && result.choices[0]?.message?.content) {
        try {
            let content = result.choices[0].message.content;
            // Clean markdown
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(content);
            return data.map((item: any, idx: number) => ({
                ...item,
                id: `prospect-${Date.now()}-${idx}`,
                status: 'found'
            }));
        } catch (e) {
            console.error("Failed to parse Perplexity JSON", e);
            return [];
        }
    }
    return [];
}

export const findDecisionMaker = async (company: string, location: string): Promise<EnrichedProfile | null> => {
    console.log("Using Real Outreach Agent (Perplexity via Pica)");

    // Fallback
    if (!process.env.PICA_PERPLEXITY_CONNECTION_KEY) {
        return {
            company,
            decisionMaker: "Unknown (Missing API Key)",
            title: "N/A",
            contactInfo: "None",
            sources: [],
            confidence: "Low",
            notes: "Please configure PICA_PERPLEXITY_CONNECTION_KEY."
        };
    }

    const prompt = `Find the Owner, Founder, or CEO of "${company}" in "${location}".
    Search for public email addresses or phone numbers associated with the business or owner.
    
    RETURN ONLY A VALID JSON OBJECT. No markdown.
    Fields:
    - decisionMaker (string: Name or "Unknown")
    - title (string)
    - contactInfo (string: Found email/phone or "None")
    - sources (array of strings: URLs)
    - confidence (string: "High", "Medium", "Low")
    - notes (string: e.g. "Found LinkedIn profile" or "Mentioned on website")
    `;

    const result = await picaFetch(
        'chat/completions',
        process.env.PICA_PERPLEXITY_CONNECTION_KEY,
        'conn_mod_def::GCY0iK-iGks::TKAh9sv2Ts2HJdLJc5a60A',
        {
            model: 'sonar',
            messages: [{ role: 'user', content: prompt }]
        }
    );

    if (result && result.choices && result.choices[0]?.message?.content) {
        try {
            let content = result.choices[0].message.content;
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();
            // Handle cases where AI adds extra text before/after JSON
            const start = content.indexOf('{');
            const end = content.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                content = content.substring(start, end + 1);
            }
            const data = JSON.parse(content);
            return { ...data, company };
        } catch (e) {
            console.error("Failed to parse Perplexity JSON for Decision Maker", e);
            return null;
        }
    }
    return null;
}

// --- REAL INTEGRATIONS (Gmail & Calendar via Pica) ---

export const sendRealEmail = async (to: string, subject: string, body: string): Promise<boolean> => {
    if (!process.env.PICA_GMAIL_CONNECTION_KEY) {
        console.warn("PICA_GMAIL_CONNECTION_KEY missing. Simulating send.");
        return new Promise(r => setTimeout(() => r(true), 1000));
    }

    // Construct MIME message
    const mime = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: text/plain; charset=UTF-8`,
        ``,
        body
    ].join('\n');

    const raw = base64UrlEncode(mime);

    const result = await picaFetch(
        'users/me/messages/send',
        process.env.PICA_GMAIL_CONNECTION_KEY,
        'conn_mod_def::F_JeJ_A_TKg::cc2kvVQQTiiIiLEDauy6zQ',
        { raw }
    );

    return !!result?.id;
};

export const scheduleMeeting = async (title: string, date: string, time: string): Promise<boolean> => {
    if (!process.env.PICA_GOOGLE_CALENDAR_CONNECTION_KEY) {
        console.warn("PICA_GOOGLE_CALENDAR_CONNECTION_KEY missing. Simulating schedule.");
        return new Promise(r => setTimeout(() => r(true), 1000));
    }

    const text = `${title} on ${date} at ${time}`;
    const encodedText = encodeURIComponent(text);
    
    // QuickAdd endpoint accepts text param
    const result = await picaFetch(
        `calendars/primary/events/quickAdd?text=${encodedText}`,
        process.env.PICA_GOOGLE_CALENDAR_CONNECTION_KEY,
        'conn_mod_def::F_Jd9lD1m3Y::XwU7qyzzQJSb6VGapt1tcQ',
        {} // Body must be empty object
    );

    return !!result?.id;
};
