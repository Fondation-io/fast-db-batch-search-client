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
import { BatchSearchClient } from '@fondation-io/fast-db-batch-search-client';
// Note: FastDBBatchSearchClient is also available as an alias for backward compatibility

// Initialize the client
const client = new BatchSearchClient({
  baseUrl: 'http://localhost:8080',
  timeout: 30000,
  includeMetrics: true,
});

// Search for multiple Harry Potter books by J.K. Rowling
const results = await client.batchSearch(
  'books', // table/collection
  'auteurs', // node field (author field name)
  'J.K. Rowling', // node query (author to search for)
  'titre', // target field (title field name)
  [
    // target queries (list of titles to search)
    'Harry Potter école sorciers',
    'Harry Potter chambre secrets',
    'Harry Potter prisonnier Azkaban',
  ],
  ['titre', 'auteurs'], // fields to return
  true, // use fuzzy search
  5 // max results per target
);

console.log(`Found ${results.totalResults} books`);
console.log(results.grouped); // Results grouped by search query
```

## Conceptual Model: Node-Target Relationships

The batch search API uses a generic **node-target** model that can represent various relationships:

- **Node**: The common element that groups related items (e.g., author, category, parent)
- **Target**: The specific items being searched within that group (e.g., titles, products, children)

This model supports many use cases:

- Books by an author: node=author, targets=book titles
- Products in a category: node=category, targets=product names
- Children of a parent entity: node=parent_id, targets=child names
- Tracks by an artist: node=artist, targets=track titles
- Items with a common tag: node=tag, targets=item names

## Configuration

### Client Options

```typescript
interface BatchSearchOptions {
  baseUrl?: string; // Fast-DB server URL (default: 'http://localhost:8080')
  timeout?: number; // Request timeout in milliseconds (default: 30000)
  includeMetrics?: boolean; // Include performance metrics (default: true)
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

#### `batchSearch(table, nodeField, nodeQuery, targetField, targetQueries, projection?, fuzzy?, resultsPerQuery?)`

Search for multiple targets related to a single node.

**Parameters:**

- `table` (string): The table/collection to search in (e.g., 'books')
- `nodeField` (string): The field name containing node information (e.g., author, category, parent)
- `nodeQuery` (string): The node value to search for
- `targetField` (string): The field name containing target information (e.g., title, name, child)
- `targetQueries` (string[]): Array of target values to search for
- `projection` (string[]): Fields to return (default: ['*'])
- `fuzzy` (boolean): Use fuzzy search (default: true)
- `resultsPerQuery` (number): Maximum results per target (default: 10)

```typescript
// Example: Search for books by author
const bookResults = await client.batchSearch(
  'books',
  'auteurs', // node field
  'Victor Hugo', // node query
  'titre', // target field
  ['Les Misérables', 'Notre-Dame de Paris', 'Les Contemplations'], // target queries
  ['titre', 'auteurs', 'annee'],
  true,
  3
);

// Example: Search for products by category
const productResults = await client.batchSearch(
  'products',
  'category', // node field
  'Electronics', // node query
  'product_name', // target field
  ['iPhone', 'MacBook', 'AirPods'], // target queries
  ['product_name', 'price', 'brand'],
  true,
  5
);
```

#### `searchBookSeries(author, seriesTitles, maxPerTitle?)` (Deprecated)

**Deprecated**: Use `searchRelatedItems()` instead.

Convenience method for searching book series by author.

#### `searchRelatedItems(table, nodeField, nodeValue, targetField, targetValues, projection?, maxPerTarget?)`

Generic method for searching related items by a common node.

```typescript
// Deprecated method (for backward compatibility)
const results = await client.searchBookSeries(
  'J.R.R. Tolkien',
  ['The Hobbit', 'The Lord of the Rings', 'The Silmarillion'],
  5
);

// Recommended: Use the generic method
const results = await client.searchRelatedItems(
  'books',
  'auteurs',
  'J.R.R. Tolkien',
  'titre',
  ['The Hobbit', 'The Lord of the Rings', 'The Silmarillion'],
  ['titre', 'auteurs', 'annee'],
  5
);
```

### Response Structure

```typescript
interface BatchSearchResponse {
  results: SearchResult[]; // Flat array of all results
  grouped: GroupedResults; // Results grouped by title query
  metrics?: Record<string, unknown>; // Performance metrics
  totalResults: number; // Total number of results found
}

interface SearchResult {
  search_group_hash: string; // Hash identifying which title query this result belongs to
  [key: string]: any; // Dynamic fields based on projection
}

interface GroupedResults {
  [hash: string]: SearchResult[]; // Results grouped by search_group_hash
}
```

## Advanced Usage

### Error Handling

```typescript
try {
  const results = await client.batchSearch(
    'books',
    'auteurs',
    'Unknown Author',
    'titre',
    ['Some Title'],
    ['titre'],
    true,
    5
  );
} catch (error) {
  console.error('Search failed:', error.message);
  // Handle specific error cases
  if (error.message.includes('Network error')) {
    console.error('Server is unreachable');
  } else if (error.message.includes('API Error')) {
    console.error('Server returned an error');
  }
}
```

## Examples

### Search for Multiple Books by One Author

```typescript
// Search for Harry Potter books by J.K. Rowling
const harryPotterResults = await client.batchSearch(
  'books',
  'auteurs',
  'J.K. Rowling',
  'titre',
  [
    "Harry Potter and the Philosopher's Stone",
    'Harry Potter and the Chamber of Secrets',
    'Harry Potter and the Prisoner of Azkaban',
    'Harry Potter and the Goblet of Fire',
    'Harry Potter and the Order of the Phoenix',
    'Harry Potter and the Half-Blood Prince',
    'Harry Potter and the Deathly Hallows',
  ],
  ['titre', 'auteurs', 'annee', 'isbn'],
  true, // fuzzy search
  3 // max 3 results per title
);

// Process grouped results
for (const [hash, books] of Object.entries(harryPotterResults.grouped)) {
  console.log(`\nGroup ${hash}:`);
  books.forEach((book) => {
    console.log(`- ${book.titre} (${book.annee})`);
  });
}
```

### Using the Convenience Method

```typescript
// Search for Tolkien's major works
const tolkienResults = await client.searchBookSeries(
  'J.R.R. Tolkien',
  ['The Hobbit', 'The Fellowship of the Ring', 'The Two Towers', 'The Return of the King'],
  5 // max 5 results per title
);

console.log(`Found ${tolkienResults.totalResults} books by Tolkien`);
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
