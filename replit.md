# Dinopedia

A dinosaur encyclopedia web app built with React, Vite, TypeScript, Tailwind CSS, and shadcn/ui components.

## Project Structure

- `src/pages/` — Main pages: Index (encyclopedia), DinosaurPage, ComparePage, DinoIdentifier, NotFound
- `src/components/` — Shared components including DinosaurCard, Navbar, timeline, map, model viewer, etc.
- `src/components/ui/` — shadcn/ui component library
- `src/data/` — Dinosaur data (dinosaurs.ts, dinosaurs-extended.ts, types.ts)
- `src/hooks/` — Custom React hooks
- `src/assets/` — Static image assets

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build tool**: Vite 5
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI)
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## Development

Run the dev server:
```
npm run dev
```

The app runs on port 5000.

## Notes

- Migrated from Lovable to Replit — `lovable-tagger` plugin removed from vite.config.ts
- Vite configured with `host: "0.0.0.0"` and `allowedHosts: true` for Replit proxy compatibility
