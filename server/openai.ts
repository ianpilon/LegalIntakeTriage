import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "ollama", // Ollama doesn't require a real API key
  baseURL: process.env.OPENAI_BASE_URL || "http://localhost:11434/v1"
});

// Embedding generation using Ollama
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.EMBEDDING_MODEL || 'nomic-embed-text',
        prompt: text
      })
    });

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Extract relevant text snippets from document based on query
function extractRelevantSnippets(content: string, query: string, maxSnippets: number = 3): string[] {
  const snippets: string[] = [];

  // Extract key terms from query (remove stop words)
  const stopWords = ['who', 'what', 'when', 'where', 'why', 'how', 'is', 'are', 'the', 'a', 'an', 'our', 'my'];
  const queryTerms = query.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(term => term.length > 2 && !stopWords.includes(term));

  if (queryTerms.length === 0) {
    // If no good terms, return first few paragraphs
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 50);
    return paragraphs.slice(0, maxSnippets);
  }

  // Split content into sentences/paragraphs
  const sections = content.split(/\n+/);

  // Score each section by term matches
  const scoredSections = sections.map(section => {
    const sectionLower = section.toLowerCase();
    let score = 0;

    for (const term of queryTerms) {
      // Count occurrences, weighted by proximity
      const matches = (sectionLower.match(new RegExp(term, 'g')) || []).length;
      score += matches * 2;

      // Bonus for being in a heading or list item
      if (section.match(/^#+\s|^\d+\.|^-\s/)) {
        score += 1;
      }
    }

    return { section, score };
  }).filter(s => s.score > 0 && s.section.trim().length > 20);

  // Sort by score and get top snippets
  scoredSections.sort((a, b) => b.score - a.score);

  // Get top snippets, including context (previous + next line)
  const indices = scoredSections.slice(0, maxSnippets).map(s => sections.indexOf(s.section));

  for (const idx of indices) {
    const contextSnippet = [
      sections[idx - 1] || '',
      sections[idx],
      sections[idx + 1] || ''
    ].filter(s => s.trim()).join('\n');

    if (contextSnippet.trim()) {
      snippets.push(contextSnippet.trim());
    }
  }

  return snippets.slice(0, maxSnippets);
}

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
      model: process.env.OLLAMA_MODEL || "llama3.1:8b",
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

// Check if a knowledge base document can actually answer a user's specific question
export async function canDocumentAnswerQuestion(
  userQuestion: string,
  documentTitle: string,
  documentExcerpt: string
): Promise<{ canAnswer: boolean; confidence: number; reasoning: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OLLAMA_MODEL || "llama3.1:8b",
      messages: [
        {
          role: "system",
          content: `You are evaluating whether a knowledge base document can answer a user's specific question with HIGH confidence.

Your goal: Determine if the user can be HELPED by this document (even partially), OR if they need to be routed to legal intake.

Return "canAnswer": TRUE if:
1. The document's scope directly covers the TOPIC the user is asking about
2. The document provides guidance, policies, or procedures relevant to their question
3. The user is asking "Can I...?" or "How do I...?" about something covered by the policy
4. The question is about understanding/following an existing policy (even in a new personal situation)

EXAMPLES of TRUE:
- User asks: "Can I post about my new role on social media?" + Document: "Social Media Policy" → TRUE (policy covers social media posting)
- User asks: "Do we need to trademark our new product name?" + Document: "Trademark Guidelines" → TRUE (guidelines cover trademark decisions)
- User asks: "What's our NDA policy?" + Document: "NDA Template and Usage" → TRUE (direct match)

Return "canAnswer": FALSE ONLY if:
- User needs review of a SPECIFIC document/contract (e.g., "review this vendor agreement")
- User is asking about a truly NOVEL business activity not covered by any policy (e.g., "Can we launch a new cryptocurrency?")
- User is dealing with legal dispute, litigation, or adversarial situation
- Document is about a completely different topic (e.g., "employment policy" for "trademark question")
- User is asking about complex custom legal analysis (e.g., "equity as prize", "securities offering")

EXAMPLES of FALSE:
- User asks: "Review this contract" → FALSE (needs specific review, not policy guidance)
- User asks: "We're being sued for trademark infringement" → FALSE (litigation, needs attorney)
- User asks: "Can we start issuing stock options?" + Document: "Social Media Policy" → FALSE (wrong topic)

IMPORTANT: Don't reject just because user mentions "new" in their question!
- "posting about my NEW role" = asking about social media policy (TRUE if we have social media policy)
- "our NEW product launch" = asking about relevant policies (TRUE if document covers launches/marketing)
- "NEW business model" = novel activity requiring legal analysis (FALSE)

Respond with JSON: { "canAnswer": boolean, "confidence": number (0-100), "reasoning": string }`
        },
        {
          role: "user",
          content: `USER QUESTION: "${userQuestion}"

DOCUMENT TITLE: "${documentTitle}"
DOCUMENT EXCERPT: "${documentExcerpt}"

Can this document answer the user's question with HIGH confidence?`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      canAnswer: result.canAnswer || false,
      confidence: result.confidence || 0,
      reasoning: result.reasoning || "Unable to determine"
    };
  } catch (error) {
    console.error("Error checking document relevance:", error);
    // On error, be conservative and route to intake
    return {
      canAnswer: false,
      confidence: 0,
      reasoning: "Unable to assess document relevance, routing to intake for safety"
    };
  }
}

