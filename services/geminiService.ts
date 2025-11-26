
import { GoogleGenAI, Type } from "@google/genai";
import { Contact, StageId, WorkflowNode, Prospect, EnrichedProfile } from "../types";
import { SDR_KNOWLEDGE_BASE } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    // Augment with frontend specific fields that AI doesn't need to guess
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

export const findProspects = async (niche: string, location: string): Promise<Prospect[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Find 5 ${niche} businesses in ${location}. 
            Use Google Maps to get real details.
            
            Step 1: Get the raw business data.
            Step 2: For each business found, cross-reference its industry against the provided KNOWLEDGE BASE below to identify specific "Industry Specific Opportunities".
            Step 3: Analyze its digital health (Rating, Reviews, Website) against "Pain Point Identification Heuristics".
            Step 4: Generate a tailored output.

            KNOWLEDGE BASE:
            ${SDR_KNOWLEDGE_BASE}
            
            IMPORTANT: Return the data strictly as a JSON array of objects. Do not include markdown formatting (like \`\`\`json).
            Each object in the array must have these fields:
            - name (string)
            - address (string)
            - rating (number)
            - website (string, if available, otherwise empty string)
            - reviewCount (number)
            - analysis (string): A brief strategy note on why this specific business was selected based on the KB rules.
            - leadScore (number): A score from 0-100. (e.g. >80 if they match a High Priority industry like Healthcare AND have a digital gap).
            - painPoints (array of strings): List 2-3 specific issues. 
              * If industry matches KB, list the operational pain point (e.g., "Likely high volume of manual reservations"). 
              * If rating < 4.0, list "Reputation/Trust Issues".
              * If no website, list "No Digital Foundation".
            - suggestedOutreach (string): A hyper-personalized 1-sentence email opener or cold call hook. 
              * It MUST reference the specific industry pain point from the KB if applicable.
              * Example: "Saw you're running a clinic—we can automate your patient intake forms to save admin time."
            `,
            config: {
                tools: [{ googleMaps: {} }],
            }
        });

        let jsonStr = response.text || "[]";
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();

        const rawData = JSON.parse(jsonStr);
        
        return rawData.map((item: any, idx: number) => ({
            ...item,
            id: `prospect-${Date.now()}-${idx}`,
            status: 'found'
        }));
    } catch (error) {
        console.error("SDR Agent error:", error);
        return [];
    }
}

export const findDecisionMaker = async (company: string, location: string): Promise<EnrichedProfile | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Find the decision maker (Owner, Founder, CEO, or Managing Director) for "${company}" in "${location}".
            
            Search public sources like Yelp business owner replies, Manta listings, Better Business Bureau, or their official website "About" page.
            
            Task:
            1. Identify the name of the owner/decision maker.
            2. Identify their job title.
            3. Infer a likely contact method (generic email or phone number found publicly).
            
            Output your response as a strictly valid JSON object. Do not wrap in markdown.
            Fields:
            - decisionMaker (string): Name of person, or "Unknown"
            - title (string): Title, or "N/A"
            - contactInfo (string): Public email/phone found, or "Not listed"
            - sources (array of strings): List of URLs where you found this info.
            - confidence (string): "High" if name found on official site/Yelp owner reply, "Medium" if directory listing, "Low" if inferred.
            - notes (string): Brief explanation of where you found it (e.g. "Found 'Joe' responding to Yelp reviews as Owner").
            `,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        // Search grounding requires us to parse the response manually or ask for JSON string.
        let jsonStr = response.text || "{}";
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Sometimes text models chatter before JSON, find the first { and last }
        const start = jsonStr.indexOf('{');
        const end = jsonStr.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            jsonStr = jsonStr.substring(start, end + 1);
        }

        const data = JSON.parse(jsonStr);
        
        // Extract grounding sources if available in metadata (Gemini 2.5 often puts them in text or metadata)
        // For this implementation, we trust the model's "sources" field if it filled it, 
        // but we can also look at groundingMetadata if we were using a different access pattern.
        
        return {
            company: company,
            decisionMaker: data.decisionMaker || "Unknown",
            title: data.title || "Unknown",
            contactInfo: data.contactInfo || "None",
            sources: data.sources || [],
            confidence: data.confidence || "Low",
            notes: data.notes || "AI Search complete."
        };

    } catch (error) {
        console.error("Outreach Agent error:", error);
        return null;
    }
}
