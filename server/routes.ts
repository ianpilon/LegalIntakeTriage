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

        const aiResponse = await generateConversationResponse(conversationHistory);
        const assistantMessage = await storage.createConversationMessage({
          requestId: message.requestId,
          role: "assistant",
          content: aiResponse,
          metadata: {}
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

  const httpServer = createServer(app);

  return httpServer;
}