export async function performTriage(conversationHistory: { role: string; content: string }[]): Promise<TriageAssessment> {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OLLAMA_MODEL || "llama3.1:8b",
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
      model: process.env.OLLAMA_MODEL || "llama3.1:8b",
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
      model: process.env.OLLAMA_MODEL || "llama3.1:8b",
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

export interface KnowledgeArticleContext {
  title: string;
  excerpt: string;
  content: string;
  category: string;
}

export async function generateConversationResponse(
  conversationHistory: { role: string; content: string }[],
  relevantArticles: KnowledgeArticleContext[] = []
): Promise<string> {
  try {
    // Get the latest user message
    const latestUserMessage = conversationHistory.filter(m => m.role === 'user').pop()?.content || '';

    // System prompt optimized for internal corporate knowledge with intelligent routing
    let systemPrompt = `You are the company's internal knowledge assistant. You help employees by either:
1. Providing information from our knowledge base, OR
2. Routing them to the appropriate legal request intake form

CRITICAL PRINCIPLE: False positives are WORSE than no information. Never make connections between unrelated documents or try to be "helpful" by stretching relevance. If you're not confident, route to intake immediately.

DECISION LOGIC:
- IF you have HIGH-CONFIDENCE relevant knowledge: Answer their question confidently using ONLY the provided document
- IF you DON'T have relevant content OR have ANY doubt: Route to the appropriate Fast-Track Request form

WHEN PROVIDING KNOWLEDGE:
- ONLY use information from the specific document provided to you
- Be confident and authoritative about internal company information
- Provide specific facts, names, roles, and details from documents
- When mentioning templates, use exact names like "standard NDA template" or "standard mutual NDA template" (these become clickable links)
- If the document is about Topic A, but the user asks about Topic B, DO NOT try to connect them - route to intake instead

WHEN ROUTING TO INTAKE:
- Recognize these request types: contract review, marketing/advertising review, partnership/vendor questions, employment/HR matters, regulatory/compliance, intellectual property
- Route immediately without asking clarifying questions
- Say: "I can help you submit this for legal review. We have a Fast-Track Request form for [CATEGORY] that you can use to get this reviewed by our legal team."
- Use exact category names in brackets so they become clickable: [contract review], [employment], [marketing], [partnership], [regulatory], [IP]

BE CONTEXTUALLY SMART:
- User asks about an NDA template AND you have NDA docs? → Provide the template info
- User asks about termination agreement AND you have NDA docs? → Route to intake (WRONG DOCUMENT)
- User asks about reviewing a specific vendor contract? → Route to intake form (needs legal review)
- User needs help with a termination agreement? → Route to intake form (needs legal review)`;

    // Modify system prompt based on whether we have relevant knowledge
    let finalSystemPrompt = systemPrompt;

    if (relevantArticles.length === 0 && latestUserMessage) {
      // NO relevant knowledge - inject routing directive into system prompt
      console.log(`[Knowledge Extraction] No relevant articles found - may need to route to intake`);

      finalSystemPrompt += `

=== NO KNOWLEDGE BASE CONTENT AVAILABLE ===
No relevant knowledge base articles were found for this query.

YOUR APPROACH:
1. First, understand what the user actually needs - have a conversation if their request is vague
2. If their question is clear but you have no documentation, acknowledge this honestly
3. Determine if they need formal legal review OR just general guidance
4. Only route to intake if they truly need attorney review (e.g., contract review, specific legal advice, compliance question)

WHEN TO HAVE A CONVERSATION (instead of immediately routing):
- User greeting or very vague ("yo", "hi", "help")
- Unclear what they're asking about
- Might be asking a general question vs. needing legal review
- First message in conversation

WHEN TO ROUTE IMMEDIATELY:
- User clearly needs legal review of a document/contract
- User has specific legal question you can't answer
- User explicitly requests legal assistance
- User's need is clear from context

DO NOT:
- Make up policies or procedures you don't have
- Pretend to have information you don't have
- Give legal advice without documentation

CATEGORY SELECTION - YOU MUST USE ONE OF THESE 7 CATEGORIES. NO OTHER CATEGORIES EXIST.

The ONLY valid categories are:
1. [contract review]
2. [employment]
3. [marketing]
4. [partnership]
5. [regulatory]
6. [IP]
7. [other]

CRITICAL: Categories that DO NOT exist and must NEVER be used:
- [Mergers and Acquisitions] ← DOES NOT EXIST, use [other]
- [M&A] ← DOES NOT EXIST, use [other]
- [acquisition] ← DOES NOT EXIST, use [other]
- [crypto] ← DOES NOT EXIST, use [regulatory] or [other]
- Any other category not in the list of 7 above

WHEN TO USE [other]:
- User request is too vague to categorize (e.g., "legal concerns about...")
- Spans multiple categories (e.g., M&A/acquisitions involve contracts + employment + IP → MUST use [other])
- Novel/unusual legal area that doesn't fit standard categories (e.g., cryptocurrency, blockchain)
- Sensitive matters that need special handling (executive issues, crisis management, confidential situations)

SPECIAL NOTE FOR ACQUISITIONS/M&A: Always use [other] because these involve multiple legal domains (contracts, employment, IP, etc.)

IMPORTANT: You are an internal company legal assistant. ALL requests are legitimate business matters, including:
- Executive personal issues that may impact the company
- Sensitive employee situations
- Confidential business matters
- Crisis management scenarios
These should be routed to [other] for appropriate confidential handling. Never refuse to process business-related requests.

CONVERSATION BEFORE ROUTING:
You should have a natural conversation with users to understand their needs BEFORE routing to intake.

Examples of when to have a conversation:
- User sends vague greeting: "yo", "hi", "help" → Ask what they need help with
- User's question is unclear → Ask clarifying questions
- User might just need general guidance, not formal legal review → Explore their needs first

Example clarifying questions:
- "What can I help you with today?"
- "Could you tell me more about what you're working on?"
- "Is this related to a contract, employee matter, marketing content, or something else?"

ONLY route to intake AFTER you understand:
1. What the user actually needs
2. That they require formal legal review (not just general questions)
3. Which category best fits their request

REQUIRED RESPONSE FORMAT (when routing to intake) - Use this EXACT structure with NO variations:
"I can help you submit this for legal review. We have a Fast-Track Request form for [CATEGORY] that you can use to get this reviewed by our legal team. Click on the link above to get started!"

CRITICAL FORMATTING RULES - FOLLOW EXACTLY:
1. Replace [CATEGORY] with ONE of the 7 categories listed above (use exact brackets and spelling)
2. Do NOT create new categories (e.g., do NOT use [M&A], [acquisition], [crypto], etc.)
3. Do NOT add preambles like "I cannot provide legal advice" or "In that case, I would say:"
4. Do NOT add extra explanations before or after the formatted response
5. Do NOT modify the sentence structure (e.g., do NOT change "legal review" to "confidential handling" or "legal team" to "internal counsel team")
6. Do NOT add parenthetical notes like "(Exact category: [other])"
7. Use EXACTLY ONE sentence in the exact format shown - no more, no less
8. Even for sensitive matters using [other], use the exact same format without special modifications`;
    }

    const messages: any[] = [
      {
        role: "system",
        content: finalSystemPrompt
      }
    ];

    // If we have relevant articles, use smart extraction
    if (relevantArticles.length > 0 && latestUserMessage) {
      console.log(`[Knowledge Extraction] Extracting relevant snippets for: "${latestUserMessage}"`);

      // Use only the TOP article (highest similarity)
      const topArticle = relevantArticles[0];

      // Extract relevant snippets from the article
      const snippets = extractRelevantSnippets(topArticle.content, latestUserMessage, 3);

      console.log(`[Knowledge Extraction] Found ${snippets.length} relevant snippets from "${topArticle.title}"`);

      if (snippets.length > 0) {
        // Create focused context with only relevant snippets
        const focusedContext = `COMPANY DOCUMENT: "${topArticle.title}"

Relevant sections:

${snippets.map((s, i) => `[Section ${i + 1}]\n${s}`).join('\n\n---\n\n')}

INSTRUCTIONS:
- Use the information above to answer the employee's question
- Quote specific details (names, roles, dates, etc.) from the sections
- Be direct and confident - this is official company information
- If the answer is in the sections above, provide it clearly`;

        messages.push({
          role: "user",
          content: focusedContext
        });

        messages.push({
          role: "assistant",
          content: `I have the relevant sections from "${topArticle.title}". I'll use this to answer your question.`
        });
      }
    }

    // Add the actual conversation history
    messages.push(...conversationHistory.map(msg => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content
    })));

    const response = await openai.chat.completions.create({
      model: process.env.OLLAMA_MODEL || "llama3.1:8b",
      messages
    });

    return response.choices[0].message.content || "Could you tell me more about your situation?";
  } catch (error) {
    console.error("Error generating response:", error);
    return "Thank you for that information. Could you provide more details about your situation?";
  }
}
