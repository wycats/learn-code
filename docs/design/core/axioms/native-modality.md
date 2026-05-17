# Axiom 11: Native Modality & Layering

**We respect the browser's native layering model.**

## Principle

Never reinvent the wheel for z-index or focus management. The browser has solved this.

## Application

- **Modals**: Always use `<dialog>`.
- **Popovers**: Always use the `popover` attribute.
- **Control**: Use declarative triggers (`popovertarget`, `command` invokers) wherever possible.
- **Dismissal**: All modals must support "light dismissal" (Esc key, backdrop click) and have a visible close button.

## Anti-Pattern

- "Portal" hacks to move DOM elements around.
- Manual z-index management (`z-index: 9999`).
- Custom overlay divs that trap focus poorly.
