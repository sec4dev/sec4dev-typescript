# Sec4Dev JavaScript/TypeScript SDK

JavaScript and TypeScript client for the [Sec4Dev Security Checks API](https://api.sec4.dev): disposable email detection and IP classification.

## Install

```bash
npm install .
```

## Build

```bash
npm run build
```

## Usage

```javascript
import { Sec4DevClient, ValidationError, RateLimitError } from "sec4dev";

const client = new Sec4DevClient("sec4_your_api_key");

// Email check
try {
  const result = await client.email.check("user@tempmail.com");
  if (result.isDisposable) {
    console.log(`Blocked: ${result.domain} is disposable`);
  }
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`Invalid email: ${error.message}`);
  }
}

// IP check
try {
  const result = await client.ip.check("203.0.113.42");
  console.log(`IP Type: ${result.classification}`);
  console.log(`Confidence: ${(result.confidence * 100).toFixed(0)}%`);
  if (result.signals.isHosting) {
    console.log(`Provider: ${result.network.provider}`);
  }
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry in ${error.retryAfter}s`);
  }
}
```

## Options

- `baseUrl` — API base URL (default: `https://api.sec4.dev/api/v1`)
- `timeout` — Request timeout in ms (default: 30000)
- `retries` — Retry attempts (default: 3)
- `retryDelay` — Base retry delay in ms (default: 1000)
