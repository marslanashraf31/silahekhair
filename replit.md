# Silah Foundation Website

## Overview

This project is a React 19 + TypeScript + Vite website for Silah Foundation. It includes the public organization website plus member and admin portal routes.

## Running on Replit

The app is configured with a `Start application` workflow that serves the Vite development server on port 5000:

```bash
npm install
npm run dev -- --port 5000
```

The homepage is available at `/`. Other public routes include `/about`, `/our-work`, `/impact`, `/transparency`, `/gallery`, `/updates`, and `/contact`.

## Environment

Supabase configuration is documented in `.env.example`. The optional `GEMINI_API_KEY` is only needed for features that call Gemini.

## Admin authentication and membership applications

The admin portal uses Supabase Auth. Create the administrator under
Supabase Dashboard → Authentication → Users, then set that user's
`raw_app_meta_data` to include `{"role":"admin"}` in the Supabase SQL Editor.
The membership application policies allow public visitors to submit an
application, while only that admin role can read, approve, reject, or delete
applications.