# Silah-e-Khair Foundation

React + TypeScript + Vite website for Silah-e-Khair Foundation, including the
public website, Admin Portal, and Member Portal.

## Run locally

1. Copy `.env.example` to `.env` (or `.env.local`).
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the
   Supabase project used by this deployment.
3. Install dependencies with `npm install` or `bun install`.
4. Start the Vite development server:

   ```bash
   npm run dev
   ```

To create a production build, run `npm run build`.

The project is self-contained and does not require an AI Studio workspace,
session, or account-specific files.
