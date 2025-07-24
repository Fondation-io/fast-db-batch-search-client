#!/usr/bin/env tsx
/**
 * Test script for Fast-DB Batch Search Client
 */

import { BatchSearchClient } from '../src';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function printSeparator() {
  console.log('='.repeat(80));
}

function printSuccess(message: string) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function printError(message: string) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function printInfo(message: string) {
  console.log(`${colors.cyan}🔍 ${message}${colors.reset}`);
}

function printWarning(message: string) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

async function testHarryPotterSearch() {
  printInfo('Testing batch search for Harry Potter titles by J.K. Rowling');
  
  const client = new BatchSearchClient({
    baseUrl: 'http://localhost:8080',
    includeMetrics: true
  });

  const harryPotterTitles = [
    "Harry Potter école sorciers",
    "Harry Potter chambre secrets",
    "Harry Potter prisonnier Azkaban",
    "Harry Potter coupe feu",
    "Harry Potter ordre phénix",
    "Harry Potter prince sang",
    "Harry Potter reliques mort"
  ];

  try {
    const startTime = Date.now();
    const result = await client.batchSearch(
      'books',
      'auteurs',
      'Rowling',
      'titre',
      harryPotterTitles,
      ['titre', 'auteurs'],
      true,
      3
    );
    const elapsedTime = Date.now() - startTime;

    printSuccess(`Query completed in ${elapsedTime}ms`);
    console.log(`Total results found: ${result.totalResults}`);
    
    if (result.metrics) {
      console.log(`Search time: ${result.metrics.search_time_ms || 'N/A'}ms`);
      console.log(`Rows examined: ${result.metrics.rows_examined || 'N/A'}`);
    }

    // Display grouped results
    const stats = client.getSearchStats(result.grouped);
    console.log(`\nResults grouped by search query (${stats.totalGroups} groups):`);
    
    let groupIndex = 1;
    for (const [hash, books] of Object.entries(result.grouped)) {
      console.log(`\n${colors.magenta}📚 Group ${groupIndex} (hash: ${hash.substring(0, 8)}...)${colors.reset}`);
      books.slice(0, 3).forEach((book, index) => {
        console.log(`   ${index + 1}. ${book.titre || 'N/A'} - ${book.auteurs || 'N/A'}`);
        if (book.score !== undefined) {
          console.log(`      Score: ${book.score.toFixed(2)}`);
        }
      });
      groupIndex++;
    }

    return true;
  } catch (error: any) {
    printError(`Error: ${error.message}`);
    return false;
  }
}

async function testJeanDeLaFontaineSearch() {
  printInfo('\nTesting batch search for Jean de La Fontaine titles');
  
  const client = new BatchSearchClient();

  try {
    const startTime = Date.now();
    const result = await client.batchSearch(
      'books',
      'auteurs',
      'jean de la fontaine',
      'titre',
      ['Fables'],
      ['titre', 'auteurs'],
      true,
      2
    );
    const elapsedTime = Date.now() - startTime;

    printSuccess(`Query completed in ${elapsedTime}ms`);
    console.log(`Total results found: ${result.totalResults}`);
    
    if (result.metrics) {
      console.log(`Search time: ${result.metrics.search_time_ms || 'N/A'}ms`);
      console.log(`Rows examined: ${result.metrics.rows_examined || 'N/A'}`);
    }

    // Display results
    if (result.totalResults > 0) {
      const stats = client.getSearchStats(result.grouped);
      console.log(`\nResults grouped by search query (${stats.totalGroups} groups):`);
      
      for (const [hash, books] of Object.entries(result.grouped)) {
        console.log(`\n${colors.magenta}📚 Group (hash: ${hash.substring(0, 8)}...)${colors.reset}`);
        books.forEach((book, index) => {
          console.log(`   ${index + 1}. ${book.titre || 'N/A'} - ${book.auteurs || 'N/A'}`);
        });
      }
    } else {
      printWarning('No results found!');
    }

    return true;
  } catch (error: any) {
    printError(`Error: ${error.message}`);
    return false;
  }
}

async function testConvenienceMethod() {
  printInfo('\nTesting convenience method searchBookSeries');
  
  const client = new BatchSearchClient();

  try {
    const result = await client.searchBookSeries(
      'Tolkien',
      ['Seigneur anneaux', 'Hobbit', 'Silmarillion'],
      2
    );

    printSuccess(`Found ${result.totalResults} results`);
    
    const stats = client.getSearchStats(result.grouped);
    console.log(`Groups: ${stats.totalGroups}`);
    console.log(`Average group size: ${stats.averageGroupSize.toFixed(2)}`);

    return true;
  } catch (error: any) {
    printError(`Error: ${error.message}`);
    return false;
  }
}

async function main() {
  printSeparator();
  console.log(`${colors.bright}Testing Fast-DB Batch Search Client${colors.reset}`);
  printSeparator();

  try {
    await testHarryPotterSearch();
    console.log();
    await testJeanDeLaFontaineSearch();
    console.log();
    await testConvenienceMethod();
  } catch (error: any) {
    printError(`Unexpected error: ${error.message}`);
  }

  printSeparator();
  console.log('Tests completed!');
}

// Run the tests
main().catch(console.error);