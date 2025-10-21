import { 
  type LegalRequest, 
  type InsertLegalRequest,
  type ConversationMessage,
  type InsertConversationMessage,
  type KnowledgeArticle,
  type InsertKnowledgeArticle,
  type Attorney,
  type InsertAttorney,
  type User,
  type UpsertUser,
  RequestStatus,
  RequestCategory,
  legalRequests,
  conversationMessages,
  knowledgeArticles,
  attorneys,
  users
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, sql, or, ilike } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  createLegalRequest(request: InsertLegalRequest): Promise<LegalRequest>;
  getLegalRequest(id: string): Promise<LegalRequest | undefined>;
  getAllLegalRequests(): Promise<LegalRequest[]>;
  getUserLegalRequests(userId: string): Promise<LegalRequest[]>;
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

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createLegalRequest(insertRequest: InsertLegalRequest): Promise<LegalRequest> {
    const referenceNumber = `REQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;
    
    const [request] = await db
      .insert(legalRequests)
      .values({
        ...insertRequest,
        referenceNumber
      })
      .returning();
    
    return request;
  }

  async getLegalRequest(id: string): Promise<LegalRequest | undefined> {
    const [request] = await db
      .select()
      .from(legalRequests)
      .where(eq(legalRequests.id, id));
    
    return request || undefined;
  }

  async getAllLegalRequests(): Promise<LegalRequest[]> {
    const requests = await db
      .select()
      .from(legalRequests)
      .orderBy(desc(legalRequests.createdAt));
    
    return requests;
  }

  async getUserLegalRequests(userId: string): Promise<LegalRequest[]> {
    const requests = await db
      .select()
      .from(legalRequests)
      .where(eq(legalRequests.userId, userId))
      .orderBy(desc(legalRequests.createdAt));
    
    return requests;
  }

  async updateLegalRequest(id: string, updates: Partial<LegalRequest>): Promise<LegalRequest | undefined> {
    const [updated] = await db
      .update(legalRequests)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(legalRequests.id, id))
      .returning();
    
    return updated || undefined;
  }

  async createConversationMessage(insertMessage: InsertConversationMessage): Promise<ConversationMessage> {
    const [message] = await db
      .insert(conversationMessages)
      .values(insertMessage)
      .returning();
    
    return message;
  }

  async getConversationMessages(requestId: string): Promise<ConversationMessage[]> {
    const messages = await db
      .select()
      .from(conversationMessages)
      .where(eq(conversationMessages.requestId, requestId))
      .orderBy(conversationMessages.createdAt);
    
    return messages;
  }

  async getAllKnowledgeArticles(): Promise<KnowledgeArticle[]> {
    const articles = await db
      .select()
      .from(knowledgeArticles)
      .orderBy(desc(knowledgeArticles.viewCount));
    
    return articles;
  }

  async getKnowledgeArticleBySlug(slug: string): Promise<KnowledgeArticle | undefined> {
    const [article] = await db
      .select()
      .from(knowledgeArticles)
      .where(eq(knowledgeArticles.slug, slug));
    
    return article || undefined;
  }

  async searchKnowledgeArticles(query: string): Promise<KnowledgeArticle[]> {
    const articles = await db
      .select()
      .from(knowledgeArticles)
      .where(
        or(
          ilike(knowledgeArticles.title, `%${query}%`),
          ilike(knowledgeArticles.excerpt, `%${query}%`),
          ilike(knowledgeArticles.content, `%${query}%`)
        )
      );
    
    return articles;
  }

  async updateArticleStats(id: string, helpful: boolean): Promise<void> {
    if (helpful) {
      await db
        .update(knowledgeArticles)
        .set({
          helpfulCount: sql`${knowledgeArticles.helpfulCount} + 1`
        })
        .where(eq(knowledgeArticles.id, id));
    } else {
      await db
        .update(knowledgeArticles)
        .set({
          notHelpfulCount: sql`${knowledgeArticles.notHelpfulCount} + 1`
        })
        .where(eq(knowledgeArticles.id, id));
    }
  }

  async getAllAttorneys(): Promise<Attorney[]> {
    const attorneyList = await db.select().from(attorneys);
    return attorneyList;
  }

  async getAttorney(id: string): Promise<Attorney | undefined> {
    const [attorney] = await db
      .select()
      .from(attorneys)
      .where(eq(attorneys.id, id));
    
    return attorney || undefined;
  }

  async getAvailableAttorneys(): Promise<Attorney[]> {
    const availableAttorneys = await db
      .select()
      .from(attorneys)
      .where(eq(attorneys.availability, "available"))
      .orderBy(attorneys.activeRequestCount);
    
    return availableAttorneys;
  }
}

export const storage = new DatabaseStorage();
