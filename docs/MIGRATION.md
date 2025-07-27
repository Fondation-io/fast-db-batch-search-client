# Migration Guide

## Migrating from Author/Title to Node/Target API

Starting from version 2.0.0, the Fast-DB Batch Search Client uses a more generic vocabulary to support a wider range of use cases beyond just book searches.

### Terminology Changes

| Old Term         | New Term          | Description                                   |
| ---------------- | ----------------- | --------------------------------------------- |
| `$author_field`  | `$node_field`     | The field containing the grouping element     |
| `$author_query`  | `$node_query`     | The value to search for in the node field     |
| `$title_field`   | `$target_field`   | The field containing the items to search      |
| `$title_queries` | `$target_queries` | Array of values to search in the target field |

### API Changes

#### BatchSearchQuery Interface

**Before (v1.x):**

```typescript
interface BatchSearchQuery {
  $author_field: string;
  $author_query: string;
  $title_field: string;
  $title_queries: string[];
  $fuzzy?: boolean;
  $results_per_query?: number;
}
```

**After (v2.0+):**

```typescript
interface BatchSearchQuery {
  $node_field: string;
  $node_query: string;
  $target_field: string;
  $target_queries: string[];
  $fuzzy?: boolean;
  $results_per_query?: number;
}
```

#### Client Method Parameters

**Before (v1.x):**

```typescript
await client.batchSearch(
  'books',
  'auteurs', // authorField
  'Victor Hugo', // authorQuery
  'titre', // titleField
  ['Les Misérables'], // titleQueries
  ['titre', 'auteurs'],
  true,
  5
);
```

**After (v2.0+):**

```typescript
await client.batchSearch(
  'books',
  'auteurs', // nodeField
  'Victor Hugo', // nodeQuery
  'titre', // targetField
  ['Les Misérables'], // targetQueries
  ['titre', 'auteurs'],
  true,
  5
);
```

### New Generic Method

A new generic method `searchRelatedItems()` has been added to make the API more intuitive:

```typescript
const results = await client.searchRelatedItems(
  'products',
  'category', // nodeField
  'Electronics', // nodeValue
  'product_name', // targetField
  ['iPhone', 'MacBook', 'AirPods'], // targetValues
  ['product_name', 'price', 'brand'],
  5
);
```

### Backward Compatibility

The `searchBookSeries()` method is now deprecated but remains available for backward compatibility:

```typescript
// Deprecated (but still works)
await client.searchBookSeries('J.K. Rowling', ['Harry Potter'], 5);

// Recommended
await client.searchRelatedItems(
  'books',
  'auteurs',
  'J.K. Rowling',
  'titre',
  ['Harry Potter'],
  ['titre', 'auteurs'],
  5
);
```

### Server-Side Changes

The server API has also been updated to use the new terminology. Ensure your Fast-DB server is updated to a compatible version that supports the new field names.

### Migration Steps

1. **Update Client Library**: Install version 2.0.0 or later

   ```bash
   npm install @fondation-io/fast-db-batch-search-client@^2.0.0
   ```

2. **Update Query Construction**: Replace old field names with new ones in your queries:
   - `$author_field` → `$node_field`
   - `$author_query` → `$node_query`
   - `$title_field` → `$target_field`
   - `$title_queries` → `$target_queries`

3. **Consider Using Generic Method**: For new code, consider using `searchRelatedItems()` for better clarity

4. **Test Your Queries**: Ensure all queries work as expected with the new API

### Examples of Different Use Cases

**Products by Category:**

```typescript
await client.batchSearch(
  'products',
  'category', // node
  'Electronics', // node value
  'name', // target
  ['iPhone 15', 'Galaxy S24', 'Pixel 8'],
  ['name', 'price', 'brand'],
  true,
  3
);
```

**Tracks by Artist:**

```typescript
await client.batchSearch(
  'tracks',
  'artist_id', // node
  '12345', // node value
  'track_name', // target
  ['Bohemian Rhapsody', 'We Are The Champions'],
  ['track_name', 'album', 'duration'],
  true,
  5
);
```

**Child Entities by Parent:**

```typescript
await client.batchSearch(
  'entities',
  'parent_id', // node
  'ROOT_123', // node value
  'entity_name', // target
  ['Config', 'Users', 'Permissions'],
  ['entity_name', 'entity_type', 'created_at'],
  true,
  10
);
```
