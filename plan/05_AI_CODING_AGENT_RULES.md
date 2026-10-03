# AI CODING AGENT RULES

Follow these rules while implementing the project.

## Behavior

1. Read all project specification files before changing code.
2. Implement one milestone at a time.
3. Do not skip foundational architecture to reach browser automation faster.
4. Keep the project runnable after every milestone.
5. Never replace working modules with large rewrites unless necessary.
6. Explain significant architectural decisions in code comments or documentation.
7. Update documentation when behavior changes.
8. Write tests for core logic.
9. Never hardcode credentials.
10. Never print secrets to logs.

## When Something Is Unclear

Prefer the following order:

1. Follow `00_MASTER_BUILD_PROMPT.md`.
2. Follow `01_PRODUCT_REQUIREMENTS.md`.
3. Follow `02_TECHNICAL_ARCHITECTURE.md`.
4. Follow `03_IMPLEMENTATION_PLAN.md`.
5. Use `04_ACCEPTANCE_CRITERIA.md` to verify behavior.

If a provider-specific integration is unclear, keep the provider interface correct and implement a mock/stub rather than coupling the entire application to an assumption.

## Coding Style

- TypeScript strict.
- Small focused modules.
- Strong typing.
- Zod validation at external boundaries.
- Async functions must handle timeout/error cases.
- No unrestricted renderer access to Node.
- No giant 1000-line service files.
- Separate domain logic from UI.
- Separate provider code from orchestration.
- Keep filesystem paths platform-safe.
- Prefer `spawn` with argument arrays over shell command strings.

## Commit/Checkpoint Strategy

After each milestone:

1. run lint
2. run tests
3. run build/typecheck
4. fix failures
5. update README/status
6. summarize what is complete and what remains

## Do Not Implement Yet Unless Requested

- TikTok automatic posting
- multi-user auth
- cloud backend
- payment system
- analytics scraping
- unrelated trading execution features

Stay focused on the content-automation application.
