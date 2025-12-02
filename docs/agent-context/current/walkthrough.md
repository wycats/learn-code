# Phase 24 Walkthrough

## Schema Stability (Ad-hoc Request)

Before diving into the visual work, we addressed a request to ensure the stability of our level data schema. As the project grows, ensuring that old levels (user data) continue to load correctly is critical.

### The "Golden Master" Approach

We implemented a "Golden Master" testing strategy. Instead of relying on static schema diffs (which can miss runtime validation logic), we save actual JSON snapshots of our levels and run them through the current Zod parser.

1.  **Fixtures**: We created `src/fixtures/levels/v1/` and populated it with JSON exports of all current built-in levels.
2.  **Compatibility Test**: We wrote `src/lib/game/schema-compat.test.ts`. This test:
    - Reads every file in the fixtures directory.
    - Runs `LevelDefinitionSchema.safeParse(json)`.
    - Fails if the parse fails.
3.  **Migration Support**: We added a `migrateLevel` hook. If parsing fails, the test attempts to run the JSON through this migration function and tries parsing again. This gives us a clear path to handle breaking changes: write a migration.
4.  **Comprehensive Coverage**: To ensure we catch changes to fields not currently used in the game (like `characters` or `media`), we created a synthetic `comprehensive.json` fixture that exercises every optional field and union type in the schema.

This infrastructure provides a safety net for future development, ensuring we don't accidentally break user content.

## Visual Regression Suite

With the schema stable, we moved to the primary goal of Phase 24: Visual Polish & Coverage. We established a comprehensive visual regression test suite using Playwright and Argos CI.

### Test Architecture

We created `e2e/visual-comprehensive.spec.ts` to serve as our visual baseline. This suite covers:

- **Home Screen**: Light and Dark mode.
- **Library**: Pack listing and details.
- **Game Interface**: The core gameplay UI, including the instruction bar and grid.
- **Builder Interface**: The level editor, including the tool tray and story editor.

### Key Implementation Details

- **Animation Disabling**: We injected CSS to disable animations and transitions during tests to ensure consistent snapshots.
- **Theme Forcing**: We programmatically toggle `data-theme` to capture both Light and Dark modes in a single run.
- **Interaction Testing**: The tests don't just load pages; they interact with the UI (e.g., opening the Story Editor in the Builder) to capture dynamic states.

## Mobile Polish

Using the insights from our visual review and code audit, we improved the mobile experience.

### Builder Improvements

- **Modal Responsiveness**: We updated `BuilderGoalModal` to use `min(350px, 90vw)` for its width. This prevents the modal from overflowing the screen on small devices (like iPhone SE), ensuring the "Done" button is always accessible.
- **Toolbar Layout**: Verified that the Builder toolbar handles overflow gracefully with horizontal scrolling.

### Library Improvements

- **Responsive Header**: We added a media query to the Library page. On screens narrower than 600px, the header now stacks the logo and action buttons vertically. This prevents the buttons from squashing the title or overflowing the viewport.
- **Padding Adjustments**: Reduced container padding on mobile to maximize usable screen real estate.

## How to Try It Out

### 1. Run Visual Tests

To verify the visual regression suite locally:

```bash
# Run the comprehensive visual suite
pnpm exec playwright test e2e/visual-comprehensive.spec.ts
```

This will generate screenshots in the `test-results` directory.

### 2. Verify Mobile Layouts

To see the mobile polish improvements:

1.  Start the dev server: `pnpm dev`
2.  Open your browser's DevTools and toggle Device Mode.
3.  Select a small device (e.g., iPhone SE or Pixel 5).
4.  **Library**: Navigate to `/library`. Observe that the header buttons stack vertically below the logo.
5.  **Builder**: Navigate to `/builder`. Open the Settings (gear icon). Verify the modal fits within the screen width and the "Done" button is visible without scrolling the page body.

### 3. Check Schema Stability

To verify the schema compatibility tests:

```bash
# Run the schema compatibility test
pnpm test src/lib/game/schema-compat.test.ts
```

This ensures all "Golden Master" fixtures still parse correctly against the current schema.
