# Project Guidelines

## ESLint Rules

- **Import ordering**: This project uses `perfectionist/sort-imports`. Imports must be sorted alphabetically by path. For relative imports, shorter paths (e.g., `./constant`) must come before longer paths (e.g., `./utils`), and sibling imports (`./`) must come before parent imports (`../`).
