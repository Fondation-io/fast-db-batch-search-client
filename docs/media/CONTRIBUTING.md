# Contributing to Fast-DB Batch Search Client

First off, thank you for considering contributing to Fast-DB Batch Search Client! It's people like you that make this project possible.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include code samples and error messages if applicable**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Create an issue and provide the following information:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Setup

1. Clone your fork:

   ```bash
   git clone https://github.com/your-username/fast-db-batch-search-client.git
   cd fast-db-batch-search-client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:

   ```bash
   npm run build
   ```

4. Run tests:

   ```bash
   npm test
   ```

5. Run linting:
   ```bash
   npm run lint
   ```

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. This leads to more readable messages that are easy to follow when looking through the project history. It also enables automatic version management via semantic-release.

### Commit Message Format

Each commit message consists of a **header**, a **body** and a **footer**. The header has a special format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

#### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

#### Scope

The scope should be the name of the module affected (as perceived by the person reading the changelog generated from commit messages).

#### Subject

The subject contains a succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize the first letter
- no dot (.) at the end

### Examples

```
feat(client): add progress tracking for batch operations
```

```
fix(types): correct type definition for search results
```

```
docs(readme): update installation instructions
```

## Code Style

- We use TypeScript for type safety
- We use ESLint for linting
- We use Prettier for code formatting
- Run `npm run format` before committing

## Testing

- Write tests for any new functionality
- Ensure all tests pass before submitting a PR
- Aim for high code coverage

## Documentation

- Update the README.md if you change functionality
- Add JSDoc comments to all public APIs
- Update the examples if you add new features

## Release Process

We use semantic-release to automatically release new versions based on commit messages. When a PR is merged to main:

1. semantic-release analyzes the commits
2. Determines the next version number
3. Generates the changelog
4. Creates a GitHub release
5. Publishes to npm

## Questions?

Feel free to open an issue with your question or contact the maintainers directly.

Thank you for contributing! 🎉
