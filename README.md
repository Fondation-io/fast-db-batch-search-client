# Fast-DB Batch Search Client

[![npm version](https://img.shields.io/npm/v/@fondation-io/fast-db-batch-search-client.svg)](https://www.npmjs.com/package/@fondation-io/fast-db-batch-search-client)
[![Build Status](https://github.com/Fondation-io/fast-db-batch-search-client/workflows/CI/badge.svg)](https://github.com/Fondation-io/fast-db-batch-search-client/actions)
[![npm downloads](https://img.shields.io/npm/dm/@fondation-io/fast-db-batch-search-client.svg)](https://www.npmjs.com/package/@fondation-io/fast-db-batch-search-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@fondation-io/fast-db-batch-search-client)](https://bundlephobia.com/package/@fondation-io/fast-db-batch-search-client)

A TypeScript client library for interacting with Fast-DB's batch search API, providing efficient batch queries with support for fuzzy search operations.

## Features

- 🚀 **Batch Operations**: Execute multiple search queries in a single request
- 🔍 **Fuzzy Search**: Built-in support for fuzzy string matching with Levenshtein distance
- 📊 **Progress Tracking**: Real-time progress updates for batch operations
- 🎯 **Type Safety**: Full TypeScript support with comprehensive type definitions
- ⚡ **High Performance**: Optimized for handling large datasets
- 🔄 **Automatic Retries**: Built-in retry logic for failed requests

## Installation

### NPM/Yarn Installation

```bash
# Using npm
npm install @fondation-io/fast-db-batch-search-client

# Using yarn
yarn add @fondation-io/fast-db-batch-search-client

# Using pnpm
pnpm add @fondation-io/fast-db-batch-search-client
```

### Git Installation

Install directly from GitHub:

```bash
npm install git+https://github.com/fondation-io/fast-db-batch-search-client.git
```

### As a Git Submodule

For projects that need to modify or closely track the client:

```bash
# Add as submodule
git submodule add https://github.com/fondation-io/fast-db-batch-search-client.git libs/fast-db-client

# Install dependencies
cd libs/fast-db-client
npm install
npm run build
```

## Quick Start

```typescript
import { FastDBBatchSearchClient } from '@fondation-io/fast-db-batch-search-client';

// Initialize the client
const client = new FastDBBatchSearchClient({
  baseURL: 'http://localhost:8080',
  timeout: 30000,
});

// Execute a simple batch search
const results = await client.executeBatchSearch({
  searches: [
    {
      collection: 'books',
      query: {
        fuzzy: {
          text: 'Harry Potter',
          fields: ['title', 'author'],
          distance: 2,
        },
      },
      limit: 10,
    },
  ],
});

console.log(results);
```

## Configuration

### Client Options

```typescript
interface ClientConfig {
  baseURL: string; // Fast-DB server URL
  timeout?: number; // Request timeout in milliseconds (default: 30000)
  maxRetries?: number; // Maximum retry attempts (default: 3)
  retryDelay?: number; // Delay between retries in ms (default: 1000)
}
```

### Environment Variables

You can also configure the client using environment variables:

```bash
FAST_DB_URL=http://localhost:8080
FAST_DB_TIMEOUT=30000
```

## API Reference

### Main Client

#### `executeBatchSearch(request: BatchSearchRequest): Promise<BatchSearchResponse>`

Execute multiple search queries in a single batch.

```typescript
const response = await client.executeBatchSearch({
  searches: [
    {
      collection: 'products',
      query: {
        fuzzy: {
          text: 'laptop',
          fields: ['name', 'description'],
          distance: 1,
        },
      },
      limit: 20,
      offset: 0,
    },
  ],
  options: {
    timeout: 60000,
    parallel: true,
  },
});
```

#### `executeBatchSearchWithProgress(request, onProgress): Promise<BatchSearchResponse>`

Execute batch search with progress tracking.

```typescript
await client.executeBatchSearchWithProgress(request, (progress) => {
  console.log(`Progress: ${progress.completed}/${progress.total}`);
  console.log(`Current: ${progress.currentQuery}`);
});
```

### Query Types

#### Fuzzy Search Query

```typescript
interface FuzzyQuery {
  fuzzy: {
    text: string; // Search text
    fields: string[]; // Fields to search in
    distance?: number; // Maximum Levenshtein distance (default: 2)
    prefix?: boolean; // Enable prefix matching (default: false)
  };
}
```

#### Exact Search Query

```typescript
interface ExactQuery {
  exact: {
    field: string; // Field name
    value: any; // Exact value to match
  };
}
```

#### Range Query

```typescript
interface RangeQuery {
  range: {
    field: string; // Field name
    min?: any; // Minimum value
    max?: any; // Maximum value
    inclusive?: boolean; // Include boundaries (default: true)
  };
}
```

## Advanced Usage

### Error Handling

```typescript
try {
  const results = await client.executeBatchSearch(request);
} catch (error) {
  if (error.code === 'TIMEOUT') {
    console.error('Request timed out');
  } else if (error.code === 'NETWORK_ERROR') {
    console.error('Network error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Custom Headers

```typescript
const client = new FastDBBatchSearchClient({
  baseURL: 'http://localhost:8080',
  headers: {
    Authorization: 'Bearer your-token',
    'X-Custom-Header': 'value',
  },
});
```

### Streaming Large Results

For very large result sets, use streaming:

```typescript
const stream = await client.streamBatchSearch({
  searches: [...],
  options: {
    streamResults: true,
    chunkSize: 1000
  }
});

stream.on('data', (chunk) => {
  console.log('Received chunk:', chunk);
});

stream.on('end', () => {
  console.log('Stream completed');
});
```

## Examples

### Search Multiple Collections

```typescript
const results = await client.executeBatchSearch({
  searches: [
    {
      collection: 'books',
      query: { fuzzy: { text: 'science', fields: ['title'], distance: 1 } },
      limit: 5,
    },
    {
      collection: 'authors',
      query: { fuzzy: { text: 'Asimov', fields: ['name'], distance: 2 } },
      limit: 10,
    },
    {
      collection: 'products',
      query: { exact: { field: 'category', value: 'electronics' } },
      limit: 20,
    },
  ],
});
```

### Complex Query with Filters

```typescript
const results = await client.executeBatchSearch({
  searches: [
    {
      collection: 'books',
      query: {
        fuzzy: {
          text: 'artificial intelligence',
          fields: ['title', 'description'],
          distance: 2,
        },
      },
      filters: {
        year: { min: 2020 },
        rating: { min: 4.0 },
        available: true,
      },
      sort: {
        field: 'rating',
        order: 'desc',
      },
      limit: 50,
    },
  ],
});
```

## Performance Tips

1. **Batch Size**: Optimal batch size is typically 100-500 queries
2. **Field Selection**: Specify only required fields to reduce response size
3. **Connection Pooling**: The client reuses connections automatically
4. **Timeout Configuration**: Adjust timeout based on your dataset size

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/fondation-io/fast-db-batch-search-client.git
cd fast-db-batch-search-client

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run in watch mode
npm run watch
```

### Running Examples

```bash
# Basic example
npm run example

# Advanced example
npx tsx examples/advanced-search.ts
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Documentation

- 📚 [API Documentation](https://fondation-io.github.io/fast-db-batch-search-client/)
- 🚀 [Advanced Usage Guide](docs/ADVANCED_USAGE.md)
- 🔄 [Migration Guide](docs/MIGRATION.md)
- 🤝 [Contributing Guide](CONTRIBUTING.md)

## Support

- 📧 Email: support@fondation.io
- 🐛 Issues: [GitHub Issues](https://github.com/fondation-io/fast-db-batch-search-client/issues)
- 📖 Documentation: [Fast-DB Documentation](https://github.com/fondation-io/fast-db)

## Acknowledgments

This client is part of the Fast-DB ecosystem, a high-performance in-memory database optimized for search operations.
