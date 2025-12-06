# In-App Changelog Plan

## Goal

Provide users (especially "Architects" like Jonas) with a visible history of updates, new features, and bug fixes directly within the application.

## Implementation Strategy

### 1. Data Source (`src/lib/data/changelog.ts`)

We will create a structured data file to serve as the source of truth for the in-app changelog. This decouples the user-facing copy from the internal `docs/agent-context/changelog.md`.

```typescript
export interface ChangelogEntry {
	version: string; // e.g., "Phase 40" or "v0.9.0"
	date: string;
	title: string;
	summary: string;
	features: string[]; // Bullet points
	fixes?: string[]; // Optional bullet points
	type: 'major' | 'minor' | 'patch';
}

export const CHANGELOG: ChangelogEntry[] = [
	{
		version: 'Phase 40',
		date: '2025-12-06',
		title: 'Lives & Survival Mechanics',
		summary: 'Introduced a health system, hazards, and game over states.',
		features: [
			'Lives System: Players now have 3 hearts.',
			'Hazards: Spikes and Fire tiles deal damage.',
			'Tile Editor: Configure hazard damage and effects.',
			"Audio: New 'Hurt' sound effect."
		],
		fixes: ['Fixed type errors in Tile Editor.', 'Improved sound test coverage.'],
		type: 'major'
	}
	// ... previous phases
];
```

### 2. UI Route (`src/routes/changelog/+page.svelte`)

A dedicated page to display the timeline.

- **Layout**: Vertical timeline or card list.
- **Styling**: Use existing "Modern Matte" design system (Surface cards, Brand accents).
- **Components**: Reuse `Box`, `Stack`, or standard HTML/CSS.

### 3. Entry Point

Add a link to the Changelog from:

- **Settings Page**: A new "About" section.
- **Home Screen**: A small "v0.9" badge or link in the footer.

## Tasks

- [ ] Create `src/lib/data/changelog.ts`.
- [ ] Populate with recent phases (40, 38, 36, 35).
- [ ] Create `src/routes/changelog/+page.svelte`.
- [ ] Add link to `src/routes/settings/+page.svelte`.
