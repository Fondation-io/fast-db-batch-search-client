import { BatchSearchClient } from '../src';

async function main() {
  // Initialize the client
  const client = new BatchSearchClient({
    baseUrl: process.env.FAST_DB_URL || 'http://localhost:8080',
    timeout: 30000,
    includeMetrics: true,
  });

  try {
    // Example 1: Simple search for Harry Potter books by J.K. Rowling
    console.log('Example 1: Search for Harry Potter books by J.K. Rowling');
    const harryPotterResults = await client.batchSearch(
      'books', // table
      'auteurs', // node field (author)
      'J.K. Rowling', // node query (single author)
      'titre', // target field (title)
      [
        // list of target queries (titles to search)
        'Harry Potter école sorciers',
        'Harry Potter chambre secrets',
        'Harry Potter prisonnier Azkaban',
      ],
      ['titre', 'auteurs', 'annee'], // fields to return
      true, // use fuzzy search
      5 // max results per target
    );

    console.log(`Found ${harryPotterResults.totalResults} books`);
    console.log('\nGrouped results:');
    Object.entries(harryPotterResults.grouped).forEach(([hash, books]) => {
      console.log(`\nGroup ${hash.substring(0, 8)}...:`);
      books.forEach((book) => {
        console.log(`  - ${book.titre} by ${book.auteurs} (${book.annee || 'N/A'})`);
      });
    });

    // Example 2: Search for multiple authors using the convenience method
    console.log('\n\nExample 2: Search for Tolkien books using convenience method');
    const tolkienResults = await client.searchBookSeries(
      'J.R.R. Tolkien',
      ['The Hobbit', 'The Lord of the Rings', 'The Silmarillion'],
      3
    );

    console.log(`Found ${tolkienResults.totalResults} books by Tolkien`);
    if (tolkienResults.metrics) {
      console.log('Search metrics:', tolkienResults.metrics);
    }

    // Example 3: Search with minimal parameters
    console.log('\n\nExample 3: Simple search with defaults');
    const simpleResults = await client.batchSearch('books', 'auteurs', 'Victor Hugo', 'titre', [
      'Les Misérables',
    ]);

    console.log(`Found ${simpleResults.totalResults} results`);
  } catch (error) {
    console.error('Error executing searches:', error);
  }
}

// Run the examples
main().catch(console.error);
