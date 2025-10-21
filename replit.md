# Legal Intake & Triage Platform

## Overview

A conversational AI-powered legal intake and triage platform that intelligently routes legal requests based on user confidence levels. The system features two distinct paths: a fast-track "Direct Path" for confident users who know exactly what they need, and a "Guided Discovery" conversational flow for users who need help articulating their legal needs. The platform uses AI to analyze confidence levels, perform automated triage, detect urgency, and route requests to appropriate attorneys while providing self-service resources through an integrated knowledge base.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript using Vite as the build tool and development server
- React Router implemented via Wouter for lightweight client-side routing
- Component library based on shadcn/ui (Radix UI primitives with custom styling)

**State Management**
- TanStack Query (React Query) for server state management, data fetching, and caching
- Local component state via React hooks for UI-specific concerns
- No global state management library - data flows through React Query cache

**Design System**
- Tailwind CSS with custom design tokens following a modern enterprise aesthetic inspired by Linear, Notion, and Asana
- Custom color palette with semantic meanings (success for knowledge base resolutions, warning for "might need review", info for "likely fine", urgent for high priority)
- Component variants using class-variance-authority for consistent styling patterns
- Dark mode support via CSS variables and class-based theme switching

**Key UI Patterns**
- Adaptive confidence-based routing: AI analyzes initial input to determine whether user should see Direct Path or Guided Discovery
- Conversational interface with chat-style message rendering for guided discovery
- Status timeline visualization showing request progression through submission, triage, review, and completion stages
- Attorney cards with avatar fallbacks displaying expertise and expected response times

### Backend Architecture

**Server Framework**
- Express.js running on Node.js with TypeScript
- ESM module system (type: "module" in package.json)
- Custom Vite middleware integration for development hot module replacement
- API-first design with JSON request/response format

**API Structure**
- RESTful endpoints under `/api/*` namespace
- Confidence analysis endpoint: POST `/api/analyze-confidence` - determines user confidence level
- Request management: POST `/api/requests`, GET `/api/requests`
- Conversation system: POST `/api/conversation` - handles guided discovery chat
- Triage system: POST `/api/triage` - performs automated legal assessment
- Knowledge base: GET `/api/knowledge` with search and category filtering

**OpenAI Integration**
- GPT-4-mini model for all AI operations
- Confidence analysis: Examines user input to determine if they're confident (specific terminology, clear needs) vs. uncertain (vague language, questions)
- Triage assessment: Categorizes requests into needs_review, might_need, likely_fine, or self_service outcomes
- Urgency detection: Assigns low/medium/high/urgent priority levels based on content analysis
- Conversation generation: Powers the guided discovery chat experience
- Request summarization: Creates AI-generated summaries of legal requests

**Business Logic Layer**
- Attorney routing logic matches request categories with attorney expertise
- Expected timeline calculation based on urgency levels (urgent: 24hrs, high: 2-3 days, medium: 3-5 days, low: 1-2 weeks)
- Reference number generation for request tracking
- Article relevance matching for self-service suggestions

### Data Storage Solutions

**Current Implementation: In-Memory Storage**
- MemStorage class implementing IStorage interface provides temporary persistence
- Maps for storing legal requests, conversation messages, knowledge articles, and attorney profiles
- Seeded with sample data on initialization for demonstration purposes
- Data does not persist across server restarts

**Schema Design (Drizzle ORM)**
- Configured for PostgreSQL via Neon serverless driver
- Database schema defined in `shared/schema.ts` using Drizzle ORM table definitions
- Legal requests table with fields for title, description, category, status, urgency, AI summary, assigned attorney, and metadata
- Conversation messages table linked to requests via foreign key
- Knowledge articles table with category, content, helpful/not helpful counts for feedback
- Attorney profiles table with expertise arrays and availability status
- Zod schemas auto-generated from Drizzle tables for runtime validation

**Migration Strategy**
- Drizzle Kit configured with migrations output directory
- `db:push` script available for schema synchronization
- DATABASE_URL environment variable required for connection

### Authentication and Authorization

**Current State: Not Implemented**
- No authentication layer currently present
- No session management or user identity tracking
- Express session middleware (connect-pg-simple) included in dependencies but not configured
- Future implementation would likely use session-based auth given the enterprise context

**Planned Authorization Model**
- User role differentiation needed between requesters and legal team
- Attorney-specific views for legal inbox functionality
- Request ownership validation to ensure users can only view their own submissions

### External Dependencies

**AI Services**
- OpenAI API (GPT-4-mini model) via official SDK
- Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`
- Used for confidence analysis, triage, urgency detection, conversation generation, and summarization

**Database**
- Neon serverless PostgreSQL (configured but not actively used in current memory-based implementation)
- Connection via `@neondatabase/serverless` driver
- Environment variable: `DATABASE_URL`

**UI Component Library**
- Radix UI primitives for accessible, unstyled components
- Full suite including dialogs, dropdowns, popovers, accordions, tooltips, etc.
- Wrapped with custom styling via shadcn/ui configuration

**Development Tools**
- Replit-specific plugins for development experience (error overlay, cartographer, dev banner)
- TypeScript compiler for type checking
- Vite plugin for React with Fast Refresh

**Styling & Utilities**
- Tailwind CSS for utility-first styling
- PostCSS with autoprefixer for cross-browser compatibility
- clsx and tailwind-merge for conditional class composition
- class-variance-authority for component variant management

**Date Handling**
- date-fns for date formatting and manipulation

**Form Management**
- React Hook Form for form state management
- @hookform/resolvers for Zod schema validation integration

**Icons**
- Lucide React for consistent iconography throughout the application