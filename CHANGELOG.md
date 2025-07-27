# [3.0.0](https://github.com/fondation-io/fast-db-batch-search-client/compare/v2.0.1...v3.0.0) (2025-07-27)

### Features

- generalize API from author/title to node/target model ([1310a9d](https://github.com/fondation-io/fast-db-batch-search-client/commit/1310a9db59678b2b8ff06372c4d23dd574166d2b))

### BREAKING CHANGES

- API field names have changed from author_field/title_field to node_field/target_field. Server must be updated to support new field names.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>

## [2.0.1](https://github.com/fondation-io/fast-db-batch-search-client/compare/v2.0.0...v2.0.1) (2025-07-25)

### Bug Fixes

- ensure dist folder is included in npm package ([15a4d7c](https://github.com/fondation-io/fast-db-batch-search-client/commit/15a4d7c84bd6d2cde6ef4b31f1b2dc5ae20a2546))

# [2.0.0](https://github.com/fondation-io/fast-db-batch-search-client/compare/v1.0.1...v2.0.0) (2025-07-25)

### Bug Fixes

- correct all examples to match actual BatchSearchClient API ([9289fb7](https://github.com/fondation-io/fast-db-batch-search-client/commit/9289fb7cfc38c99906cc3f014ed80572e43e2fcb))

### BREAKING CHANGES

- The examples now correctly show that batchSearch expects a single author and a list of titles, not multiple independent searches.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>

## [1.0.1](https://github.com/fondation-io/fast-db-batch-search-client/compare/v1.0.0...v1.0.1) (2025-07-24)

### Bug Fixes

- update GitHub Actions to latest versions ([459f058](https://github.com/fondation-io/fast-db-batch-search-client/commit/459f05845132f742b8ac6f1cb103e5e6a4c9cb3a))

# 1.0.0 (2025-07-24)

### Bug Fixes

- add package-lock.json for CI/CD ([0916499](https://github.com/fondation-io/fast-db-batch-search-client/commit/0916499c779ac3f1d28512fbc98df155fe6c55c9))
- resolve all TypeScript linting errors ([89c615c](https://github.com/fondation-io/fast-db-batch-search-client/commit/89c615cfeec41b480f72b70cf7a32ae4706532a3))
- update package name to [@fondation-io](https://github.com/fondation-io) scope ([d2fd9ba](https://github.com/fondation-io/fast-db-batch-search-client/commit/d2fd9ba7699619894d4e699c8258f2c62f3581f7))

### Features

- add comprehensive project enhancements ([c1b18c8](https://github.com/fondation-io/fast-db-batch-search-client/commit/c1b18c868f1e214e92dfb65c2388daec74599920))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-07-24

### Added

- Initial release of Fast-DB Batch Search Client
- TypeScript client library for Fast-DB's batch search API
- Support for fuzzy search with Levenshtein distance
- Batch search operations for multiple queries
- Progress tracking for batch operations
- Comprehensive type definitions
- Automatic retry logic for failed requests
- Examples and documentation
- CI/CD pipeline with GitHub Actions
- NPM package publishing
