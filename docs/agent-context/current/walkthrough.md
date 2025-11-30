# Phase 18: Visual Regression Testing & Deployment

## Summary

In this phase, we established a robust "Design Review" workflow using automated visual regression testing with Playwright. This system acts as a safety net for UI changes and a tool for reviewing design updates. We also finalized the deployment pipeline, successfully deploying the application to Vercel and connecting it to a production Neon Postgres database.

## Key Changes

### Visual Regression Testing
- **Playwright Configuration**: Configured `playwright.config.ts` to support visual comparison tests across desktop and mobile viewports.
- **Test Suite**: Created `e2e/visual.spec.ts` covering key UI states:
  - **Home Screen**: Validates the layout of the level selection screen.
  - **Library**: Checks the campaign and level pack display.
  - **Game (Level 1)**: Verifies the game interface, including the grid and tray.
  - **Builder**: Ensures the complex Builder UI (palette, grid, tools) renders correctly.
- **Workflow Scripts**: Added NPM scripts to streamline the testing process:
  - `pnpm test:visual`: Runs the visual tests (non-blocking).
  - `pnpm test:visual:review`: Opens the HTML report to inspect differences.
  - `pnpm test:visual:approve`: Updates the baseline snapshots.

### Deployment & Infrastructure
- **Vercel Deployment**: Configured the project for Vercel hosting using `@sveltejs/adapter-auto`.
- **Database Setup**:
  - Provisioned a **Neon Postgres** database via the Vercel Marketplace.
  - Linked the database to the Vercel project.
  - Configured `drizzle.config.ts` and `src/lib/server/db/index.ts` to handle Vercel's environment variables (`POSTGRES_URL`).
  - Pushed the database schema (`user`, `session`, `feedback` tables) to production.
- **Environment Management**:
  - Updated `.env.local` with production credentials.
  - Verified the application handles missing credentials gracefully (or fails fast with a clear error).

## Technical Decisions

- **Non-Blocking Tests**: We configured the Playwright reporter to `['html', { open: 'never' }]` to prevent the test run from blocking the CI/CD pipeline or local development flow.
- **Neon over Vercel Postgres**: We chose the Neon integration from the Vercel Marketplace as Vercel is transitioning away from its native Postgres offering. This ensures long-term support and feature parity.
- **Custom Auth vs. Managed Auth**: We explicitly disabled Neon's "Auth" feature to rely on our existing custom authentication implementation using `@oslojs/crypto` and `@node-rs/argon2`.

## How to Try It Out

### 1. Run Visual Tests
To verify the visual integrity of the application:

```bash
# Run the visual tests
pnpm test:visual

# If there are failures, review the report
pnpm test:visual:review

# If the changes are intentional, approve them
pnpm test:visual:approve
```

### 2. Verify Deployment
Visit the production URL to see the live application:
[https://learn-coding-q0z9g8l76-yehuda-katzs-projects.vercel.app](https://learn-coding-q0z9g8l76-yehuda-katzs-projects.vercel.app)

### 3. Check Database Connection
To verify the database is connected and working:
1.  Open the deployed app.
2.  Navigate to the **Feedback** section (if available) or any feature that requires persistence.
3.  (Alternatively) Check the Vercel logs for any database connection errors.
