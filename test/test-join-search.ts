import { BatchSearchClient } from '../src';

const SERVER_URL = process.env.FAST_DB_URL || 'http://localhost:8080';

async function testJoinSearch() {
  console.log('🧪 Testing Fast-DB Batch Search Client with Joins\n');

  const client = new BatchSearchClient({
    baseUrl: SERVER_URL,
    timeout: 30000,
    includeMetrics: true,
  });

  let totalTests = 0;
  let passedTests = 0;

  // Test 1: Basic join search
  console.log('Test 1: Basic join search for Mozart albums');
  totalTests++;
  try {
    const result = await client.searchAlbumsByArtist('Mozart', ['Symphony 41', 'Requiem'], 5);

    if (result.totalResults > 0) {
      console.log('✅ Test 1 passed: Found', result.totalResults, 'results');
      passedTests++;
    } else {
      console.log('❌ Test 1 failed: No results found');
    }
  } catch (error: any) {
    console.log('❌ Test 1 failed with error:', error.message);
  }

  // Test 2: Custom join with specific projection
  console.log('\nTest 2: Custom join with field mapping');
  totalTests++;
  try {
    const result = await client.batchSearchWithJoins({
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
      nodeQuery: 'Mozart',
      targetField: 'albums.album',
      targetQueries: ['Symphony'],
      projection: {
        artist: 'artiste',
        album: 'album',
        year: 'street_date',
      },
      fuzzy: true,
      resultsPerQuery: 3,
    });

    if (result.totalResults > 0 && result.results[0].artist && result.results[0].album) {
      console.log('✅ Test 2 passed: Field mapping works correctly');
      passedTests++;
    } else {
      console.log('❌ Test 2 failed: Field mapping issue');
    }
  } catch (error: any) {
    console.log('❌ Test 2 failed with error:', error.message);
  }

  // Test 3: Verify grouping functionality
  console.log('\nTest 3: Verify result grouping');
  totalTests++;
  try {
    const result = await client.batchSearchWithJoins({
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
      nodeQuery: 'Mozart',
      targetField: 'albums.album',
      targetQueries: ['Symphony 40', 'Symphony 41', 'Requiem'],
      fuzzy: true,
      resultsPerQuery: 5,
    });

    const groupCount = Object.keys(result.grouped).length;
    if (groupCount > 0 && groupCount <= 3) {
      console.log(`✅ Test 3 passed: Results properly grouped into ${groupCount} groups`);
      passedTests++;
    } else {
      console.log(`❌ Test 3 failed: Unexpected group count: ${groupCount}`);
    }
  } catch (error: any) {
    console.log('❌ Test 3 failed with error:', error.message);
  }

  // Test 4: Test metrics
  console.log('\nTest 4: Verify metrics are returned');
  totalTests++;
  try {
    const result = await client.batchSearchWithJoins({
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
      nodeQuery: 'Mozart',
      targetField: 'albums.album',
      targetQueries: ['Symphony'],
      fuzzy: true,
    });

    if (result.metrics && result.metrics.client_elapsed_ms) {
      console.log('✅ Test 4 passed: Metrics included');
      passedTests++;
    } else {
      console.log('❌ Test 4 failed: No metrics returned');
    }
  } catch (error: any) {
    console.log('❌ Test 4 failed with error:', error.message);
  }

  // Test 5: Test statistics calculation
  console.log('\nTest 5: Test statistics calculation');
  totalTests++;
  try {
    const result = await client.searchAlbumsByArtist('Mozart', ['Symphony 40', 'Symphony 41'], 3);

    const stats = client.getSearchStats(result.grouped);
    if (
      stats.totalGroups >= 0 &&
      stats.averageGroupSize >= 0 &&
      Object.keys(stats.groupSizes).length === stats.totalGroups
    ) {
      console.log('✅ Test 5 passed: Statistics calculated correctly');
      passedTests++;
    } else {
      console.log('❌ Test 5 failed: Statistics calculation error');
    }
  } catch (error: any) {
    console.log('❌ Test 5 failed with error:', error.message);
  }

  // Test 6: Test ordering
  console.log('\nTest 6: Test result ordering');
  totalTests++;
  try {
    const result = await client.batchSearchWithJoins({
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
      nodeQuery: 'Mozart',
      targetField: 'albums.album',
      targetQueries: ['Symphony'],
      projection: ['artiste', 'album', 'street_date'],
      orderBy: { street_date: -1 },
      limit: 10,
      fuzzy: true,
    });

    if (result.totalResults > 0 && result.totalResults <= 10) {
      console.log('✅ Test 6 passed: Ordering and limit work correctly');
      passedTests++;
    } else {
      console.log('❌ Test 6 failed: Ordering/limit issue');
    }
  } catch (error: any) {
    console.log('❌ Test 6 failed with error:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Test Summary: ${passedTests}/${totalTests} tests passed`);
  if (passedTests === totalTests) {
    console.log('✅ All tests passed!');
  } else {
    console.log(`❌ ${totalTests - passedTests} tests failed`);
    process.exit(1);
  }
}

// Run the tests
testJoinSearch().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
