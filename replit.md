# Magic Patterns Vite Template - Project Documentation

## Overview
This is a React + TypeScript application built with Vite, using TailwindCSS for styling. The application appears to be a dashboard for tracking environmental challenges like air quality, heat, floods, and wildfires with trend analysis and geographic visualization.

**Current State:** Successfully configured and running in Replit environment
- ✅ Frontend server running on port 5000
- ✅ Vite configured for Replit proxy environment
- ✅ TypeScript compilation working
- ✅ Deployment configuration set up

## Recent Changes (September 17, 2025)
1. **Replit Environment Setup:**
   - Updated `vite.config.ts` to bind to `0.0.0.0:5000` with proper HMR configuration
   - Fixed React DOM render API (migrated from legacy `render` to `createRoot`)
   - Added proper TypeScript typing for callback functions
   - Cleaned up unused React imports

2. **PostgreSQL Database Integration:**
   - ✅ Set up Neon PostgreSQL database with proper connection
   - ✅ Created comprehensive database schema with proper constraints and relationships
   - ✅ Implemented storage layer with frontend-compatible interface mapping
   - ✅ Added foreign key constraints, unique constraints, and performance indexes
   - ✅ Tested full CRUD operations with type safety and data integrity

3. **Workflow Configuration:**
   - Set up "Frontend" workflow running `npm run dev` on port 5000
   - Configured deployment target as "autoscale" with build and preview commands

4. **Dependencies:**
   - All npm packages installed successfully
   - Added database dependencies: @neondatabase/serverless, drizzle-orm, drizzle-kit, ws
   - Minor security vulnerabilities noted but not blocking

## Project Architecture

### Frontend Structure
- **Entry Point:** `src/index.tsx` - React 18 createRoot pattern
- **Main App:** `src/App.tsx` - State management for routing and theme
- **Components:**
  - `AppShell` - Main layout wrapper
  - `filters/` - Various filter controls (country, score, search, etc.)
  - `table/` - Data visualization components
  - `ThemeProvider` - Dark/light theme support
- **Pages:**
  - `TrendingChallenges` - Main dashboard view
  - `ChallengeDetail` - Individual challenge details
  - `About` - Information page
  - `AdminConsole` - Administrative interface

### Backend/Database Structure
- **Database:** PostgreSQL (Neon) with Drizzle ORM
- **Schema:** `shared/schema.ts` - TypeScript database schema with enums and relations
- **Storage Layer:** `server/storage.ts` - Data access layer with frontend interface mapping
- **Database Connection:** `server/db.ts` - Neon WebSocket connection configuration
- **Configuration:** `drizzle.config.ts` - Drizzle Kit configuration for migrations

### Technology Stack
- **Framework:** React 18 with TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Build Tool:** Vite 5.2.0
- **Styling:** TailwindCSS 3.4.17 with custom theme colors
- **Routing:** Custom state-based routing (not React Router despite dependency)
- **Icons:** Lucide React
- **Linting:** ESLint with TypeScript rules

### Custom Theme Colors
- Primary: `#125C5C` (teal)
- Challenge-specific colors: Air Quality (blue), Heat (orange), Floods (cyan), Fire (red)
- Dark mode support enabled

## Configuration Files
- `vite.config.ts` - Vite development and build configuration
- `tailwind.config.js` - TailwindCSS theme and content configuration
- `tsconfig.json` - TypeScript compiler configuration
- `package.json` - Dependencies and scripts

## User Preferences
*No specific user preferences documented yet*

## Environment Notes
- Uses Replit's built-in Node.js environment
- Configured for Replit's proxy/iframe preview system
- No backend components - purely frontend application
- Mock data located in `src/data/mockData.tsx`