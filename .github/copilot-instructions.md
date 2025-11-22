# Copilot instructions for meli-trends

These instructions help AI coding agents become productive quickly in this repository. They emphasize concrete, discoverable patterns and commands to run in the workspace before making code changes.

1) First-responder checklist (run these in the integrated terminal)
- List top-level files: ls -la
- Show package metadata (if present): cat package.json || cat pyproject.toml || cat Cargo.toml
- Show README: sed -n '1,120p' README.md
- Find CI and AI convention files:
  - grep -R --line-number -E "copilot-instructions|AGENT|AGENTS|CLAUDE|.cursorrules|.windsurfrules|.clinerules" . || true

2) Where to understand the "big picture"
- Root files: README.md, package.json, pyproject.toml, Dockerfile, docker-compose.yml, .github/workflows/*
- Source layout: inspect top-level src/ (or api/, app/, server/) for:
  - entry point (e.g., src/index.ts, src/main.py, server.ts)
  - routing layer (src/routes or src/controllers)
  - business logic/services (src/services, src/use_cases)
  - persistence/config (src/db, src/config, .env, config/*.ts)
- Example exploration commands:
  - sed -n '1,200p' src/index.ts
  - rg "express|FastAPI|Flask|create_app|new Router" --hidden || true

3) Build / run / test commands (discover, then use)
- Always inspect package.json scripts or pyproject.toml/tool.poetry.scripts to discover canonical commands:
  - jq -r '.scripts' package.json || cat package.json
- Common commands to try if present:
  - npm install && npm run dev
  - npm run build && npm start
  - npm test or yarn test
  - docker build -t meli-trends . && docker run -p 3000:3000 meli-trends
- For tests, run with verbose output and the app in dev mode if failing: npm test -- --runInBand

4) Patterns and conventions to follow in this repo
- Prefer modifying code where single-responsibility modules exist:
  - Keep API route handlers thin; move business logic to services/use_cases
  - Config values live in .env or config/* — don't hardcode secrets
- Tests: follow existing test structure (unit/ vs integration/) and naming conventions found under tests/ or __tests__/
- TypeScript: respect tsconfig.json compilerOptions (strictness/paths). Update types there.

5) Integration points to verify before edits
- External APIs and keys: check .env.example, src/config or services/meliClient*
- Database: check config/db, migrations, prisma/schema.prisma or alembic/ for DB integration
- Message buses / queues: look for kafka, redis, rabbitmq clients in src/ or scripts/

6) Pull-request friendly edits
- Run linters and formatters before committing:
  - npm run lint && npm run format
- Run tests and ensure code coverage doesn't drop (use repo scripts)
- If adding behavior, add unit tests mirroring test patterns under tests/

7) When making changes, produce:
- Small focused commits with test(s)
- A short PR description referencing the files changed and how to reproduce locally

8) If you (the agent) are unsure:
- Run a workspace search for relevant symbols: rg "functionName|ServiceName|class .*Service" -n
- Open candidate files and summarize them before modifying (return 2–5 line synopsis)
- Ask for a quick human confirmation before wide refactors

9) Useful file targets to inspect first (if present)
- README.md
- package.json / pyproject.toml
- src/index.ts | src/main.py | server.ts
- src/routes | src/controllers | src/services
- src/config | .env.example
- tests/ or __tests__/
- .github/workflows/*

If this draft is missing repo-specific patterns, I can scan the workspace for existing AI convention files and live source files to merge/update this doc. Shall I run that search and produce a refined version?
