# Migration Guide

This guide helps you migrate between different versions of the Fast-DB Batch Search Client.

## Migrating from 0.x to 1.0

Version 1.0 is the initial stable release. If you're using a pre-release version, here are the key changes:

### Breaking Changes

1. **Import Path Changes**

   ```typescript
   // Before
   import { BatchSearchClient } from 'fast-db-batch-search-client';

   // After
   import { BatchSearchClient } from '@fondation-io/fast-db-batch-search-client';
   ```

2. **Constructor Options**

   ```typescript
   // Before
   const client = new BatchSearchClient('http://localhost:8080');

   // After
   const client = new BatchSearchClient({
     baseUrl: 'http://localhost:8080',
     timeout: 30000,
     includeMetrics: true,
   });
   ```

3. **Method Signatures**
   The main `batchSearch` method now has a more consistent parameter order:
   ```typescript
   // Parameters order:
   // table, authorField, authorQuery, titleField, titleQueries, projection, fuzzy, resultsPerQuery
   ```

### New Features in 1.0

- **Progress Tracking**: New methods for tracking batch operation progress
- **Type Safety**: Comprehensive TypeScript definitions
- **Error Handling**: Improved error messages with proper types
- **Retry Logic**: Automatic retry for failed requests

### Deprecations

No deprecations in 1.0 as this is the initial release.

## Future Versions

This section will be updated as new versions are released. We follow semantic versioning:

- **Major versions** (2.0, 3.0, etc.) may include breaking changes
- **Minor versions** (1.1, 1.2, etc.) add functionality in a backward-compatible manner
- **Patch versions** (1.0.1, 1.0.2, etc.) include backward-compatible bug fixes

## Version Compatibility

| Client Version | Fast-DB Version | Node.js Version |
| -------------- | --------------- | --------------- |
| 1.0.x          | ≥ 0.1.0         | ≥ 16.0.0        |

## Getting Help

If you encounter issues during migration:

1. Check the [CHANGELOG](../CHANGELOG.md) for detailed changes
2. Review the [examples](../examples) for updated usage patterns
3. Open an [issue](https://github.com/fondation-io/fast-db-batch-search-client/issues) if you need help
