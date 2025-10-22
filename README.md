# Legal Intake & Triage System

An AI-powered legal intake and triage application that helps route legal requests to the appropriate resources. Built with React, TypeScript, Express, and SQLite.

## Features

- **Dual Entry Paths**
  - Fast-Track Request: For users who know what they need
  - Guided Discovery: AI-powered conversation to help identify needs

- **AI-Powered Triage**
  - Intelligent routing based on request type
  - Knowledge base integration
  - Urgency detection
  - Automatic attorney assignment

- **Request Management**
  - Track request status and progress
  - File attachments support
  - Timeline visualization
  - Admin dashboard for legal team

- **Configurable AI Providers**
  - Support for OpenAI, Anthropic, Google, and Azure OpenAI
  - Secure API key management
  - Local storage with encryption

## Architecture

### Frontend (GitHub Pages)
- React + TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Wouter for routing

### Backend (Your Local Machine)
- Express.js server
- SQLite database
- OpenAI-compatible API integration
- ngrok for public access

## Setup Instructions

### Option 1: Full Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/LegalIntakeTriage.git
   cd LegalIntakeTriage
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

### Option 2: GitHub Pages Frontend + Local Backend

This setup allows others to access the frontend via GitHub Pages while you run the backend locally.

#### Backend Setup (Your Computer)

1. **Start the backend server**
   ```bash
   npm run dev
   ```

2. **Install ngrok** (if not already installed)
   ```bash
   # macOS
   brew install ngrok

   # Or download from https://ngrok.com/download
   ```

3. **Expose your local server**
   ```bash
   ngrok http 5000
   ```

4. **Copy the ngrok URL**
   ngrok will display a URL like: `https://abc123.ngrok.io`
   Share this URL with testers - they'll need it to configure the app.

#### Frontend Setup (Testers)

1. **Visit the GitHub Pages site**
   Navigate to: `https://YOUR_USERNAME.github.io/LegalIntakeTriage`

2. **Configure the backend URL**
   - Go to Settings
   - Enter the ngrok URL provided by the backend host
   - Save configuration

3. **Configure AI Provider (Optional)**
   - Go to Settings
   - Select your preferred AI provider (OpenAI, Anthropic, etc.)
   - Enter your API key
   - Save configuration

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS
- **Wouter** - Lightweight router
- **TanStack Query** - Data fetching and caching
- **Radix UI** - Accessible component primitives

### Backend
- **Express** - Web framework
- **SQLite** - Embedded database
- **Better-SQLite3** - Synchronous SQLite driver
- **Drizzle ORM** - TypeScript ORM
- **OpenAI SDK** - AI integration

## Project Structure

```
LegalIntakeTriage/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React contexts (User, Role, LLM)
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Utility functions
│   │   └── hooks/       # Custom React hooks
│   └── index.html
├── server/              # Backend Express application
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API routes
│   ├── openai.ts       # AI integration
│   └── storage.ts      # Database layer
├── db/                  # Database schema and migrations
└── shared/             # Shared types between frontend and backend
```

## API Routes

### Requests
- `POST /api/requests` - Create a new request
- `GET /api/requests` - List all requests
- `GET /api/requests/:id` - Get request details
- `POST /api/requests/:id/accept` - Accept a request
- `POST /api/requests/:id/decline` - Decline a request
- `POST /api/requests/:id/reassign` - Reassign to another attorney

### Conversation
- `POST /api/conversation` - Send a message in guided discovery
- `POST /api/triage` - Perform AI triage on conversation

### Knowledge Base
- `GET /api/knowledge` - List all knowledge articles
- `GET /api/knowledge/:slug` - Get article by slug
- `POST /api/knowledge` - Create new article (admin)
- `PUT /api/knowledge/:id` - Update article (admin)
- `DELETE /api/knowledge/:id` - Delete article (admin)

### Attorneys
- `GET /api/attorneys/available` - List available attorneys

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# OpenAI Configuration (for Ollama compatibility)
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.1:8b
EMBEDDING_MODEL=nomic-embed-text

# Server Configuration
PORT=5000
```

### AI Provider Setup

The app supports multiple AI providers:

1. **OpenAI** - Requires API key from platform.openai.com
2. **Anthropic** - Requires API key from console.anthropic.com
3. **Google** - Requires API key from makersuite.google.com
4. **Azure OpenAI** - Requires endpoint and API key from Azure portal

Configure your preferred provider in Settings after launching the app.

## Development

### Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Database

The app uses SQLite with Drizzle ORM. The database is automatically created on first run.

To reset the database:
```bash
rm server/database.db
npm run dev
```

## Deployment

### GitHub Pages (Frontend Only)

1. **Update vite.config.ts** with your repo name (see below)
2. **Push to GitHub**
3. **Enable GitHub Pages** in repository settings
4. **Set up GitHub Actions** (automated via `.github/workflows/deploy.yml`)

### Full Stack Hosting

For production deployment with both frontend and backend:
- **Vercel/Netlify** - Frontend
- **Railway/Render** - Backend + Database
- **Fly.io** - Full-stack in one place

## Security Notes

- API keys are stored locally in browser localStorage with Base64 encoding
- For production, implement proper authentication and authorization
- Never commit `.env` files or API keys to the repository
- Use HTTPS for all external communications

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is for demonstration purposes.

## Support

For issues or questions, please open an issue on GitHub.
