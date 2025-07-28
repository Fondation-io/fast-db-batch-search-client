import { BatchSearchClient } from '../src';

async function joinSearchExamples() {
  const client = new BatchSearchClient({
    baseUrl: process.env.FAST_DB_URL || 'http://localhost:8080',
    timeout: 60000,
    includeMetrics: true,
  });

  try {
    // Example 1: Search for Mozart albums using the convenience method
    console.log("Example 1: Search for Mozart's symphonies using joins");
    const mozartAlbums = await client.searchAlbumsByArtist(
      'Mozart',
      ['Symphony 40', 'Symphony 41', 'Requiem', 'Symphony 39'],
      5 // Get up to 5 results per album
    );

    console.log(`Found ${mozartAlbums.totalResults} Mozart albums`);
    console.log(`Groups: ${Object.keys(mozartAlbums.grouped).length}`);

    // Display results by group
    Object.entries(mozartAlbums.grouped).forEach(([hash, albums]) => {
      if (albums.length > 0) {
        console.log(`\nGroup ${hash.substring(0, 8)}... (${albums.length} results):`);
        albums.forEach((album) => {
          console.log(`  - ${album.album_title} (${album.release_year || 'N/A'})`);
        });
      }
    });

    // Example 2: Custom join search with multiple artists
    console.log('\n\nExample 2: Custom join search for multiple classical composers');
    const classicalSearch = await client.batchSearchWithJoins({
      tables: ['id_artists', 'album_artist', 'albums'],
      joins: [
        {
          $type: 'inner',
          $left: 'id_artists',
          $right: 'album_artist',
          $on: ['id_artists.id', 'album_artist.artist_id'],
        },
        {
          $type: 'inner',
          $left: 'album_artist',
          $right: 'albums',
          $on: ['album_artist.cb', 'albums.cb'],
        },
      ],
      nodeField: 'id_artists.artiste',
      nodeQuery: 'Beethoven',
      targetField: 'albums.album',
      targetQueries: ['Symphony No. 5', 'Symphony No. 9', 'Moonlight Sonata'],
      projection: {
        composer: 'id_artists.artiste',
        album_name: 'albums.album',
        year: 'albums.street_date',
        album_id: 'albums.cb',
      },
      fuzzy: true,
      resultsPerQuery: 3,
      orderBy: { year: -1 },
      limit: 50,
    });

    console.log(`\nBeethoven search results: ${classicalSearch.totalResults}`);
    if (classicalSearch.metrics) {
      console.log('Performance metrics:', {
        searchTime: classicalSearch.metrics.search_time_ms || 'N/A',
        totalTime: classicalSearch.metrics.client_elapsed_ms || 'N/A',
      });
    }

    // Example 3: Complex search with specific field selection
    console.log('\n\nExample 3: Search for jazz albums with detailed metadata');
    const jazzSearch = await client.batchSearchWithJoins({
      tables: ['id_artists', 'album_artist', 'albums'],
      joins: [
        {
          $type: 'inner',
          $left: 'id_artists',
          $right: 'album_artist',
          $on: ['id_artists.id', 'album_artist.artist_id'],
        },
        {
          $type: 'inner',
          $left: 'album_artist',
          $right: 'albums',
          $on: ['album_artist.cb', 'albums.cb'],
        },
      ],
      nodeField: 'id_artists.artiste',
      nodeQuery: 'Miles Davis',
      targetField: 'albums.album',
      targetQueries: ['Kind of Blue', 'Bitches Brew', 'Sketches of Spain'],
      projection: ['id_artists.artiste', 'albums.album', 'albums.street_date', 'albums.cb'],
      fuzzy: true,
      resultsPerQuery: 5,
    });

    console.log(`\nMiles Davis albums found: ${jazzSearch.totalResults}`);

    // Use the statistics helper
    const stats = client.getSearchStats(jazzSearch.grouped);
    console.log('\nSearch statistics:');
    console.log(`  - Total groups: ${stats.totalGroups}`);
    console.log(`  - Average results per group: ${stats.averageGroupSize.toFixed(2)}`);
    console.log(`  - Empty groups: ${stats.emptyGroups}`);

    // Example 4: Error handling for join searches
    console.log('\n\nExample 4: Error handling for join searches');
    try {
      await client.batchSearchWithJoins({
        tables: ['non_existent_table', 'another_bad_table'],
        joins: [
          {
            $type: 'inner',
            $left: 'non_existent_table',
            $right: 'another_bad_table',
            $on: ['non_existent_table.id', 'another_bad_table.id'],
          },
        ],
        nodeField: 'non_existent_table.field',
        nodeQuery: 'test',
        targetField: 'another_bad_table.field',
        targetQueries: ['test'],
      });
    } catch (error: any) {
      console.log('Expected error handled:', error.message);
    }

    // Example 5: Comparison between simple and join search
    console.log('\n\nExample 5: Performance comparison');

    // First, try simple search (will fail if tables are separate)
    console.log('Note: Simple batch search only works on single tables.');
    console.log('For multi-table searches, use batchSearchWithJoins()');

    const startJoin = Date.now();
    const joinResult = await client.searchAlbumsByArtist('Mozart', ['Requiem'], 10);
    const joinTime = Date.now() - startJoin;

    console.log(`\nJoin search completed in ${joinTime}ms`);
    console.log(`Results: ${joinResult.totalResults}`);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the examples
joinSearchExamples().catch(console.error);
