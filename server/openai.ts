import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
});

export interface ConfidenceAnalysis {
  isConfident: boolean;
  confidence: number;
  reasoning: string;
}

export interface TriageAssessment {
  outcome: "needs_review" | "might_need" | "likely_fine" | "self_service";
  reasoning: string;
  recommendations?: string[];
  suggestedArticles?: string[];
}

export interface UrgencyDetection {
  isUrgent: boolean;
  urgencyLevel: "low" | "medium" | "high" | "urgent";
  reasoning: string;
}

export interface AttorneyRouting {
  suggestedAttorneyId: string;
  reasoning: string;
  requiredExpertise: string[];
}

export async function analyzeConfidence(userInput: string): Promise<ConfidenceAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are analyzing user confidence in their legal request. 
Confident users use specific legal terminology, know exactly what they need (e.g., "NDA review", "contract amendment"), and provide clear context.
Uncertain users use vague language, ask questions, express doubt (e.g., "not sure if", "might need", "wondering if").

Respond with JSON: { "isConfident": boolean, "confidence": number (0-100), "reasoning": string }`
        },
        {
          role: "user",
          content: userInput
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as ConfidenceAnalysis;
  } catch (error) {
    console.error("Error analyzing confidence:", error);
    return {
      isConfident: false,
      confidence: 50,
      reasoning: "Unable to analyze confidence"
    };
  }
}

export async function performTriage(conversationHistory: { role: string; content: string }[]): Promise<TriageAssessment> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a legal intake AI assistant performing triage on user requests.

Analyze the conversation and determine the appropriate outcome:
- "needs_review": Clear legal issues requiring attorney review (contracts, compliance violations, IP infringement, employment disputes)
- "might_need": Borderline cases that might benefit from review but aren't clearly necessary
- "likely_fine": Low-risk situations that probably don't need legal review
- "self_service": Questions answered by existing knowledge base articles

Respond with JSON: { 
  "outcome": string, 
  "reasoning": string,
  "recommendations": string[] (what the user should prepare if needs review),
  "suggestedArticles": string[] (slugs of relevant knowledge base articles)
}`
        },
        ...conversationHistory.map(msg => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content
        }))
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as TriageAssessment;
  } catch (error) {
    console.error("Error performing triage:", error);
    return {
      outcome: "needs_review",
      reasoning: "Unable to assess, recommending legal review to be safe",
      recommendations: ["Provide detailed description of the situation"]
    };
  }
}

export async function detectUrgency(description: string): Promise<UrgencyDetection> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Analyze text for urgency indicators like:
- Time-sensitive language: "urgent", "ASAP", "deadline", "tomorrow", "launching"
- Business impact: "blocking", "critical", "emergency"
- Consequences: "risk", "penalty", "violation"

Classify as:
- "urgent": Immediate action required (within 24 hours)
- "high": Soon (2-3 days)
- "medium": Normal priority (1 week)
- "low": No rush (2+ weeks)

Respond with JSON: { "isUrgent": boolean, "urgencyLevel": string, "reasoning": string }`
        },
        {
          role: "user",
          content: description
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as UrgencyDetection;
  } catch (error) {
    console.error("Error detecting urgency:", error);
    return {
      isUrgent: false,
      urgencyLevel: "medium",
      reasoning: "Unable to assess urgency"
    };
  }
}

export async function generateRequestSummary(request: {
  title: string;
  description: string;
  category: string;
}): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are generating concise summaries of legal requests for attorney review. Highlight key facts, risks, and action items in 2-3 sentences."
        },
        {
          role: "user",
          content: `Category: ${request.category}\nTitle: ${request.title}\nDescription: ${request.description}`
        }
      ]
    });

    return response.choices[0].message.content || "Legal request requiring review.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Legal request requiring review.";
  }
}

export async function generateConversationResponse(conversationHistory: { role: string; content: string }[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful legal intake assistant conducting a guided discovery conversation. 
Your goal is to understand the user's situation through natural conversation:
- Ask one clear, specific question at a time
- Build on previous answers
- Detect risk factors: data collection → privacy questions, third parties → contracts, marketing → advertising law, geography → jurisdiction
- Be warm and professional, never intimidating
- After 3-5 exchanges, you'll have enough information for assessment

Ask about:
1. Business goal/project
2. What triggered their concern
3. Data/privacy implications
4. Third-party involvement
5. Geographic scope
6. Timeline/urgency`
        },
        ...conversationHistory.map(msg => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content
        }))
      ]
    });

    return response.choices[0].message.content || "Could you tell me more about your situation?";
  } catch (error) {
    console.error("Error generating response:", error);
    return "Thank you for that information. Could you provide more details about your situation?";
  }
}
