# Binance Trading Bot - Replit Configuration

## Overview

This is a full-stack cryptocurrency trading application built with React, Express, and PostgreSQL. The application provides a comprehensive trading dashboard for Binance cryptocurrency trading with real-time market data, automated trading strategies, portfolio management, and secure API credential handling.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API**: RESTful API with WebSocket support for real-time data
- **Session Management**: Express sessions with PostgreSQL storage
- **External API**: Binance API integration for trading operations

### Data Storage
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Local Storage**: IndexedDB for client-side credential caching
- **Session Store**: PostgreSQL-backed session storage

## Key Components

### Database Schema
- **Users**: User authentication and management
- **API Credentials**: Secure storage of Binance API keys per user
- **Strategies**: Trading strategy configurations and rules
- **Orders**: Order tracking and execution history
- **Portfolio**: Real-time portfolio balance and holdings

### Real-time Features
- **WebSocket Integration**: Live price feeds from Binance
- **Price Monitoring**: Real-time cryptocurrency price updates
- **Strategy Execution**: Automated trading based on predefined rules
- **Portfolio Updates**: Live balance and PnL tracking

### Security Features
- **API Key Encryption**: Secure storage of Binance credentials
- **Session Management**: Secure user sessions with PostgreSQL backing
- **Input Validation**: Zod schema validation for all API inputs
- **Error Handling**: Comprehensive error handling and logging

### Trading Features
- **Strategy Management**: Create, edit, and manage trading strategies
- **Order Execution**: Automated buy/sell order placement
- **Portfolio Tracking**: Real-time balance and performance monitoring
- **Market Data**: Live cryptocurrency prices and market information

## Data Flow

1. **Authentication**: Users authenticate and store encrypted Binance API credentials
2. **Market Data**: WebSocket connection provides real-time price feeds
3. **Strategy Execution**: Background processes monitor strategies and execute trades
4. **Order Management**: Orders are placed through Binance API and tracked in database
5. **Portfolio Updates**: Real-time portfolio calculations based on current holdings and prices

## External Dependencies

### Primary Dependencies
- **Binance API**: Official Binance Node.js API client for trading operations
- **Database**: Neon PostgreSQL for cloud database hosting
- **Real-time Data**: Binance WebSocket streams for market data
- **UI Components**: Radix UI for accessible component primitives

### Development Tools
- **TypeScript**: Type safety and development experience
- **ESBuild**: Fast production builds for backend
- **PostCSS**: CSS processing and optimization
- **Tailwind CSS**: Utility-first styling framework

## Deployment Strategy

### Development Environment
- **Port Configuration**: Frontend (5000), Backend API (8080), WebSocket (8081)
- **Hot Reload**: Vite development server with HMR
- **Database**: Automatic connection to PostgreSQL instance
- **Environment**: Development mode with enhanced logging

### Production Build
- **Frontend**: Static asset generation with Vite
- **Backend**: Bundled Node.js application with ESBuild
- **Database**: Drizzle migrations applied automatically
- **Deployment**: Auto-scaling deployment on Replit infrastructure

### Configuration Management
- **Environment Variables**: DATABASE_URL for PostgreSQL connection
- **API Configuration**: Binance API endpoints and credentials
- **Security Settings**: Session secrets and encryption keys
- **Feature Flags**: Development vs production feature toggles

## Changelog
```
Changelog:
- June 26, 2025. Initial setup
- June 26, 2025. Enhanced Korean language support across all pages
- June 26, 2025. Improved API error handling with fallback systems
- June 26, 2025. Added comprehensive user guidance for API configuration
```

## Recent Changes

### Korean Language Integration (June 26, 2025)
- Completed Korean translation for all navigation menu items
- Translated dashboard page headers and statistics labels
- Updated portfolio page with Korean labels and better error messaging
- Enhanced markets page with Korean search placeholder and headers
- Improved settings page with Korean titles and configuration guidance
- Added Korean error messages for API credential validation

### API Integration Improvements (June 26, 2025)
- Implemented fallback system from Binance Global to CryptoCompare API
- Enhanced error logging for API credential testing
- Added detailed Korean error messages for location restrictions
- Improved user guidance for API key setup and troubleshooting

## User Preferences

Preferred communication style: Simple, everyday language.
Project language: Korean interface with English technical terms where appropriate.
API handling: Prefer detailed error messages and user guidance over silent failures.