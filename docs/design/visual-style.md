# Visual Style Guide: "Modern Matte"

## Core Philosophy

**"Digital Montessori"**
The visual language aims to feel like a high-end, digital educational tool. It avoids the "cluttered toy box" aesthetic in favor of a clean, focused, and calming environment. It is tactile and friendly but respects the child's intelligence.

**Implementation Note**: We use **Open Props** to ground these values in a consistent system.
**Browser Support**: We target **Baseline 2025**. We can freely use modern CSS features like `light-dark()`, `@layer`, Container Queries, `:has()`, and Subgrid without workarounds.

## Key Characteristics

### 1. Tactility & Depth

- **Soft Shadows**: Elements float on the page using soft, diffused shadows (e.g., `var(--shadow-3)`).
- **Physical Buttons**: Interactive elements (blocks, buttons) have a "thick" appearance with a solid bottom border/shadow to simulate 3D depth.
- **Squishy Interaction**: Clicking an element physically depresses it (`transform: translateY`), giving immediate, satisfying feedback.

### 2. Geometry & Layout

- **Rounded Everything**: Large border radii (`var(--radius-3)`) on cards, buttons, and blocks. No sharp edges.
- **Perfect Squares**: The grid cells and blocks are strictly square (`aspect-ratio: 1`), creating a sense of order and stability.
- **Card-Based**: The UI is divided into distinct "Cards" (Stage Card, Tray Card) that float on a neutral background.

### 3. Color Palette

- **Backgrounds**: Off-whites and cool grays (`var(--gray-0)`, `var(--gray-2)`) to reduce eye strain and provide a neutral canvas.
- **Interactive Elements**: Vibrant but matte pastels.
  - **Action (Green)**: `#43e97b` (Play, Character)
  - **Movement (Blue)**: `#4facfe`
  - **Logic (Purple)**: `#a18cd1`
  - **Loops (Orange)**: `#ff9a9e`
- **Text**: Dark gray (`var(--gray-8)`) instead of pure black for softer contrast.

### 4. Typography

- **Font**: `Nunito` (Rounded Sans-Serif) or `var(--font-sans)`.
- **Style**: Bold weights (600/800) for headings and labels.
- **Uppercase Labels**: Used sparingly for structural labels (e.g., "SEQUENCE") to differentiate from content.

## UI Components

### The Stage

- **Grid**: A container with a subtle background, housing the cells.
- **Cells**: Rounded squares. "Walls" are darker and recessed.
- **Character**: A "squircle" shape with simple facial features, distinct from the grid.

### The Tray

- **Sequence Track**: A clearly defined horizontal track for placing blocks.
- **Palette**: A scrollable area for selecting blocks.
- **Play Button**: The primary call-to-action, distinct in size and color.

### Contextual Configuration

- **Principles**:
  - **Contextual**: Only appears when relevant (e.g., when a block is selected).
  - **Proximate**: Appears near the selection or the tools acting on it.
  - **Distinct**: Visually distinct from the primary toolbar (Glassomorphism vs Solid).
  - **Generous**: Large touch targets, clear labels.
- **Style**:
  - **Glassomorphism**: `backdrop-filter: blur(12px)`, semi-transparent white background.
  - **Positioning**: Floats to the left of the primary toolbar.
  - **Grid Layout**: Options are arranged in a grid for easy scanning.

### Popovers & Dialogs

- **Native & Matte**: We use native HTML `<dialog>` and `popover` elements styled with our "Modern Matte" aesthetic.
- **Appearance**:
  - **Background**: Solid `var(--surface-1)` (no glassomorphism for heavy editing tasks to ensure readability).
  - **Borders**: Thin, subtle borders (`var(--surface-3)`).
  - **Shadows**: Deep, soft shadows (`var(--shadow-4)` or `var(--shadow-6)`) to clearly separate them from the layer below.
  - **Backdrop**: For modals, a dark, blurred backdrop (`backdrop-filter: blur(8px)`) focuses attention on the task.

