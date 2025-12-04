import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Contact, StageId, WorkflowNode, Prospect, EnrichedProfile, InboxThread } from "../types";
import { SDR_KNOWLEDGE_BASE } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- UTILS ---

const base64UrlEncode = (str: string) => {
    return btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

const decodeAudioData = async (base64Audio: string, audioContext: AudioContext) => {
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return await audioContext.decodeAudioData(bytes.buffer);
};

const cleanJson = (text: string) => {
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const startBrace = cleaned.indexOf('{');
    const startBracket = cleaned.indexOf('[');
    
    // Simple heuristic to find start of JSON
    if (startBrace !== -1 && (startBracket === -1 || startBrace < startBracket)) {
        const endBrace = cleaned.lastIndexOf('}');
        if (endBrace !== -1) cleaned = cleaned.substring(startBrace, endBrace + 1);
    } else if (startBracket !== -1) {
        const endBracket = cleaned.lastIndexOf(']');
        if (endBracket !== -1) cleaned = cleaned.substring(startBracket, endBracket + 1);
    }
    return cleaned;
};

// --- PICA OS HELPERS ---

const PICA_BASE_URL = 'https://api.picaos.com/v1/passthrough';

const getPicaHeaders = (connectionKeyEnv: string, actionId: string) => {
    return {
        'x-pica-secret': process.env.PICA_SECRET_KEY || '',
        'x-pica-connection-key': process.env[connectionKeyEnv] || '',
        'x-pica-action-id': actionId,
        'Content-Type': 'application/json'
    };
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

    const jsonStr = cleanJson(response.text || "[]");
    const rawLeads = JSON.parse(jsonStr);

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

export const generateMarketingCampaign = async (prompt: string, tone: string = 'Neo-brutalist, direct, high-impact'): Promise<{ subject: string; body: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a high-converting email marketing campaign based on this context: "${prompt}".
      Return a JSON object with 'subject' and 'body'.
      Tone: ${tone}.
      Format the 'body' with HTML tags (use <p>, <ul>, <li>, <strong>, <br>).
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

    const jsonStr = cleanJson(response.text || '{"subject": "", "body": ""}');
    return JSON.parse(jsonStr);
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
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1"
                }
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

export const generateSocialVideo = async (prompt: string): Promise<string | null> => {
    try {
        // Veo Video Generation
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '1080p',
                aspectRatio: '16:9'
            }
        });

        // Polling
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (videoUri) {
            // Fetch the actual bytes using the API key
            const res = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
            const blob = await res.blob();
            return URL.createObjectURL(blob);
        }
        return null;
    } catch (error) {
        console.error("Video generation failed:", error);
        return null;
    }
};

export const analyzeImageForCaption = async (base64Data: string, topic: string): Promise<string> => {
    try {
        const mimeType = base64Data.split(';')[0].split(':')[1];
        const data = base64Data.split(',')[1];
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: data
                        }
                    },
                    {
                        text: `Write a social media caption about "${topic}" for this image. 
                               Include 3 relevant hashtags. Tone: Professional and engaging.`
                    }
                ]
            }
        });
        return response.text || "";
    } catch (error) {
        console.error("Image analysis failed:", error);
        return "";
    }
}

export const generateMarketingSpeech = async (text: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            return `data:audio/mp3;base64,${base64Audio}`; 
        }
        return null;
    } catch (error) {
        console.error("TTS failed:", error);
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
        
        const jsonStr = cleanJson(response.text || "[]");
        return JSON.parse(jsonStr);
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
        const jsonStr = cleanJson(response.text || '{"content": "", "hashtags": []}');
        return JSON.parse(jsonStr);
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

// --- SDR & OUTREACH (Real via Pica + Perplexity) ---

export const findProspects = async (niche: string, location: string): Promise<Prospect[]> => {
    console.log("Using SDR Agent with Pica (Perplexity)");
    
    if (!process.env.PICA_PERPLEXITY_CONNECTION_KEY) {
        console.warn("PICA_PERPLEXITY_CONNECTION_KEY not set. Falling back to Gemini mock.");
        // Fallback for when Pica keys aren't set
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Find 5 ${niche} businesses in ${location}. 
                Return JSON with fields: name, address, rating, website, reviewCount.
                Use Maps tool if available.`,
                config: { tools: [{ googleMaps: {} }] }
            });
            let jsonStr = cleanJson(response.text || "[]");
            return JSON.parse(jsonStr).map((item: any, idx: number) => ({
                 ...item, id: `prospect-${Date.now()}-${idx}`, status: 'found',
                 leadScore: 85, painPoints: ['Manual Processes']
            }));
        } catch (e) { return []; }
    }

    try {
        const prompt = `Find 5 ${niche} businesses in ${location}. 
        For each, provide: name, address, rating (number), website, and reviewCount (number).
        Also calculate a 'leadScore' (0-100) based on how likely they need digital marketing (lower rating = higher score).
        Identify one specific 'painPoints' string based on reviews.
        
        KNOWLEDGE BASE for scoring:
        ${SDR_KNOWLEDGE_BASE}
        
        Return ONLY valid JSON array. No markdown.`;

        const response = await fetch(`${PICA_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: getPicaHeaders('PICA_PERPLEXITY_CONNECTION_KEY', 'conn_mod_def::GCY0iK-iGks::TKAh9sv2Ts2HJdLJc5a60A'),
            body: JSON.stringify({
                model: 'sonar',
                messages: [{ role: 'user', content: prompt }]
            })
        });

        const data = await response.json();
        const jsonStr = cleanJson(data.choices?.[0]?.message?.content || "[]");
        const rawData = JSON.parse(jsonStr);
        
        return rawData.map((item: any, idx: number) => ({
             ...item, 
             id: `prospect-${Date.now()}-${idx}`, 
             status: 'found',
             painPoints: item.painPoints ? [item.painPoints] : []
        }));

    } catch (e) { 
        console.error("SDR Agent Error:", e);
        return []; 
    }
}

