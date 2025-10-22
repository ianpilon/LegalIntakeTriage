import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess", { mode: 'json' }).notNull(),
    expire: integer("expire", { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire),
  }),
);

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: text("role").notNull().default("requester"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Request categories
export const RequestCategory = {
  CONTRACT_REVIEW: "contract_review",
  MARKETING: "marketing",
  PARTNERSHIP: "partnership",
  EMPLOYMENT: "employment",
  REGULATORY: "regulatory",
  IP: "ip",
  OTHER: "other"
} as const;

export type RequestCategoryType = typeof RequestCategory[keyof typeof RequestCategory];

// Request status
export const RequestStatus = {
  SUBMITTED: "submitted",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  AWAITING_INFO: "awaiting_info",
  TRIAGED: "triaged",
  IN_REVIEW: "in_review",
  COMPLETED: "completed"
} as const;

export type RequestStatusType = typeof RequestStatus[keyof typeof RequestStatus];

// Request urgency
export const RequestUrgency = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent"
} as const;

export type RequestUrgencyType = typeof RequestUrgency[keyof typeof RequestUrgency];

// Triage outcome types
export const TriageOutcome = {
  NEEDS_REVIEW: "needs_review",
  MIGHT_NEED: "might_need",
  LIKELY_FINE: "likely_fine",
  SELF_SERVICE: "self_service"
} as const;

export type TriageOutcomeType = typeof TriageOutcome[keyof typeof TriageOutcome];

// Legal requests table
export const legalRequests = sqliteTable("legal_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id),
  referenceNumber: text("reference_number").notNull().unique(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default(RequestStatus.SUBMITTED),
  urgency: text("urgency").notNull().default(RequestUrgency.MEDIUM),
  urgencyReason: text("urgency_reason"),
  assignedAttorneyId: text("assigned_attorney_id"),
  fileUrls: text("file_urls", { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  metadata: text("metadata", { mode: 'json' }).$type<Record<string, any>>().default(sql`'{}'`),
  aiSummary: text("ai_summary"),
  submitterName: text("submitter_name").notNull(),
  submitterEmail: text("submitter_email").notNull(),
  submitterTeam: text("submitter_team"),
  expectedTimeline: text("expected_timeline"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Conversation messages (for guided discovery)
export const conversationMessages = sqliteTable("conversation_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  requestId: text("request_id"),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  metadata: text("metadata", { mode: 'json' }).$type<Record<string, any>>().default(sql`'{}'`),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Knowledge base articles
export const knowledgeArticles = sqliteTable("knowledge_articles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  category: text("category").notNull(),
  tags: text("tags", { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  embedding: text("embedding", { mode: 'json' }).$type<number[]>(),
  viewCount: integer("view_count").notNull().default(0),
  helpfulCount: integer("helpful_count").notNull().default(0),
  notHelpfulCount: integer("not_helpful_count").notNull().default(0),
  readTime: integer("read_time").notNull(), // in minutes
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Attorneys
export const attorneys = sqliteTable("attorneys", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  title: text("title").notNull(),
  photoUrl: text("photo_url"),
  expertise: text("expertise", { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  availability: text("availability").notNull().default("available"), // available, busy, unavailable
  activeRequestCount: integer("active_request_count").notNull().default(0)
});

// Insert schemas
export const insertLegalRequestSchema = createInsertSchema(legalRequests).omit({
  id: true,
  referenceNumber: true,
  createdAt: true,
  updatedAt: true
});

export const insertConversationMessageSchema = createInsertSchema(conversationMessages).omit({
  id: true,
  createdAt: true
});

export const insertKnowledgeArticleSchema = createInsertSchema(knowledgeArticles).omit({
  id: true,
  viewCount: true,
  helpfulCount: true,
  notHelpfulCount: true,
  createdAt: true,
  updatedAt: true
});

export const insertAttorneySchema = createInsertSchema(attorneys).omit({
  id: true,
  activeRequestCount: true
});

// Types
export type LegalRequest = typeof legalRequests.$inferSelect;
export type InsertLegalRequest = z.infer<typeof insertLegalRequestSchema>;

export type ConversationMessage = typeof conversationMessages.$inferSelect;
export type InsertConversationMessage = z.infer<typeof insertConversationMessageSchema>;

export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect;
export type InsertKnowledgeArticle = z.infer<typeof insertKnowledgeArticleSchema>;

export type Attorney = typeof attorneys.$inferSelect;
export type InsertAttorney = z.infer<typeof insertAttorneySchema>;
