# Project Guidelines

## ESLint Rules

- **Import ordering**: This project uses `perfectionist/sort-imports`. Imports must be sorted alphabetically by path. For relative imports, shorter paths (e.g., `./constant`) must come before longer paths (e.g., `./utils`), and sibling imports (`./`) must come before parent imports (`../`).

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
