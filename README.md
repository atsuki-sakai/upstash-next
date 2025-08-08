This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Upstash Workflow Setup

### Local Development

1. **Start QStash local server:**
   ```bash
   npx @upstash/qstash-cli dev
   ```

2. **Environment Configuration:**
   - `.env.local` overrides `.env` settings for local development
   - **🚨 Important:** Never include `QSTASH_CURRENT_SIGNING_KEY` and `QSTASH_NEXT_SIGNING_KEY` in local development
   - Signature keys cause "Failed to verify Workflow request" errors when calling endpoints directly
   - Refer to comments in `.env` file for detailed explanation

3. **Test Workflow:**
   - Visit `http://localhost:3000/workflow`
   - Click "Start Workflow" button

### Troubleshooting

If you see `Failed to verify that the Workflow request comes from QStash` error:
1. Check both `.env` and `.env.local` files
2. Ensure signature keys are commented out or removed
3. Restart Next.js development server
4. Use `grep -r "QSTASH_CURRENT_SIGNING_KEY" . --exclude-dir=node_modules` to find any remaining references

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
