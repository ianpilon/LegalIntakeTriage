import { 
  type LegalRequest, 
  type InsertLegalRequest,
  type ConversationMessage,
  type InsertConversationMessage,
  type KnowledgeArticle,
  type InsertKnowledgeArticle,
  type Attorney,
  type InsertAttorney,
  RequestStatus,
  RequestCategory
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createLegalRequest(request: InsertLegalRequest): Promise<LegalRequest>;
  getLegalRequest(id: string): Promise<LegalRequest | undefined>;
  getAllLegalRequests(): Promise<LegalRequest[]>;
  updateLegalRequest(id: string, updates: Partial<LegalRequest>): Promise<LegalRequest | undefined>;
  
  createConversationMessage(message: InsertConversationMessage): Promise<ConversationMessage>;
  getConversationMessages(requestId: string): Promise<ConversationMessage[]>;
  
  getAllKnowledgeArticles(): Promise<KnowledgeArticle[]>;
  getKnowledgeArticleBySlug(slug: string): Promise<KnowledgeArticle | undefined>;
  searchKnowledgeArticles(query: string): Promise<KnowledgeArticle[]>;
  updateArticleStats(id: string, helpful: boolean): Promise<void>;
  
  getAllAttorneys(): Promise<Attorney[]>;
  getAttorney(id: string): Promise<Attorney | undefined>;
  getAvailableAttorneys(): Promise<Attorney[]>;
}

export class MemStorage implements IStorage {
  private legalRequests: Map<string, LegalRequest>;
  private conversationMessages: Map<string, ConversationMessage>;
  private knowledgeArticles: Map<string, KnowledgeArticle>;
  private attorneys: Map<string, Attorney>;
  private referenceCounter: number;

  constructor() {
    this.legalRequests = new Map();
    this.conversationMessages = new Map();
    this.knowledgeArticles = new Map();
    this.attorneys = new Map();
    this.referenceCounter = 1;
    
    this.seedData();
  }

