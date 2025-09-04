# Rate Limiting Scraper

A Node.js Express TypeScript application that scrapes URLs using proxy rotation with rate limiting and caching.

## What We Built

- **REST API** that receives URLs and returns HTML + headers
- **Proxy rotation** with round-robin selection from free proxy list
- **Rate limiting** per proxy (1 req/sec default) using Redis sliding window
- **Automatic retry** with different proxies on failure
- **Timeout-based** scraping (30s default) with safety limits
- **Redis caching** for proxy management and rate limiting

## Key Features

- ✅ **Round-robin proxy selection** for fair distribution
- ✅ **Redis caching** for proxy list and rate limiting
- ✅ **HTTP/HTTPS fallback** (tries HTTP first, then HTTPS)
- ✅ **Graceful error handling** with custom error classes
- ✅ **Docker support** for development and production
- ✅ **TypeScript strict mode** with proper type safety
- ✅ **SOLID principles** with clean architecture

## Quick Start

### Prerequisites

- Node.js 22+
- Docker & Docker Compose
- Redis

### Setup

```bash
# Clone and install dependencies
npm install

# Start with Docker (recommended)
npm run docker:dev

# Or run locally
npm run dev
```

### API Usage

```bash
# Health check
curl http://localhost:3000/api/health

# Scrape URL
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## Configuration

Environment variables (see `.env.example`):

- `SCRAPE_TIMEOUT_MS=30000` - Total timeout
- `RATE_LIMIT_PER_SECOND=1` - Requests per proxy per second
- `PROXY_TIMEOUT_MS=10000` - Per-proxy timeout

## Proxy Data

Proxy list is loaded from `data/proxies.txt`. See [data/README.md](data/README.md) for instructions on updating the proxy list.

## Architecture

```
src/
├── config/          # Environment configuration
├── controllers/     # Request handlers
├── services/        # Business logic
├── providers/       # Proxy provider system
├── interfaces/      # TypeScript interfaces
├── constants/       # Application constants
├── utils/           # Utility functions
└── errors/          # Error handling
```

## Docker Commands

```bash
npm run docker:dev    # Development with hot reload
npm run docker:prod   # Production build
npm run docker:down   # Stop containers
npm run docker:logs   # View logs
```

## Tech Stack

- **Node.js 22** + **Express.js** + **TypeScript**
- **Redis** for caching and rate limiting
- **Axios** for HTTP requests
- **Docker** for containerization
