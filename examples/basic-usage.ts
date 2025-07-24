import { FastDBBatchSearchClient } from '../src';

async function main() {
  // Initialize the client
  const client = new FastDBBatchSearchClient({
    baseURL: process.env.FAST_DB_URL || 'http://localhost:8080',
    timeout: 30000
  });

  try {
    // Example 1: Simple fuzzy search
    console.log('Example 1: Simple fuzzy search');
    const fuzzyResults = await client.executeBatchSearch({
      searches: [
        {
          collection: 'books',
          query: {
            fuzzy: {
              text: 'Harry Potter',
              fields: ['title'],
              distance: 2
            }
          },
          limit: 5
        }
      ]
    });
    console.log('Fuzzy search results:', JSON.stringify(fuzzyResults, null, 2));

    // Example 2: Multiple searches in one batch
    console.log('\nExample 2: Batch search across multiple collections');
    const batchResults = await client.executeBatchSearch({
      searches: [
        {
          collection: 'books',
          query: {
            fuzzy: {
              text: 'science fiction',
              fields: ['title', 'description'],
              distance: 1
            }
          },
          limit: 3
        },
        {
          collection: 'authors',
          query: {
            fuzzy: {
              text: 'Asimov',
              fields: ['name'],
              distance: 2
            }
          },
          limit: 5
        }
      ]
    });
    console.log('Batch results:', JSON.stringify(batchResults, null, 2));

    // Example 3: Search with progress tracking
    console.log('\nExample 3: Search with progress tracking');
    await client.executeBatchSearchWithProgress(
      {
        searches: [
          {
            collection: 'products',
            query: {
              fuzzy: {
                text: 'laptop',
                fields: ['name', 'description'],
                distance: 1
              }
            },
            limit: 10
          }
        ]
      },
      (progress) => {
        console.log(`Progress: ${progress.completed}/${progress.total} - ${progress.currentQuery || 'Initializing...'}`);
      }
    );

  } catch (error) {
    console.error('Error executing searches:', error);
  }
}

// Run the examples
main().catch(console.error);