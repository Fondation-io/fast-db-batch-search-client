import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  QueryRequest,
  QueryResponse,
  SearchResult,
  BatchSearchOptions,
  GroupedResults,
  DataFrameResponse,
} from './types';

/**
 * Client for Fast-DB Batch Search API
 */
export class BatchSearchClient {
  private axios: AxiosInstance;
  private includeMetrics: boolean;

  constructor(options: BatchSearchOptions = {}) {
    const { baseUrl = 'http://localhost:8080', timeout = 30000, includeMetrics = true } = options;

    this.axios = axios.create({
      baseURL: baseUrl,
      timeout: timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.includeMetrics = includeMetrics;
  }

  /**
   * Execute a batch search query
   * @param table The table/collection to search in
   * @param nodeField The field containing node information
   * @param nodeQuery The node to search for
   * @param targetField The field containing target information
   * @param targetQueries Array of target queries to search for
   * @param projection Fields to return in results
   * @param fuzzy Whether to use fuzzy search (default: true)
   * @param resultsPerQuery Maximum results per target query (default: 10)
   */
  async batchSearch(
    table: string,
    nodeField: string,
    nodeQuery: string,
    targetField: string,
    targetQueries: string[],
    projection: string[] = ['*'],
    fuzzy: boolean = true,
    resultsPerQuery: number = 10
  ): Promise<{
    results: SearchResult[];
    grouped: GroupedResults;
    metrics?: Record<string, unknown>;
    totalResults: number;
  }> {
    const query: QueryRequest = {
      query: {
        $select: projection,
        $from: table,
        $where: {
          $batch: {
            $node_field: nodeField,
            $node_query: nodeQuery,
            $target_field: targetField,
            $target_queries: targetQueries,
            $fuzzy: fuzzy,
            $results_per_query: resultsPerQuery,
          },
        },
      },
      include_metrics: this.includeMetrics,
    };

    try {
      const startTime = Date.now();
      const response = await this.axios.post<QueryResponse>('/query', query);
      const elapsedTime = Date.now() - startTime;

      if (!response.data.success) {
        throw new Error(response.data.error || 'Query failed');
      }

      const data = response.data.data;
      if (!data) {
        return {
          results: [],
          grouped: {},
          metrics: response.data.metrics as Record<string, unknown> | undefined,
          totalResults: 0,
        };
      }

      // Convert DataFrame response to array of objects
      const results = this.dataFrameToObjects(data);

      // Group results by search_group_hash
      const grouped = this.groupResultsByHash(results);

      return {
        results,
        grouped,
        metrics: {
          ...(response.data.metrics || {}),
          client_elapsed_ms: elapsedTime,
        } as Record<string, unknown>,
        totalResults: results.length,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      if (axiosError.response) {
        throw new Error(
          `API Error: ${axiosError.response.data?.error || axiosError.response.statusText}`
        );
      } else if (axiosError.request) {
        throw new Error('Network error: No response from server');
      } else {
        throw error;
      }
    }
  }

  /**
   * Convert DataFrame response to array of objects
   */
  private dataFrameToObjects(data: DataFrameResponse): SearchResult[] {
    const { columns, rows } = data;
    return rows.map((row) => {
      const obj: SearchResult = { search_group_hash: '' };
      columns.forEach((col, index) => {
        obj[col] = row[index] as string | number | boolean | null;
      });
      return obj;
    });
  }

  /**
   * Group results by search_group_hash
   */
  private groupResultsByHash(results: SearchResult[]): GroupedResults {
    const groups: GroupedResults = {};

    for (const result of results) {
      const hash = result.search_group_hash || 'unknown';
      if (!groups[hash]) {
        groups[hash] = [];
      }
      groups[hash].push(result);
    }

    return groups;
  }

  /**
   * Convenience method for searching book series by author
   * @deprecated Use searchRelatedItems instead
   */
  async searchBookSeries(
    author: string,
    seriesTitles: string[],
    maxPerTitle: number = 3
  ): Promise<{
    results: SearchResult[];
    grouped: GroupedResults;
    metrics?: Record<string, unknown>;
    totalResults: number;
  }> {
    return this.batchSearch(
      'books',
      'auteurs',
      author,
      'titre',
      seriesTitles,
      ['titre', 'auteurs'],
      true,
      maxPerTitle
    );
  }

  /**
   * Generic method for searching related items by a common node
   */
  async searchRelatedItems(
    table: string,
    nodeField: string,
    nodeValue: string,
    targetField: string,
    targetValues: string[],
    projection?: string[],
    maxPerTarget: number = 3
  ): Promise<{
    results: SearchResult[];
    grouped: GroupedResults;
    metrics?: Record<string, unknown>;
    totalResults: number;
  }> {
    return this.batchSearch(
      table,
      nodeField,
      nodeValue,
      targetField,
      targetValues,
      projection || ['*'],
      true,
      maxPerTarget
    );
  }

  /**
   * Get search statistics from grouped results
   */
  getSearchStats(grouped: GroupedResults): {
    totalGroups: number;
    groupSizes: { [hash: string]: number };
    averageGroupSize: number;
    emptyGroups: number;
  } {
    const groupSizes: { [hash: string]: number } = {};
    let totalItems = 0;
    let emptyGroups = 0;

    for (const [hash, items] of Object.entries(grouped)) {
      groupSizes[hash] = items.length;
      totalItems += items.length;
      if (items.length === 0) {
        emptyGroups++;
      }
    }

    const totalGroups = Object.keys(grouped).length;
    const averageGroupSize = totalGroups > 0 ? totalItems / totalGroups : 0;

    return {
      totalGroups,
      groupSizes,
      averageGroupSize,
      emptyGroups,
    };
  }
}
