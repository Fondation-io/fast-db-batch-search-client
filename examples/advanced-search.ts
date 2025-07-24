import { FastDBBatchSearchClient } from '../src';

async function advancedSearchExamples() {
  const client = new FastDBBatchSearchClient({
    baseURL: process.env.FAST_DB_URL || 'http://localhost:8080',
    timeout: 60000
  });

  try {
    // Example 1: Complex search with filters and sorting
    console.log('Example 1: Complex search with filters');
    const filteredResults = await client.executeBatchSearch({
      searches: [
        {
          collection: 'books',
          query: {
            fuzzy: {
              text: 'artificial intelligence',
              fields: ['title', 'description', 'tags'],
              distance: 2
            }
          },
          filters: {
            year: { min: 2020 },
            rating: { min: 4.0 },
            available: true,
            language: 'en'
          },
          sort: {
            field: 'rating',
            order: 'desc'
          },
          limit: 20,
          offset: 0
        }
      ]
    });
    console.log('Filtered results:', JSON.stringify(filteredResults, null, 2));

    // Example 2: Multi-field search with different strategies
    console.log('\nExample 2: Multi-field search strategies');
    const multiFieldResults = await client.executeBatchSearch({
      searches: [
        // Exact match on ID
        {
          collection: 'books',
          query: {
            exact: {
              field: 'isbn',
              value: '978-3-16-148410-0'
            }
          },
          limit: 1
        },
        // Range query
        {
          collection: 'products',
          query: {
            range: {
              field: 'price',
              min: 100,
              max: 500,
              inclusive: true
            }
          },
          limit: 10
        },
        // Combined fuzzy and filters
        {
          collection: 'users',
          query: {
            fuzzy: {
              text: 'john',
              fields: ['username', 'email'],
              distance: 1,
              prefix: true
            }
          },
          filters: {
            active: true,
            created_at: { min: '2023-01-01' }
          },
          limit: 5
        }
      ]
    });
    console.log('Multi-field results:', JSON.stringify(multiFieldResults, null, 2));

    // Example 3: Large batch with progress tracking
    console.log('\nExample 3: Large batch search');
    const searchTerms = ['science', 'history', 'art', 'technology', 'philosophy'];
    const largeSearches = searchTerms.flatMap(term => [
      {
        collection: 'books',
        query: {
          fuzzy: {
            text: term,
            fields: ['title', 'subject'],
            distance: 1
          }
        },
        limit: 10
      },
      {
        collection: 'articles',
        query: {
          fuzzy: {
            text: term,
            fields: ['title', 'abstract'],
            distance: 2
          }
        },
        limit: 5
      }
    ]);

    const largeResults = await client.executeBatchSearchWithProgress(
      {
        searches: largeSearches,
        options: {
          parallel: true,
          maxConcurrent: 5
        }
      },
      (progress) => {
        const percentage = Math.round((progress.completed / progress.total) * 100);
        console.log(`[${percentage}%] ${progress.completed}/${progress.total} - ${progress.currentQuery || 'Processing...'}`);
        
        if (progress.errors && progress.errors.length > 0) {
          console.error('Errors encountered:', progress.errors);
        }
      }
    );
    
    console.log(`\nCompleted ${largeResults.results.length} searches`);
    console.log(`Total hits: ${largeResults.results.reduce((sum, r) => sum + (r.hits?.length || 0), 0)}`);

    // Example 4: Error handling and retries
    console.log('\nExample 4: Error handling');
    try {
      await client.executeBatchSearch({
        searches: [
          {
            collection: 'non_existent_collection',
            query: {
              fuzzy: {
                text: 'test',
                fields: ['field'],
                distance: 1
              }
            },
            limit: 10
          }
        ]
      });
    } catch (error: any) {
      console.log('Expected error handled:', error.message);
      if (error.details) {
        console.log('Error details:', error.details);
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the advanced examples
advancedSearchExamples().catch(console.error);