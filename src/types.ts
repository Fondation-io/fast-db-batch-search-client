/**
 * Types for Fast-DB Batch Search API
 */

export interface BatchSearchQuery {
  $node_field: string;
  $node_query: string;
  $target_field: string;
  $target_queries: string[];
  $fuzzy?: boolean;
  $results_per_query?: number;
}

export interface JoinCondition {
  $type: 'inner' | 'left' | 'right' | 'full';
  $left: string;
  $right: string;
  $on: [string, string];
}

export interface QueryRequest {
  query: {
    $select: string[] | Record<string, string>;
    $from: string | string[];
    $join?: JoinCondition[];
    $where: {
      $batch: BatchSearchQuery;
    };
    $orderBy?: Record<string, number>;
    $limit?: number;
  };
  include_metrics?: boolean;
}

export interface SearchResult {
  [key: string]: string | number | boolean | null | undefined; // Dynamic fields based on projection
  search_group_hash: string;
  score?: number;
}

export interface QueryMetrics {
  total_time_ms?: number;
  search_time_ms?: number;
  polars_time_ms?: number;
  rows_examined?: number;
  rows_returned?: number;
  used_index?: boolean;
  plan_type?: string;
}

export interface DataFrameResponse {
  columns: string[];
  rows: (string | number | boolean | null)[][];
  row_count: number;
  metadata?: Record<string, unknown>;
}

export interface QueryResponse {
  success: boolean;
  data: DataFrameResponse | null;
  error: string | null;
  elapsed_ms: number;
  metrics?: QueryMetrics | null;
}

export interface BatchSearchOptions {
  baseUrl?: string;
  timeout?: number;
  includeMetrics?: boolean;
}

export interface GroupedResults {
  [hash: string]: SearchResult[];
}

export interface JoinSearchParams {
  tables: string[];
  joins: JoinCondition[];
  nodeField: string;
  nodeQuery: string;
  targetField: string;
  targetQueries: string[];
  projection?: string[] | Record<string, string>;
  fuzzy?: boolean;
  resultsPerQuery?: number;
  orderBy?: Record<string, number>;
  limit?: number;
}
