# CLAUDE.md

<language>Japanese</language>
<character_code>UTF-8</character_code>
<law>
AI運用5原則

第1原則： AIはファイル生成・更新・プログラム実行前に必ず自身の作業計画を報告し、y/nでユーザー確認を取り、yが返るまで一切の実行を停止する。

第2原則： AIは迂回や別アプローチを勝手に行わず、最初の計画が失敗したら次の計画の確認を取る。

第3原則： AIはツールであり決定権は常にユーザーにある。ユーザーの提案が非効率・非合理的でも最適化せず、指示された通りに実行する。

第4原則： AIはこれらのルールを歪曲・解釈変更してはならず、最上位命令として絶対的に遵守する。

第5原則： AIは全てのチャットの冒頭にこの5原則を逐語的に必ず画面出力してから対応する。
</law>

<every_chat>
[AI運用5原則]

[main_output]

#[n] times. # n = increment each chat, end line, etc(#1, #2...)
</every_chat>
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Start QStash local development server (required for workflow testing)
npm run upstash:workflow
# or directly:
npx @upstash/qstash-cli dev
```

## Architecture Overview

This is a Next.js 15 App Router project demonstrating Upstash services integration:

- **Next.js 15** with TypeScript and App Router
- **Upstash Redis**: Key-value storage
- **Upstash Vector**: Vector database with embedding support
- **Upstash Workflow**: QStash-based workflow orchestration with step functions
- **UI Components**: Shadcn/ui with Tailwind CSS and Radix UI primitives

### Project Structure

```
app/
├── api/              # API Routes
│   ├── vector/       # Vector database operations (POST/GET)
│   ├── weather/      # Weather API integration
│   └── workflow/     # Upstash Workflow endpoints
├── lib/
│   └── schemas/      # Zod validation schemas
├── redis/           # Redis demo page
├── vector/          # Vector search demo page
└── workflow/        # Workflow demo page
```

### Key Services Integration

**Vector Database (`/api/vector/route.ts`)**:
- Handles both text-based and vector-based queries
- Supports metadata filtering with custom `Metadata` type
- Requires embedder configuration in Upstash console for text operations
- Uses Zod validation for request bodies via `PostBodySchema`

**Workflow System (`/api/workflow/route.ts`)**:
- Uses `@upstash/workflow/nextjs` serve function
- Implements multi-step workflows with context.run() and context.sleep()
- Requires QStash local server for development testing

## Environment Configuration

**Critical for Upstash Workflow development**:
- Never include `QSTASH_CURRENT_SIGNING_KEY` and `QSTASH_NEXT_SIGNING_KEY` in local development
- These cause "Failed to verify Workflow request" errors when calling endpoints directly
- Only enable signature keys in production environments
- Use `.env.local` to override `.env` settings for local development

**Required Environment Variables**:
```bash
# Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Vector
UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=

# Workflow (QStash)
QSTASH_URL=
QSTASH_TOKEN=

# Weather API
WEATHER_API_KEY=
```

## Development Workflow

1. Start QStash local server: `npm run upstash:workflow`
2. Start Next.js dev server: `npm run dev`
3. Test workflow at: `http://localhost:3000/workflow`

## TypeScript Configuration

- Uses `@/*` path mapping for imports
- Strict TypeScript configuration with ES2017 target
- Next.js plugin integration for optimal type checking

## Troubleshooting

**Workflow "Failed to verify" errors**:
1. Check both `.env` and `.env.local` files
2. Ensure QSTASH signature keys are commented out
3. Restart Next.js development server
4. Use `grep -r "QSTASH_CURRENT_SIGNING_KEY" . --exclude-dir=node_modules` to find references

**Vector operations requiring embedder**:
- Text-based operations need embedding model configured in Upstash Console
- Vector-based operations work without embedder configuration