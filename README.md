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
# Scrape a URL
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "http://httpbin.org/html"}'
```

**Success Response (200):**

```json
{
  "status": "ok",
  "data": {
    "html": "<!DOCTYPE html>\n<html>\n  <head>\n  </head>\n  <body>\n      <h1>Herman Melville - Moby-Dick</h1>\n\n      <div>\n        <p>\n          Availing himself of the mild, summer-cool weather ... care-killing competency.\n        </p>\n      </div>\n  </body>\n</html>",
    "headers": {
      "date": "Thu, 04 Sep 2025 18:00:13 GMT",
      "content-type": "text/html; charset=utf-8",
      "content-length": "3741",
      "server": "gunicorn/19.9.0",
      "access-control-allow-origin": "*"
    }
  },
  "message": "Success",
  "timestamp": "2025-09-04T18:00:13.632Z"
}
```

**Error Response (500):**

```json
{
  "status": "error",
  "data": null,
  "message": "All proxy attempts failed",
  "timestamp": "2025-09-04T18:00:13.632Z"
}
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

## Testing

```bash
# Run tests locally
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in Docker
npm run test:docker

# Run tests with coverage in Docker
npm run test:docker:coverage
```

**Test Structure:**

- `tests/` - Test files (separate from production code)
- Unit tests for services, utilities, and core logic
- Jest + TypeScript configuration
- Redis mocking for isolated testing

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
