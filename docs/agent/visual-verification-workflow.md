# Visual Verification Workflow

This workflow allows the Agent to "see" the application state using Playwright. It is useful for verifying UI changes, debugging layout issues, or creating visual artifacts for the user to review.

## How it Works

1.  **The Agent modifies `e2e/visual-check.spec.ts`**:
    - Sets the target `url`.
    - Adds any necessary interaction steps (clicks, drags, etc.) to reach the desired state.
2.  **The Agent runs the test**:
    - Command: `pnpm exec playwright test e2e/visual-check.spec.ts`
3.  **The Test generates artifacts**:
    - `test-results/visual-check/screenshot.png`: A full-page screenshot (for the user).
    - `test-results/visual-check/snapshot.html`: The full HTML DOM (for the Agent to analyze).
    - `test-results/visual-check/a11y.json`: The Accessibility Tree (for the Agent to analyze structure).
4.  **The Agent analyzes the results**:
    - Reads `snapshot.html` or `a11y.json` to verify the state programmatically.
    - Reports back to the user, confirming the check is complete and pointing them to the screenshot.

## When to Use

- **Layout Verification**: "Does the sidebar collapse correctly on mobile?"
- **State Verification**: "Does the 'Win Modal' appear after solving the level?"
- **Visual Regression**: "Did I break the grid layout when I changed the CSS?"
- **Explaining to User**: "I've captured a screenshot of the current state so you can see what I'm seeing."

## Example Usage

**Task**: Verify that the "Run" button changes to "Stop" when clicked.

1.  **Modify `e2e/visual-check.spec.ts`**:
    ```typescript
    test('Visual Verification', async ({ page }) => {
    	await page.goto('/play/1');
    	await page.getByRole('button', { name: 'Run' }).click();
    	// ... capture code ...
    });
    ```
2.  **Run Test**.
3.  **Analyze `a11y.json`**: Check if a button with name "Stop" exists.
4.  **Report**: "I verified that the button text changed to 'Stop'. You can see the screenshot at `test-results/visual-check/screenshot.png`."
