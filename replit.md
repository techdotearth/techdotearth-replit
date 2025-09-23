# Magic Patterns Vite Template - Project Documentation

## Overview
This is a React + TypeScript application built with Vite, using TailwindCSS for styling. The application appears to be a dashboard for tracking environmental challenges like air quality, heat, floods, and wildfires with trend analysis and geographic visualization.

**Current State:** Migrating from Express.js backend to Supabase Edge Functions architecture
- ✅ Frontend server running on port 5000
- ✅ Vite configured for Replit proxy environment
- ✅ TypeScript compilation working
- ✅ Deployment configuration set up
- 🔄 **CRITICAL MIGRATION IN PROGRESS:** Backend architecture change to Supabase

## Recent Changes (September 23, 2025)

### **🚨 MAJOR: Express.js → Supabase Edge Functions Migration (IN PROGRESS)**

**Migration Status:**
- ✅ **Database Migration:** Successfully migrated from Neon PostgreSQL to Supabase PostgreSQL
- ✅ **Schema Sync:** All tables (challenges, aq_observations) migrated using Drizzle
- ✅ **SQL Views:** Created v_leaderboard view for leaderboard queries
- ✅ **Edge Functions:** Created 4 Supabase edge functions (public-api, admin-api, ingestion-api, air-quality-ingestion)
- ✅ **Frontend Update:** Updated ApiService to use Supabase client with fallback to edge functions
- ✅ **RLS Setup:** Enabled Row Level Security with public read policies for challenges and aq_observations
- 🔄 **Security Issues:** Identified critical issues requiring immediate attention:
  - ❌ Static 'admin-token' authentication (security vulnerability)
  - ❌ Inconsistent challenge type mapping between frontend and backend
  - ❌ Syntax errors in air-quality-ingestion function
  - ❌ Missing proper JWT verification for admin functions

**Architecture Decision:** 
- **From:** Express.js + Node.js backend (port 3001)
- **To:** Supabase Edge Functions (Deno runtime) + Direct Supabase queries

**Critical Issues Found by Architect Review:**
1. **Challenge Type Inconsistency:** Frontend uses 'air-quality' while some backend parts expect 'air_quality'
2. **Security Vulnerability:** Static 'admin-token' instead of proper JWT verification
3. **Data Mapping Issues:** Field mismatches in convertSupabaseToChallenge function
4. **RLS Not Fully Configured:** Public functions need proper auth policies

**Next Steps:**
1. Fix challenge type mapping consistency (air_quality vs air-quality)
2. Implement proper Supabase Auth with JWT verification
3. Remove static admin tokens and use service role securely
4. Complete ingestion function fixes and testing

## Previous Changes (September 17, 2025)
### Air Quality Data Ingestion System
1. **Complete Ingestion Pipeline:**
   - ✅ EEA and OpenAQ API clients with fallback logic
   - ✅ Hourly cron scheduler (0 * * * *) with manual trigger endpoint
   - ✅ OpenAQ v2 → v3 API migration with proper authentication
   - ✅ Data deduplication, UTC normalization, and persistence mechanisms
   - ✅ End-to-end testing with comprehensive error handling

2. **OpenAQ Rate Limiting Solution:**
   - ✅ **Intelligent rate limiter** respecting 60/min and 2000/hour limits
   - ✅ **Bulk API optimization** - reduced from hundreds to ~3-5 API calls
   - ✅ **429 error handling** with automatic retry and wait logic
   - ✅ **Production-ready batching** with conservative limits and monitoring
   - ✅ **Fallback strategy** for individual sensor requests when needed
   - ⚠️ **Requires OPENAQ_API_KEY** environment variable for operation

3. **Replit Environment Setup:**
   - Updated `vite.config.ts` to bind to `0.0.0.0:5000` with proper HMR configuration
   - Fixed React DOM render API (migrated from legacy `render` to `createRoot`)
   - Added proper TypeScript typing for callback functions
   - Cleaned up unused React imports

4. **PostgreSQL Database Integration:**
   - ✅ Set up Neon PostgreSQL database with proper connection (NOW MIGRATED TO SUPABASE)
   - ✅ Created comprehensive database schema with proper constraints and relationships
   - ✅ Implemented storage layer with frontend-compatible interface mapping
   - ✅ Added foreign key constraints, unique constraints, and performance indexes
   - ✅ Tested full CRUD operations with type safety and data integrity

## Project Architecture

### Frontend Structure
- **Entry Point:** `src/index.tsx` - React 18 createRoot pattern
- **Main App:** `src/App.tsx` - State management for routing and theme
- **API Layer:** `src/services/api.ts` - **MIGRATED** to use Supabase client + edge functions
- **Supabase Integration:** `src/services/supabase.ts` - Supabase client configuration
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

### Backend/Database Structure (MIGRATED TO SUPABASE)
- **Database:** Supabase PostgreSQL with Row Level Security enabled
- **Schema:** `shared/schema.ts` - TypeScript database schema with enums and relations
- **Edge Functions:** `supabase/functions/` - Serverless Deno functions replacing Express endpoints
  - `public-api/` - Public leaderboard and challenge detail endpoints
  - `admin-api/` - Administrative override functions
  - `ingestion-api/` - Score computation and data processing
  - `air-quality-ingestion/` - Automated air quality data ingestion
- **SQL Views:** `v_leaderboard` - Optimized views for frontend queries
- **Configuration:** `supabase/config.toml` - Supabase project configuration

### Technology Stack
- **Framework:** React 18 with TypeScript
- **Database:** Supabase PostgreSQL with RLS
- **Backend:** Supabase Edge Functions (Deno runtime)
- **API Client:** @supabase/supabase-js
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
- `supabase/config.toml` - Supabase project configuration
- `.env.example` - Environment variable template

## User Preferences
*No specific user preferences documented yet*

## Environment Notes
- Uses Replit's built-in Node.js environment
- Configured for Replit's proxy/iframe preview system
- **Migrating from Express backend to Supabase Edge Functions**
- Mock data located in `src/data/mockData.tsx`
- **Environment Variables Required:**
  - `VITE_SUPABASE_URL` - Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` - Supabase anon public key
  - `DATABASE_URL` - Supabase database URL (in secrets)
  - `OPENAQ_API_KEY` - OpenAQ API key for ingestion (in secrets)