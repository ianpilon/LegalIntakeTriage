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
import { eq, desc, sql, or, like } from "drizzle-orm";

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
  getKnowledgeArticle(id: string): Promise<KnowledgeArticle | undefined>;
  searchKnowledgeArticles(query: string): Promise<KnowledgeArticle[]>;
  createKnowledgeArticle(article: InsertKnowledgeArticle): Promise<KnowledgeArticle>;
  updateKnowledgeArticle(id: string, updates: Partial<KnowledgeArticle>): Promise<KnowledgeArticle | undefined>;
  updateArticleEmbedding(id: string, embedding: number[]): Promise<void>;
  deleteKnowledgeArticle(id: string): Promise<void>;
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

  async getKnowledgeArticle(id: string): Promise<KnowledgeArticle | undefined> {
    const [article] = await db
      .select()
      .from(knowledgeArticles)
      .where(eq(knowledgeArticles.id, id));
    
    return article || undefined;
  }

  async createKnowledgeArticle(insertArticle: InsertKnowledgeArticle): Promise<KnowledgeArticle> {
    const [article] = await db
      .insert(knowledgeArticles)
      .values(insertArticle)
      .returning();
    
    return article;
  }

  async updateKnowledgeArticle(id: string, updates: Partial<KnowledgeArticle>): Promise<KnowledgeArticle | undefined> {
    const [updated] = await db
      .update(knowledgeArticles)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(knowledgeArticles.id, id))
      .returning();

    return updated || undefined;
  }

  async updateArticleEmbedding(id: string, embedding: number[]): Promise<void> {
    await db
      .update(knowledgeArticles)
      .set({ embedding })
      .where(eq(knowledgeArticles.id, id));
  }

  async deleteKnowledgeArticle(id: string): Promise<void> {
    await db
      .delete(knowledgeArticles)
      .where(eq(knowledgeArticles.id, id));
  }

  async searchKnowledgeArticles(query: string): Promise<KnowledgeArticle[]> {
    // This method now supports semantic search
    // It will be called from routes with semantic flag
    const lowerQuery = query.toLowerCase();
    const searchTerms = lowerQuery.split(/\s+/).filter(term => term.length > 2);

    if (searchTerms.length === 0) {
      return [];
    }

    // Search for articles that contain ANY of the search terms
    const allArticles = await db.select().from(knowledgeArticles);

    const scoredArticles = allArticles.map(article => {
      let score = 0;
      const articleText = `${article.title} ${article.excerpt} ${article.content} ${article.tags.join(' ')}`.toLowerCase();

      searchTerms.forEach(term => {
        // Count occurrences of each term
        const titleMatches = (article.title.toLowerCase().match(new RegExp(term, 'g')) || []).length;
        const excerptMatches = (article.excerpt.toLowerCase().match(new RegExp(term, 'g')) || []).length;
        const tagsMatches = article.tags.join(' ').toLowerCase().includes(term) ? 1 : 0;
        const contentMatches = (article.content.toLowerCase().match(new RegExp(term, 'g')) || []).length;

        // Weight title and tags matches higher
        score += titleMatches * 10;
        score += tagsMatches * 5;
        score += excerptMatches * 3;
        score += contentMatches * 1;
      });

      return { article, score };
    });

    // Return articles with score > 0, sorted by score
    return scoredArticles
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.article);
  }

  async semanticSearchKnowledgeArticles(queryEmbedding: number[], limit: number = 5): Promise<Array<KnowledgeArticle & { similarity: number }>> {
    const allArticles = await db.select().from(knowledgeArticles);

    // Filter articles that have embeddings
    const articlesWithEmbeddings = allArticles.filter(article => article.embedding && article.embedding.length > 0);

    if (articlesWithEmbeddings.length === 0) {
      console.log("[Semantic Search] No articles with embeddings found");
      return [];
    }

    // Calculate cosine similarity for each article
    const { cosineSimilarity } = await import("./openai");

    const scoredArticles = articlesWithEmbeddings.map(article => {
      const similarity = cosineSimilarity(queryEmbedding, article.embedding!);
      return { ...article, similarity };
    });

    // Sort by similarity (highest first) and return top results
    return scoredArticles
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
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