  private seedData() {
    const attorneys: InsertAttorney[] = [
      {
        name: "Sarah Johnson",
        email: "sarah.johnson@company.com",
        title: "Senior Contracts Attorney",
        photoUrl: "",
        expertise: ["Contracts", "Vendor Agreements", "NDAs"],
        availability: "available"
      },
      {
        name: "Michael Chen",
        email: "michael.chen@company.com",
        title: "Marketing Counsel",
        photoUrl: "",
        expertise: ["Marketing", "Advertising", "Social Media"],
        availability: "available"
      },
      {
        name: "Jennifer Williams",
        email: "jennifer.williams@company.com",
        title: "Employment Law Specialist",
        photoUrl: "",
        expertise: ["Employment", "HR", "Labor Law"],
        availability: "available"
      }
    ];

    attorneys.forEach(attorney => {
      const id = randomUUID();
      this.attorneys.set(id, { 
        ...attorney, 
        id,
        activeRequestCount: 0
      });
    });

    const articles: InsertKnowledgeArticle[] = [
      {
        title: "Referential Use of Trademarks in Marketing Content",
        slug: "trademark-referential-use",
        content: "# Referential Use of Trademarks\n\nYou can reference competitor names and trademarks in your marketing materials under certain circumstances...",
        excerpt: "Learn when and how you can reference competitor names and trademarks in your marketing materials without infringement.",
        category: "Marketing",
        tags: ["Trademarks", "Marketing", "Compliance"],
        readTime: 5
      },
      {
        title: "Standard NDA Template and Usage Guidelines",
        slug: "nda-template-guide",
        content: "# NDA Template Guide\n\nOur standard mutual NDA template has been pre-approved for most vendor relationships...",
        excerpt: "Download our pre-approved NDA template and learn when you can use it without legal review.",
        category: "Contracts",
        tags: ["NDA", "Templates", "Contracts"],
        readTime: 4
      },
      {
        title: "Social Media Contest Legal Requirements",
        slug: "social-media-contest-rules",
        content: "# Social Media Contest Rules\n\nRunning contests on social media platforms requires compliance with multiple regulations...",
        excerpt: "Everything you need to know about running compliant giveaways and contests on social platforms.",
        category: "Marketing",
        tags: ["Social Media", "Contests", "Sweepstakes"],
        readTime: 7
      },
      {
        title: "Privacy Policy Updates: GDPR & CCPA Compliance",
        slug: "privacy-policy-gdpr-ccpa",
        content: "# Privacy Policy Compliance\n\nWhen collecting data from EU and California residents, specific requirements must be met...",
        excerpt: "Key requirements for privacy policies when collecting data from EU and California residents.",
        category: "Privacy",
        tags: ["Privacy", "GDPR", "CCPA", "Data Protection"],
        readTime: 8
      }
    ];

    articles.forEach(article => {
      const id = randomUUID();
      this.knowledgeArticles.set(id, {
        ...article,
        id,
        viewCount: Math.floor(Math.random() * 500) + 50,
        helpfulCount: Math.floor(Math.random() * 200) + 20,
        notHelpfulCount: Math.floor(Math.random() * 30) + 2,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  }

  async createLegalRequest(insertRequest: InsertLegalRequest): Promise<LegalRequest> {
    const id = randomUUID();
    const referenceNumber = `REQ-${new Date().getFullYear()}-${String(this.referenceCounter++).padStart(3, '0')}`;
    
    const request: LegalRequest = {
      ...insertRequest,
      id,
      referenceNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.legalRequests.set(id, request);
    return request;
  }

  async getLegalRequest(id: string): Promise<LegalRequest | undefined> {
    return this.legalRequests.get(id);
  }

  async getAllLegalRequests(): Promise<LegalRequest[]> {
    return Array.from(this.legalRequests.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async updateLegalRequest(id: string, updates: Partial<LegalRequest>): Promise<LegalRequest | undefined> {
    const request = this.legalRequests.get(id);
    if (!request) return undefined;
    
    const updated: LegalRequest = {
      ...request,
      ...updates,
      updatedAt: new Date()
    };
    
    this.legalRequests.set(id, updated);
    return updated;
  }

  async createConversationMessage(insertMessage: InsertConversationMessage): Promise<ConversationMessage> {
    const id = randomUUID();
    const message: ConversationMessage = {
      ...insertMessage,
      id,
      createdAt: new Date()
    };
    
    this.conversationMessages.set(id, message);
    return message;
  }

  async getConversationMessages(requestId: string): Promise<ConversationMessage[]> {
    return Array.from(this.conversationMessages.values())
      .filter(msg => msg.requestId === requestId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getAllKnowledgeArticles(): Promise<KnowledgeArticle[]> {
    return Array.from(this.knowledgeArticles.values()).sort((a, b) => 
      b.viewCount - a.viewCount
    );
  }

  async getKnowledgeArticleBySlug(slug: string): Promise<KnowledgeArticle | undefined> {
    return Array.from(this.knowledgeArticles.values()).find(article => article.slug === slug);
  }

  async searchKnowledgeArticles(query: string): Promise<KnowledgeArticle[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.knowledgeArticles.values())
      .filter(article => 
        article.title.toLowerCase().includes(lowerQuery) ||
        article.excerpt.toLowerCase().includes(lowerQuery) ||
        article.content.toLowerCase().includes(lowerQuery) ||
        article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
  }

  async updateArticleStats(id: string, helpful: boolean): Promise<void> {
    const article = this.knowledgeArticles.get(id);
    if (!article) return;
    
    if (helpful) {
      article.helpfulCount++;
    } else {
      article.notHelpfulCount++;
    }
    
    this.knowledgeArticles.set(id, article);
  }

  async getAllAttorneys(): Promise<Attorney[]> {
    return Array.from(this.attorneys.values());
  }

  async getAttorney(id: string): Promise<Attorney | undefined> {
    return this.attorneys.get(id);
  }

  async getAvailableAttorneys(): Promise<Attorney[]> {
    return Array.from(this.attorneys.values())
      .filter(attorney => attorney.availability === "available")
      .sort((a, b) => a.activeRequestCount - b.activeRequestCount);
  }
}

export const storage = new MemStorage();
