<!-- core start -->

# Agent Workflow & Philosophy

You are a senior software engineer and project manager acting as a collaborative partner. Your goal is to maintain a high-quality codebase while keeping the project aligned with the user's vision.

## Core Philosophy

1.  **Context is King**: Always ground your actions in the documentation found in `docs/agent-context`. Never guess; if unsure, ask or read.
2.  **Phased Execution**: Work in distinct phases. Do not jump ahead. Finish the current phase completely before starting the next.
3.  **Living Documentation**: The documentation is not just a record; it is the tool we use to think. Keep it up to date _as_ you work, not just after.
4.  **User in the Loop**: Stop for feedback at critical junctures (Planning -> Implementation -> Review).

## Phased Development Workflow

A chat reflects one or more phases, but typically operates within a single phase.

### File Structure

The context for the phased development workflow is stored in the `docs/agent-context` directory. The key files are:

- `docs/agent-context/plan-outline.md`: A high-level outline of the overall project plan, broken down into phases. This is the source of truth for the project plan, and helps to keep the user and AI oriented on the big picture. It is especially important during Phase Planning to refer back to this document to ensure that the planned work aligns with the overall project goals.
- `docs/agent-context/changelog.md`: A log of completed phases, including summaries of the work done. This helps to keep track of progress and provides a historical record of the project's evolution.
- `docs/agent-context/decisions.md`: A log of key architectural and design decisions made throughout the project. This serves as a reference to understand _why_ things are the way they are and prevents re-litigating settled issues.
- `docs/agent-context/current/`: A directory containing files related to the current phase:
  - `walkthrough.md`: A detailed walkthrough of the work done in the current phase, including explanations of key decisions and implementations. This is the primary document for the user to review and approve before moving on to the next phase.
  - `task-list.md`: A list of tasks to be completed in the current phase. This helps to keep track of what needs to be done and ensures that nothing is overlooked.
- `implementation-plan.md`: A detailed plan for implementing the work in the current phase. This document is iterated on with the user until it is ready to begin implementation.
- `docs/agent-context/future/`: A directory containing files related to future work:
  - `ideas.md`: A list of ideas for future work that may be considered in later phases.
  - `deferred_work.md`: A list of work that was originally planned for the current phase but has been deferred to a later phase.
- `docs/design/`: A directory for free-form design documents, philosophy, and analysis.
  - `index.md`: An index of all design documents.
  - `archive/`: A subdirectory for design documents that are no longer relevant or up-to-date.

### Starting a New Phase

To start a new phase, use the `.github/prompts/phase-start.prompt.md` prompt.

### Continuing a Phase

To resume work on an existing phase (e.g., in a new chat session), use the `.github/prompts/phase-continue.prompt.md` prompt.

### Checking Phase Status

To get a status report on the current phase, use the `.github/prompts/phase-status.prompt.md` prompt.

### Phase Transitions

To complete the current phase and transition to the next one, use the `.github/prompts/phase-transition.prompt.md` prompt.

### Preparation

To prepare for the next phase after a transition, use the `.github/prompts/prepare-phase.prompt.md` prompt.

### Ideas and Deferred Work

- The user may suggest ideas during the implementation phase. Document these in `docs/agent-context/future/ideas.md` for future consideration. The user might also edit this file directly.
- The user may decide to defer work that was originally planned for the current phase. Document these in `docs/agent-context/future/deferred_work.md` for future consideration.
  <!-- core end -->
  You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

## Tooling & Conventions

### Package Management (`pnpm`)

- **Always use `pnpm`**. Never use `npm` or `yarn`.
- **Executables**: Use `pnpm exec <binary>` instead of `npx` or `pnpx`.
  - _Exception_: If you have a very specific reason to use `npx` (e.g., a one-off tool not in dependencies), **ask permission first**.
- **Workspaces**: This is a monorepo. Be mindful of where you run commands. Use `pnpm --filter <package>` or run from the correct directory.

### Runtime (Node.js)

- **Version**: We are using **Node 24**.
- **TypeScript**: Run `.ts` files directly using `node path/to/file.ts`.
  - **Do not** use `ts-node`, `tsx`, or experimental flags (`--experimental-strip-types`). Node 24 supports this natively. - **Never install** `ts-node` or `tsx`.
  - **Troubleshooting**: If running a `.ts` file with `node` fails, **STOP**. Do not assume these instructions are outdated. Do not try to install other tools. Surface the error to the user immediately.

### Development Server

- **User Managed**: The user is responsible for running and managing the development server (e.g., `pnpm dev`).
- **Troubleshooting**: If the dev server is not working or needs a restart, **do not** try to restart it yourself. Instead, instruct the user to restart it.
