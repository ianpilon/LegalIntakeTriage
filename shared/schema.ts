import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").notNull().default("requester"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
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
export const legalRequests = pgTable("legal_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  referenceNumber: text("reference_number").notNull().unique(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default(RequestStatus.SUBMITTED),
  urgency: text("urgency").notNull().default(RequestUrgency.MEDIUM),
  urgencyReason: text("urgency_reason"),
  assignedAttorneyId: text("assigned_attorney_id"),
  fileUrls: jsonb("file_urls").$type<string[]>().default([]),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  aiSummary: text("ai_summary"),
  submitterName: text("submitter_name").notNull(),
  submitterEmail: text("submitter_email").notNull(),
  submitterTeam: text("submitter_team"),
  expectedTimeline: text("expected_timeline"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Conversation messages (for guided discovery)
export const conversationMessages = pgTable("conversation_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: text("request_id"),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Knowledge base articles
export const knowledgeArticles = pgTable("knowledge_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  category: text("category").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  viewCount: integer("view_count").notNull().default(0),
  helpfulCount: integer("helpful_count").notNull().default(0),
  notHelpfulCount: integer("not_helpful_count").notNull().default(0),
  readTime: integer("read_time").notNull(), // in minutes
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Attorneys
export const attorneys = pgTable("attorneys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  title: text("title").notNull(),
  photoUrl: text("photo_url"),
  expertise: jsonb("expertise").$type<string[]>().default([]),
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
