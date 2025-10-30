import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  analyzeConfidence, 
  performTriage, 
  detectUrgency, 
  generateRequestSummary,
  generateConversationResponse
} from "./openai";
import { 
  insertLegalRequestSchema, 
  insertConversationMessageSchema,
  RequestStatus,
  RequestUrgency
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  app.post("/api/requests", async (req, res) => {
    try {
      const validatedData = insertLegalRequestSchema.parse(req.body);
      
      const urgencyDetection = await detectUrgency(validatedData.description);
      const aiSummary = await generateRequestSummary({
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category
      });
      
      const availableAttorneys = await storage.getAvailableAttorneys();
      const assignedAttorney = availableAttorneys.find(att => 
        att.expertise.some(exp => 
          exp.toLowerCase().includes(validatedData.category.toLowerCase()) ||
          validatedData.category.toLowerCase().includes(exp.toLowerCase())
        )
      ) || availableAttorneys[0];

      let urgency = RequestUrgency.MEDIUM;
      if (urgencyDetection.urgencyLevel === "urgent") urgency = RequestUrgency.URGENT;
      else if (urgencyDetection.urgencyLevel === "high") urgency = RequestUrgency.HIGH;
      else if (urgencyDetection.urgencyLevel === "low") urgency = RequestUrgency.LOW;

      const expectedTimeline = urgency === RequestUrgency.URGENT ? "24 hours" :
        urgency === RequestUrgency.HIGH ? "2-3 business days" : 
        urgency === RequestUrgency.MEDIUM ? "3-5 business days" : "1-2 weeks";

      const request = await storage.createLegalRequest({
        ...validatedData,
        urgency,
        aiSummary,
        assignedAttorneyId: assignedAttorney?.id,
        expectedTimeline
      });

      res.status(201).json({
        ...request,
        attorney: assignedAttorney
      });
    } catch (error) {
      console.error("Error creating request:", error);
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  app.get("/api/requests", async (req, res) => {
    try {
      const requests = await storage.getAllLegalRequests();
      
      const requestsWithAttorneys = await Promise.all(
        requests.map(async (request) => {
          const attorney = request.assignedAttorneyId 
            ? await storage.getAttorney(request.assignedAttorneyId)
            : undefined;
          return { ...request, attorney };
        })
      );

      res.json(requestsWithAttorneys);
    } catch (error) {
      console.error("Error fetching requests:", error);
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  app.get("/api/requests/:id", async (req, res) => {
    try {
      const request = await storage.getLegalRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      const attorney = request.assignedAttorneyId
        ? await storage.getAttorney(request.assignedAttorneyId)
        : undefined;

      res.json({ ...request, attorney });
    } catch (error) {
      console.error("Error fetching request:", error);
      res.status(500).json({ error: "Failed to fetch request" });
    }
  });

  app.patch("/api/requests/:id", async (req, res) => {
    try {
      const updated = await storage.updateLegalRequest(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Request not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating request:", error);
      res.status(500).json({ error: "Failed to update request" });
    }
  });

  app.post("/api/requests/:id/accept", async (req, res) => {
    try {
      const request = await storage.getLegalRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      const updated = await storage.updateLegalRequest(req.params.id, {
        status: RequestStatus.ACCEPTED
      });

      if (!updated) {
        return res.status(404).json({ error: "Failed to update request" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error accepting request:", error);
      res.status(500).json({ error: "Failed to accept request" });
    }
  });

  app.post("/api/requests/:id/decline", async (req, res) => {
    try {
      const request = await storage.getLegalRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      const { reason } = req.body;

      const updated = await storage.updateLegalRequest(req.params.id, {
        status: RequestStatus.DECLINED,
        metadata: {
          ...request.metadata,
          declineReason: reason || "No reason provided"
        }
      });

      if (!updated) {
        return res.status(404).json({ error: "Failed to update request" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error declining request:", error);
      res.status(500).json({ error: "Failed to decline request" });
    }
  });

  app.post("/api/requests/:id/reassign", async (req, res) => {
    try {
      const request = await storage.getLegalRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      const { attorneyId, notes } = req.body;

      if (!attorneyId) {
        return res.status(400).json({ error: "Attorney ID is required" });
      }

      const attorney = await storage.getAttorney(attorneyId);
      if (!attorney) {
        return res.status(404).json({ error: "Attorney not found" });
      }

      const updated = await storage.updateLegalRequest(req.params.id, {
        assignedAttorneyId: attorneyId,
        metadata: {
          ...request.metadata,
          reassignmentHistory: [
            ...(request.metadata?.reassignmentHistory || []),
            {
              from: request.assignedAttorneyId,
              to: attorneyId,
              notes: notes || undefined,
              timestamp: new Date().toISOString()
            }
          ]
        }
      });

      if (!updated) {
        return res.status(404).json({ error: "Failed to update request" });
      }

      res.json({ ...updated, attorney });
    } catch (error) {
      console.error("Error reassigning request:", error);
      res.status(500).json({ error: "Failed to reassign request" });
    }
  });

  app.post("/api/requests/:id/request-info", async (req, res) => {
    try {
      const request = await storage.getLegalRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      const { message, markAsWaiting } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Store the previous status so we can restore it later
      const previousStatus = request.status;

      // Create a conversation message for the info request
      const infoRequestMessage = await storage.createConversationMessage({
        requestId: request.id,
        role: "assistant",
        content: message,
        metadata: {
          type: "info_request",
          previousStatus,
          timestamp: new Date().toISOString()
        }
      });

      // Update request status if markAsWaiting is true
      let updated = request;
      if (markAsWaiting) {
        const updatedRequest = await storage.updateLegalRequest(req.params.id, {
          status: RequestStatus.AWAITING_INFO,
          metadata: {
            ...request.metadata,
            previousStatus,
            infoRequestedAt: new Date().toISOString()
          }
        });

        if (updatedRequest) {
          updated = updatedRequest;
        }
      }

      res.json(updated);
    } catch (error) {
      console.error("Error requesting info:", error);
      res.status(500).json({ error: "Failed to request information" });
    }
  });

  app.post("/api/analyze-confidence", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input) {
        return res.status(400).json({ error: "Input is required" });
      }

      const analysis = await analyzeConfidence(input);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing confidence:", error);
      res.status(500).json({ error: "Failed to analyze confidence" });
    }
  });

  app.post("/api/conversation", async (req, res) => {
    try {
      const validatedData = insertConversationMessageSchema.parse(req.body);
      const message = await storage.createConversationMessage(validatedData);
      
      if (message.role === "user" && message.requestId) {
        const history = await storage.getConversationMessages(message.requestId);
        const conversationHistory = history.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        const userMessage = message.content;

        let relevantArticles: Array<{ title: string; excerpt: string; content: string; category: string }> = [];

        // Use semantic search with embeddings
        try {
          console.log(`[Semantic Search] User message: "${userMessage}"`);
          console.log(`[Semantic Search] Generating query embedding...`);

          const { generateEmbedding } = await import("./openai");
          const queryEmbedding = await generateEmbedding(userMessage);

          console.log(`[Semantic Search] Searching for similar articles...`);
          const articles = await storage.semanticSearchKnowledgeArticles(queryEmbedding, 5);

          console.log(`[Semantic Search] Found ${articles.length} articles`);
          if (articles.length > 0) {
            console.log(`[Semantic Search] All results:`);
            articles.forEach(a => {
              console.log(`  - ${a.title} (similarity: ${(a.similarity * 100).toFixed(1)}%)`);
            });
          }

          // Only use articles with good similarity (55%+ threshold)
          // AI confidence check provides additional validation layer
          const SIMILARITY_THRESHOLD = 0.55;
          const relevantFilteredArticles = articles.filter(a => a.similarity >= SIMILARITY_THRESHOLD);

          if (relevantFilteredArticles.length > 0) {
            console.log(`[Semantic Search] ${relevantFilteredArticles.length} articles above ${(SIMILARITY_THRESHOLD * 100)}% threshold`);
            const topArticle = relevantFilteredArticles[0];
            console.log(`[Semantic Search] Top article: "${topArticle.title}" (${(topArticle.similarity * 100).toFixed(1)}% similarity)`);

            // AI CONFIDENCE CHECK: Can this document actually answer the user's question?
            console.log(`[AI Confidence Check] Evaluating if "${topArticle.title}" can answer the question...`);
            const { canDocumentAnswerQuestion } = await import("./openai");
            const confidenceCheck = await canDocumentAnswerQuestion(
              userMessage,
              topArticle.title,
              topArticle.excerpt
            );

            console.log(`[AI Confidence Check] Result: ${confidenceCheck.canAnswer ? 'YES' : 'NO'} (${confidenceCheck.confidence}% confidence)`);
            console.log(`[AI Confidence Check] Reasoning: ${confidenceCheck.reasoning}`);

            if (confidenceCheck.canAnswer && confidenceCheck.confidence >= 70) {
              // Document can answer with high confidence - use it
              console.log(`[AI Confidence Check] ✓ Document approved - proceeding with knowledge extraction`);
              relevantArticles = relevantFilteredArticles.map(article => ({
                title: article.title,
                excerpt: article.excerpt,
                content: article.content,
                category: article.category
              }));
            } else {
              // Document cannot answer adequately - route to intake
              console.log(`[AI Confidence Check] ✗ Document rejected - routing to intake instead`);
              relevantArticles = [];
            }
          } else {
            console.log(`[Semantic Search] No articles above ${(SIMILARITY_THRESHOLD * 100)}% threshold - will route to intake`);
            if (articles.length > 0) {
              console.log(`[Semantic Search] Best match was "${articles[0].title}" at ${(articles[0].similarity * 100).toFixed(1)}% (below threshold)`);
            }
            relevantArticles = [];
          }
        } catch (error) {
          console.error(`[Semantic Search] Error:`, error);
          // Fallback to keyword search if semantic search fails
          const stopWords = ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "is", "are", "was", "were", "been", "be", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "can", "i", "you", "we", "they", "it", "my", "our", "your"];
          const searchWords = userMessage
            .toLowerCase()
            .replace(/[^\w\s]/g, " ")
            .split(/\s+/)
            .filter(word => word.length >= 2 && !stopWords.includes(word));

          if (searchWords.length > 0) {
            const searchQuery = searchWords.join(" ");
            console.log(`[KB Search - Fallback] Search query: "${searchQuery}"`);
            const articles = await storage.searchKnowledgeArticles(searchQuery);
            console.log(`[KB Search - Fallback] Found ${articles.length} articles`);
            relevantArticles = articles.slice(0, 2).map(article => ({
              title: article.title,
              excerpt: article.excerpt,
              content: article.content,
              category: article.category
            }));
          }
        }

        const aiResponse = await generateConversationResponse(conversationHistory, relevantArticles);
        const assistantMessage = await storage.createConversationMessage({
          requestId: message.requestId,
          role: "assistant",
          content: aiResponse,
          metadata: { usedKnowledgeBase: relevantArticles.length > 0, articleTitles: relevantArticles.map(a => a.title) }
        });

        return res.json({ userMessage: message, assistantMessage });
      }

      res.json(message);
    } catch (error) {
      console.error("Error in conversation:", error);
      res.status(400).json({ error: "Failed to process conversation" });
    }
  });

  app.get("/api/conversation/:requestId", async (req, res) => {
    try {
      const messages = await storage.getConversationMessages(req.params.requestId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/triage", async (req, res) => {
    try {
      const { conversationHistory } = req.body;
      if (!conversationHistory || !Array.isArray(conversationHistory)) {
        return res.status(400).json({ error: "Conversation history is required" });
      }

      const assessment = await performTriage(conversationHistory);
      res.json(assessment);
    } catch (error) {
      console.error("Error performing triage:", error);
      res.status(500).json({ error: "Failed to perform triage" });
    }
  });

  app.get("/api/knowledge", async (req, res) => {
    try {
      const { search, category } = req.query;
      
      let articles = await storage.getAllKnowledgeArticles();
      
      if (search) {
        articles = await storage.searchKnowledgeArticles(search as string);
      }
      
      if (category && category !== "All") {
        articles = articles.filter(article => article.category === category);
      }

      res.json(articles);
    } catch (error) {
      console.error("Error fetching knowledge articles:", error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  app.get("/api/knowledge/:slug", async (req, res) => {
    try {
      const article = await storage.getKnowledgeArticleBySlug(req.params.slug);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  app.post("/api/knowledge/:id/feedback", async (req, res) => {
    try {
      const { helpful } = req.body;
      if (typeof helpful !== "boolean") {
        return res.status(400).json({ error: "Helpful must be a boolean" });
      }

      await storage.updateArticleStats(req.params.id, helpful);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating article feedback:", error);
      res.status(500).json({ error: "Failed to update feedback" });
    }
  });

  app.post("/api/knowledge", async (req, res) => {
    try {
      const article = await storage.createKnowledgeArticle(req.body);

      // Generate embedding for semantic search
      try {
        const { generateEmbedding } = await import("./openai");
        // Include full content for better semantic search (Ollama can handle large texts)
        const textForEmbedding = `${article.title}\n\n${article.excerpt}\n\n${article.content}`;
        const embedding = await generateEmbedding(textForEmbedding);
        await storage.updateArticleEmbedding(article.id, embedding);
        console.log(`[Embedding] Generated for article: ${article.title}`);
      } catch (embeddingError) {
        console.error("Error generating embedding for new article:", embeddingError);
        // Don't fail the request if embedding generation fails
      }

      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating article:", error);
      res.status(500).json({ error: "Failed to create article" });
    }
  });

  app.patch("/api/knowledge/:id", async (req, res) => {
    try {
      const article = await storage.updateKnowledgeArticle(req.params.id, req.body);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error updating article:", error);
      res.status(500).json({ error: "Failed to update article" });
    }
  });

  app.delete("/api/knowledge/:id", async (req, res) => {
    try {
      await storage.deleteKnowledgeArticle(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({ error: "Failed to delete article" });
    }
  });

  app.get("/api/attorneys", async (req, res) => {
    try {
      const attorneys = await storage.getAllAttorneys();
      res.json(attorneys);
    } catch (error) {
      console.error("Error fetching attorneys:", error);
      res.status(500).json({ error: "Failed to fetch attorneys" });
    }
  });

  app.get("/api/attorneys/available", async (req, res) => {
    try {
      const attorneys = await storage.getAvailableAttorneys();
      res.json(attorneys);
    } catch (error) {
      console.error("Error fetching available attorneys:", error);
      res.status(500).json({ error: "Failed to fetch available attorneys" });
    }
  });

  app.get("/api/attorneys/:id", async (req, res) => {
    try {
      const attorney = await storage.getAttorney(req.params.id);
      if (!attorney) {
        return res.status(404).json({ error: "Attorney not found" });
      }
      res.json(attorney);
    } catch (error) {
      console.error("Error fetching attorney:", error);
      res.status(500).json({ error: "Failed to fetch attorney" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
