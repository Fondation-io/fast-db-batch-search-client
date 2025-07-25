import { BatchSearchClient } from '../src';

async function advancedSearchExamples() {
  const client = new BatchSearchClient({
    baseUrl: process.env.FAST_DB_URL || 'http://localhost:8080',
    timeout: 60000,
    includeMetrics: true,
  });

  try {
    // Example 1: Large batch search for an author's complete works
    console.log("Example 1: Search for Stephen King's horror novels");
    const stephenKingTitles = [
      'Carrie',
      'The Shining',
      'The Stand',
      'The Dead Zone',
      'Firestarter',
      'Cujo',
      'Christine',
      'Pet Sematary',
      'IT',
      'Misery',
      'The Dark Half',
      'Needful Things',
      "Gerald's Game",
      'Dolores Claiborne',
      'Insomnia',
      'The Green Mile',
      'Desperation',
      'Bag of Bones',
      'The Girl Who Loved Tom Gordon',
      'Dreamcatcher',
      'From a Buick 8',
      'Cell',
      "Lisey's Story",
      'Duma Key',
      'Under the Dome',
      '11/22/63',
      'Doctor Sleep',
      'Mr. Mercedes',
      'Revival',
      'Finders Keepers',
      'End of Watch',
      'The Outsider',
    ];

    const kingResults = await client.batchSearch(
      'books',
      'auteurs',
      'Stephen King',
      'titre',
      stephenKingTitles,
      ['titre', 'auteurs', 'annee', 'genre', 'isbn'],
      true,
      2 // Limit to 2 results per title to avoid too many results
    );

    console.log(`Found ${kingResults.totalResults} Stephen King books`);
    console.log(`Searched for ${stephenKingTitles.length} titles`);
    console.log(`Groups found: ${Object.keys(kingResults.grouped).length}`);

    if (kingResults.metrics) {
      console.log('Performance metrics:', {
        searchTime: kingResults.metrics.search_time_ms || 'N/A',
        totalTime: kingResults.metrics.client_elapsed_ms || 'N/A',
        rowsExamined: kingResults.metrics.rows_examined || 'N/A',
      });
    }

    // Example 2: Searching for book series with variations
    console.log('\n\nExample 2: Search for book series with title variations');
    const asimovFoundationSeries = [
      'Foundation',
      'Foundation and Empire',
      'Second Foundation',
      "Foundation's Edge",
      'Foundation and Earth',
      'Prelude to Foundation',
      'Forward the Foundation',
    ];

    const foundationResults = await client.batchSearch(
      'books',
      'auteurs',
      'Isaac Asimov',
      'titre',
      asimovFoundationSeries,
      ['titre', 'auteurs', 'annee', 'serie'],
      true,
      5
    );

    // Group and display by series order
    console.log('\nFoundation Series Results:');
    asimovFoundationSeries.forEach((searchTitle) => {
      const groupHash = Object.keys(foundationResults.grouped).find((hash) => {
        const group = foundationResults.grouped[hash];
        return group.some(
          (book) => book.titre && book.titre.toLowerCase().includes(searchTitle.toLowerCase())
        );
      });

      if (groupHash) {
        console.log(`\n"${searchTitle}":`);
        foundationResults.grouped[groupHash].forEach((book) => {
          console.log(`  - ${book.titre} (${book.annee || 'Year unknown'})`);
        });
      } else {
        console.log(`\n"${searchTitle}": No results found`);
      }
    });

    // Example 3: Parallel searches for different authors
    console.log('\n\nExample 3: Parallel searches for multiple authors');

    const authorSearches = [
      {
        author: 'Agatha Christie',
        titles: ['Murder on the Orient Express', 'Death on the Nile', 'And Then There Were None'],
      },
      {
        author: 'Arthur Conan Doyle',
        titles: ['A Study in Scarlet', 'The Hound of the Baskervilles', 'The Valley of Fear'],
      },
      { author: 'Jane Austen', titles: ['Pride and Prejudice', 'Sense and Sensibility', 'Emma'] },
    ];

    const parallelResults = await Promise.all(
      authorSearches.map(async ({ author, titles }) => {
        const results = await client.batchSearch(
          'books',
          'auteurs',
          author,
          'titre',
          titles,
          ['titre', 'auteurs', 'annee'],
          true,
          3
        );
        return { author, results };
      })
    );

    parallelResults.forEach(({ author, results }) => {
      console.log(`\n${author}: Found ${results.totalResults} books`);
      Object.values(results.grouped)
        .flat()
        .forEach((book) => {
          console.log(`  - ${book.titre} (${book.annee || 'N/A'})`);
        });
    });

    // Example 4: Error handling for non-existent author
    console.log('\n\nExample 4: Error handling and empty results');
    try {
      const noResults = await client.batchSearch(
        'books',
        'auteurs',
        'Non Existent Author XYZ123',
        'titre',
        ['Some Random Title'],
        ['titre', 'auteurs'],
        true,
        10
      );

      console.log(`Results for non-existent author: ${noResults.totalResults}`);
      if (noResults.totalResults === 0) {
        console.log('As expected, no results found for non-existent author');
      }
    } catch (error: any) {
      console.log('Error handled gracefully:', error.message);
    }

    // Example 5: Using statistics helper
    console.log('\n\nExample 5: Analyzing search statistics');
    const stats = client.getSearchStats(kingResults.grouped);
    console.log('Stephen King search statistics:');
    console.log(`  - Total groups: ${stats.totalGroups}`);
    console.log(`  - Average books per group: ${stats.averageGroupSize.toFixed(2)}`);
    console.log(`  - Empty groups: ${stats.emptyGroups}`);

    // Show top 5 groups by size
    const sortedGroups = Object.entries(stats.groupSizes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    console.log('  - Top 5 groups by result count:');
    sortedGroups.forEach(([hash, size], index) => {
      console.log(`    ${index + 1}. Group ${hash.substring(0, 8)}...: ${size} results`);
    });
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the advanced examples
advancedSearchExamples().catch(console.error);
