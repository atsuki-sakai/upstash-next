# Upstash Next.js Demo

This project demonstrates the integration of [Upstash](https://upstash.com) services with [Next.js 15](https://nextjs.org), showcasing:
- **Upstash Redis**: Key-value storage
- **Upstash Vector**: Vector database with embedding support
- **Upstash Workflow**: QStash-based workflow orchestration with step functions

## Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Upstash account with Redis, Vector, and QStash services configured

## Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or 
pnpm install
```

### 2. Environment Setup

Copy and configure your environment variables:
```bash
cp .env.example .env.local
```

Required environment variables:
```bash
# Redis
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Vector
UPSTASH_VECTOR_REST_URL=your_vector_url
UPSTASH_VECTOR_REST_TOKEN=your_vector_token

# QStash (for Workflow)
QSTASH_URL=your_qstash_url
QSTASH_TOKEN=your_qstash_token

# Weather API (for demo)
WEATHER_API_KEY=your_weather_api_key
```

### 3. Start Development Servers

**For Workflow functionality, you need TWO servers running:**

**Terminal 1 - QStash Local Server:**
```bash
npx @upstash/qstash-cli dev
```

**Terminal 2 - Next.js Development Server:**
```bash
npm run dev
```

### 4. Access the Application

Open [http://localhost:3000](http://localhost:3000) to see the demo with three sections:
- **Redis**: Key-value operations demo
- **Vector**: Similarity search and embeddings
- **Workflow**: Multi-step workflow with progress tracking

## Features

### 🔄 Upstash Workflow with Progress Tracking
- **Real-time step progress**: Visual progress bar and step-by-step execution tracking
- **Multi-step workflow**: 3-step workflow with sleep functionality demonstration
- **Status monitoring**: Live status updates via polling API
- **Error handling**: Comprehensive error states and retry logic

### 📊 Upstash Vector
- **Similarity search**: Vector-based content search
- **Metadata filtering**: Custom filtering with structured data
- **Text and vector queries**: Support for both text-based and vector-based operations

### 🔗 Upstash Redis  
- **Key-value operations**: Get, set, delete operations
- **Real-time updates**: Live data synchronization

## Development Commands

```bash
# Start development server
npm run dev

# Start QStash local server (required for workflow testing)
npx @upstash/qstash-cli dev

# Build for production
npm run build

# Start production server  
npm start

# Run linting
npm run lint
```

## Project Structure

```
app/
├── api/              # API Routes
│   ├── vector/       # Vector database operations
│   ├── weather/      # Weather API integration
│   └── workflow/     # Workflow endpoints & progress tracking
├── lib/
│   └── schemas/      # Zod validation schemas
├── redis/           # Redis demo page
├── vector/          # Vector search demo page
└── workflow/        # Workflow demo with progress tracking
```

## Workflow Progress Tracking

The workflow system includes comprehensive progress tracking:

1. **Start Workflow**: Initiates a 3-step workflow process
2. **Real-time Progress**: 2-second polling updates showing:
   - Overall progress percentage
   - Individual step status and names  
   - Workflow completion state
3. **Visual Feedback**: Color-coded status indicators and progress bars

## Environment Configuration

### Local Development (Important!)
For **Workflow development**, never include signature keys in `.env.local`:

```bash
# ❌ DON'T include these in local development:
# QSTASH_CURRENT_SIGNING_KEY=...
# QSTASH_NEXT_SIGNING_KEY=...

# ✅ Use local QStash server instead:
QSTASH_URL="http://127.0.0.1:8080"  
QSTASH_TOKEN="<local_development_token>"
```

**Why?** Signature keys cause "Failed to verify Workflow request" errors when testing endpoints directly in local development.

## Troubleshooting

### Workflow Issues

**"Failed to verify Workflow request" error:**
1. Ensure QStash local server is running: `npx @upstash/qstash-cli dev`
2. Check `.env.local` doesn't contain signature keys
3. Restart Next.js development server
4. Verify both servers are running simultaneously

**500 Internal Server Error on workflow:**
1. Confirm QStash local server is accessible at `http://127.0.0.1:8080`
2. Check environment variables in `.env.local`
3. Look for "fetch failed" errors in server logs

### General Issues

**Build errors with `asChild` prop:**
- This occurs when UI components don't support Radix UI's `asChild` prop
- Use Link wrapper around Button components instead

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
