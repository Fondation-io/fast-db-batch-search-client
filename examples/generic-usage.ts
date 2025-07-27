import { BatchSearchClient } from '../src';

async function genericBatchSearchExamples() {
  const client = new BatchSearchClient({
    baseUrl: process.env.FAST_DB_URL || 'http://localhost:8080',
    timeout: 30000,
    includeMetrics: true,
  });

  try {
    // Example 1: Search for albums by artist
    console.log('Example 1: Search for albums by a specific artist');
    const albumResults = await client.searchRelatedItems(
      'albums',
      'artist_name',
      'Mozart',
      'album_title',
      ['Requiem', 'Symphony No. 41', 'Symphony No. 39', 'The Magic Flute'],
      ['album_title', 'artist_name', 'release_year'],
      3
    );

    console.log(`Found ${albumResults.totalResults} albums`);
    Object.entries(albumResults.grouped).forEach(([hash, albums]) => {
      console.log(`\nGroup ${hash.substring(0, 8)}...:`);
      albums.forEach((album) => {
        console.log(`  - ${album.album_title} (${album.release_year || 'N/A'})`);
      });
    });

    // Example 2: Search for products by category
    console.log('\n\nExample 2: Search for products in a category');
    const productResults = await client.searchRelatedItems(
      'products',
      'category',
      'Electronics',
      'product_name',
      ['iPhone', 'MacBook', 'AirPods', 'iPad'],
      ['product_name', 'category', 'price', 'brand'],
      5
    );

    console.log(`Found ${productResults.totalResults} products`);
    if (productResults.metrics) {
      console.log('Search performance:', {
        searchTime: productResults.metrics.search_time_ms || 'N/A',
        totalTime: productResults.metrics.client_elapsed_ms || 'N/A',
      });
    }

    // Example 3: Search for related entities in a graph-like structure
    console.log('\n\nExample 3: Search for related entities');
    const relatedEntities = await client.batchSearch(
      'relationships',
      'parent_id', // node field
      'ROOT_NODE_123', // node query
      'child_name', // target field
      ['Child A', 'Child B', 'Child C'], // target queries
      ['parent_id', 'child_id', 'child_name', 'relationship_type'],
      true,
      10
    );

    console.log(`Found ${relatedEntities.totalResults} related entities`);

    // Example 4: Multi-table join scenario simulation
    console.log('\n\nExample 4: Simulating join-like behavior with batch search');

    // First, find all tracks by an artist
    const artistTracks = await client.batchSearch(
      'track_artist',
      'artist_id',
      '61705', // W.A. Mozart ID
      'track_title',
      ['Requiem', 'Lacrimosa', 'Dies Irae'],
      ['track_id', 'artist_id', 'track_title', 'album_id'],
      true,
      5
    );

    // Then use the album IDs to find album details
    if (artistTracks.totalResults > 0) {
      const albumIds = [
        ...new Set(artistTracks.results.map((track) => track.album_id).filter((id) => id != null)),
      ] as string[];

      console.log(`\nFound tracks in ${albumIds.length} different albums`);
    }

    // Example 5: Using the generic interface for any node-target relationship
    console.log('\n\nExample 5: Generic node-target search');
    const genericResults = await client.batchSearch(
      'users',
      'department', // node field - group users by department
      'Engineering', // node query - specific department
      'username', // target field - search by username
      ['john.doe', 'jane.smith', 'bob.wilson'], // target queries
      ['username', 'email', 'department', 'role'],
      true,
      3
    );

    console.log(`Found ${genericResults.totalResults} users in Engineering department`);

    // Show search statistics
    const stats = client.getSearchStats(genericResults.grouped);
    console.log('\nSearch statistics:');
    console.log(`  - Total search groups: ${stats.totalGroups}`);
    console.log(`  - Average results per group: ${stats.averageGroupSize.toFixed(2)}`);
  } catch (error) {
    console.error('Error in generic batch search examples:', error);
  }
}

// Run the examples
genericBatchSearchExamples().catch(console.error);
