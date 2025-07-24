# Advanced Usage Guide

This guide covers advanced usage patterns and optimization techniques for the Fast-DB Batch Search Client.

## Performance Optimization

### 1. Batch Size Optimization

The optimal batch size depends on your dataset and query complexity:

```typescript
// For simple queries with small result sets
const smallBatch = await client.batchSearch(
  'books',
  'author',
  'Tolkien',
  'title',
  ['Hobbit', 'Lord of the Rings'], // Small batch
  ['title', 'year'],
  true,
  5 // Few results per query
);

// For complex queries with large result sets
const largeBatch = await client.batchSearch(
  'products',
  'category',
  'electronics',
  'name',
  productNames.slice(0, 100), // Limit batch size
  ['name', 'price', 'stock'],
  true,
  20
);
```

### 2. Connection Pooling

The client automatically manages connection pooling. You can optimize it:

```typescript
const client = new BatchSearchClient({
  baseUrl: 'http://localhost:8080',
  timeout: 60000, // Increase for large batches
  includeMetrics: false, // Disable metrics for better performance
});
```

### 3. Parallel Processing

For very large datasets, process in parallel chunks:

```typescript
async function processLargeDataset(queries: string[], chunkSize = 50) {
  const chunks = [];
  for (let i = 0; i < queries.length; i += chunkSize) {
    chunks.push(queries.slice(i, i + chunkSize));
  }

  const results = await Promise.all(
    chunks.map((chunk) =>
      client.batchSearch(
        'books',
        'author',
        'Various',
        'title',
        chunk,
        ['title', 'author'],
        true,
        10
      )
    )
  );

  // Merge results
  return results.reduce(
    (acc, result) => ({
      results: [...acc.results, ...result.results],
      grouped: { ...acc.grouped, ...result.grouped },
      totalResults: acc.totalResults + result.totalResults,
    }),
    { results: [], grouped: {}, totalResults: 0 }
  );
}
```

## Error Handling Strategies

### 1. Retry with Exponential Backoff

```typescript
async function searchWithRetry(
  client: BatchSearchClient,
  params: any,
  maxRetries = 3
): Promise<any> {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await client.batchSearch(...params);
    } catch (error) {
      lastError = error;
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
```

### 2. Partial Failure Handling

```typescript
async function robustBatchSearch(queries: string[]) {
  const results = [];
  const failures = [];

  for (const query of queries) {
    try {
      const result = await client.batchSearch(
        'books',
        'author',
        'Any',
        'title',
        [query],
        ['title'],
        true,
        5
      );
      results.push(result);
    } catch (error) {
      failures.push({ query, error });
    }
  }

  return { results, failures };
}
```

## Custom Query Patterns

### 1. Multi-Field Search

```typescript
// Search across multiple fields with different weights
async function multiFieldSearch(searchTerm: string) {
  const titleResults = await client.batchSearch(
    'books',
    'author',
    'Any',
    'title',
    [searchTerm],
    ['title', 'author', 'year'],
    true,
    10
  );

  const descriptionResults = await client.batchSearch(
    'books',
    'author',
    'Any',
    'description',
    [searchTerm],
    ['title', 'description'],
    true,
    5
  );

  // Merge and rank results
  return mergeResults(titleResults, descriptionResults);
}
```

### 2. Fuzzy Search with Distance Control

```typescript
// Adaptive fuzzy search based on query length
function getOptimalDistance(query: string): number {
  if (query.length <= 3) return 1;
  if (query.length <= 6) return 2;
  return 3;
}

async function adaptiveFuzzySearch(queries: string[]) {
  // Group queries by optimal distance
  const grouped = queries.reduce(
    (acc, query) => {
      const distance = getOptimalDistance(query);
      if (!acc[distance]) acc[distance] = [];
      acc[distance].push(query);
      return acc;
    },
    {} as Record<number, string[]>
  );

  // Execute searches with appropriate distance
  const results = await Promise.all(
    Object.entries(grouped).map(([distance, queries]) =>
      client.batchSearch('books', 'author', 'Any', 'title', queries, ['title'], true, 10)
    )
  );

  return results;
}
```

## Monitoring and Debugging

### 1. Performance Monitoring

```typescript
class MonitoredClient extends BatchSearchClient {
  async batchSearch(...args: any[]) {
    const start = Date.now();
    let result;

    try {
      result = await super.batchSearch(...args);
      const duration = Date.now() - start;

      console.log('Batch search completed', {
        duration,
        totalResults: result.totalResults,
        groupCount: Object.keys(result.grouped).length,
        metrics: result.metrics,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error('Batch search failed', {
        duration,
        error: error.message,
      });
      throw error;
    }
  }
}
```

### 2. Debug Mode

```typescript
const debugClient = new BatchSearchClient({
  baseUrl: process.env.FAST_DB_URL || 'http://localhost:8080',
  timeout: 30000,
  includeMetrics: true,
});

// Log all requests and responses
debugClient.axios.interceptors.request.use((request) => {
  console.log('Starting Request:', request);
  return request;
});

debugClient.axios.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response;
  },
  (error) => {
    console.log('Error:', error);
    return Promise.reject(error);
  }
);
```

## Integration Patterns

### 1. With Express.js

```typescript
import express from 'express';
import { BatchSearchClient } from '@fondation-io/fast-db-batch-search-client';

const app = express();
const client = new BatchSearchClient();

app.post('/api/batch-search', async (req, res) => {
  try {
    const { queries, collection = 'books' } = req.body;

    const results = await client.batchSearch(
      collection,
      'author',
      req.query.author || 'Any',
      'title',
      queries,
      ['title', 'author', 'year'],
      true,
      10
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2. With GraphQL

```typescript
import { GraphQLObjectType, GraphQLList, GraphQLString } from 'graphql';

const BatchSearchResultType = new GraphQLObjectType({
  name: 'BatchSearchResult',
  fields: {
    totalResults: { type: GraphQLInt },
    results: { type: new GraphQLList(BookType) },
  },
});

const resolvers = {
  batchSearch: async (_, { queries, author }) => {
    const client = new BatchSearchClient();
    return await client.batchSearch(
      'books',
      'author',
      author,
      'title',
      queries,
      ['title', 'author'],
      true,
      10
    );
  },
};
```

## Best Practices

1. **Cache Results**: Implement caching for frequently searched queries
2. **Rate Limiting**: Add rate limiting to prevent overwhelming the Fast-DB server
3. **Connection Reuse**: Create a single client instance and reuse it
4. **Error Boundaries**: Wrap batch searches in try-catch blocks
5. **Logging**: Log all searches for debugging and analytics
6. **Timeouts**: Set appropriate timeouts based on your use case
7. **Monitoring**: Track performance metrics and error rates