export const findDecisionMaker = async (company: string, location: string): Promise<EnrichedProfile | null> => {
    console.log("Using Outreach Agent with Pica (Perplexity)");

    if (!process.env.PICA_PERPLEXITY_CONNECTION_KEY) {
        console.warn("PICA_PERPLEXITY_CONNECTION_KEY not set. Mocking.");
        // Mock fallback
        return {
            company,
            decisionMaker: "John Doe",
            title: "Owner",
            contactInfo: "john@example.com",
            sources: ["https://linkedin.com/mock"],
            confidence: "Medium",
            notes: "Mock data fallback."
        };
    }

    try {
        const prompt = `Research the business "${company}" in "${location}".
        Find the Owner, Founder, or CEO.
        Find public email addresses or phone numbers.
        
        Return ONLY a valid JSON object.
        Fields:
        - decisionMaker (string: Name or "Unknown")
        - title (string)
        - contactInfo (string: Found email/phone or "None")
        - sources (array of strings: URLs found)
        - confidence (string: "High", "Medium", "Low")
        - notes (string: e.g. "Found LinkedIn profile")`;

        const response = await fetch(`${PICA_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: getPicaHeaders('PICA_PERPLEXITY_CONNECTION_KEY', 'conn_mod_def::GCY0iK-iGks::TKAh9sv2Ts2HJdLJc5a60A'),
            body: JSON.stringify({
                model: 'sonar',
                messages: [{ role: 'user', content: prompt }]
            })
        });

        const data = await response.json();
        const jsonStr = cleanJson(data.choices?.[0]?.message?.content || "{}");
        const parsed = JSON.parse(jsonStr);
        return { ...parsed, company };

    } catch (e) {
        console.error("Outreach Agent Error:", e);
        return null;
    }
}

// --- REAL INTEGRATIONS (Pica OS) ---

export const sendRealEmail = async (to: string, subject: string, body: string): Promise<boolean> => {
    console.log(`Sending Email via Pica to ${to}`);

    if (!process.env.PICA_GMAIL_CONNECTION_KEY) {
        console.warn("PICA_GMAIL_CONNECTION_KEY not set.");
        return false;
    }

    try {
        const mimeMessage = `To: ${to}\nSubject: ${subject}\nContent-Type: text/plain; charset=UTF-8\n\n${body}`;
        const raw = base64UrlEncode(mimeMessage);

        const response = await fetch(`${PICA_BASE_URL}/users/me/messages/send`, {
            method: 'POST',
            headers: getPicaHeaders('PICA_GMAIL_CONNECTION_KEY', 'conn_mod_def::F_JeJ_A_TKg::cc2kvVQQTiiIiLEDauy6zQ'),
            body: JSON.stringify({ raw })
        });

        if (!response.ok) {
            console.error("Gmail send failed", await response.text());
            return false;
        }
        return true;
    } catch (e) {
        console.error("Gmail Error:", e);
        return false;
    }
};

export const scheduleMeeting = async (title: string, date: string, time: string): Promise<boolean> => {
    console.log(`Scheduling Meeting via Pica: ${title}`);

    if (!process.env.PICA_GOOGLE_CALENDAR_CONNECTION_KEY) {
         console.warn("PICA_GOOGLE_CALENDAR_CONNECTION_KEY not set.");
         return false;
    }

    try {
        // Using QuickAdd for natural language parsing as it's often more robust for simple inputs
        const text = encodeURIComponent(`${title} on ${date} at ${time}`);
        const response = await fetch(`${PICA_BASE_URL}/calendars/primary/events/quickAdd?text=${text}`, {
            method: 'POST',
            headers: getPicaHeaders('PICA_GOOGLE_CALENDAR_CONNECTION_KEY', 'conn_mod_def::F_Jd9lD1m3Y::XwU7qyzzQJSb6VGapt1tcQ'),
            body: JSON.stringify({})
        });

        if (!response.ok) {
            console.error("Calendar add failed", await response.text());
            return false;
        }
        return true;
    } catch (e) {
        console.error("Calendar Error:", e);
        return false;
    }
};