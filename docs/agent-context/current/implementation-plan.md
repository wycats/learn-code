# Implementation Plan - Phase 13: Design & Reflection

**Goal:** Deepen our understanding of the users (Personas) and the system's core laws (Axioms) to ensure the product remains coherent as it grows. This is a "soft" phase focused on documentation, analysis, and design philosophy rather than writing code.

## 1. Persona Enrichment

**Objective:** Update our user personas to reflect the reality of the "Builder" features. We now have two distinct modes of engagement: "Player" (Zoey) and "Architect" (Jonas/Zoey).

- [x] **Review `docs/design/personas.md`**:
  - Update "Zoey" to reflect her experience with the new "Guide" and "Hint" systems.
  - Update "Jonas" (or create a new persona) to specifically address the "Architect" role (using the Level Builder and Campaign Builder).
  - Define the "Teacher/Parent" role more clearly if necessary, specifically regarding the "Librarian" features.

## 2. The Constitution (Axioms)

**Objective:** Codify the implicit design rules we've been following into explicit "Axioms". This will serve as our "Constitution" for future decision making.

- [x] **Draft `docs/design/axioms.md`**:
  - **Pedagogy**: Define the "Stop & Go" philosophy, the role of failure, and the "Low Floor, High Ceiling" principle.
  - **Interaction**: Codify "Touch First", "Direct Manipulation", and "No Hidden State".
  - **Visuals**: Define the "Modern Matte" aesthetic, the use of motion, and the "Diegetic UI" preference.
  - **Technical**: Document our stance on "Zero Backend", "Local First", and "Web Standards".

## 3. Fresh Eyes Review

**Objective:** Conduct a comprehensive design review of the current application state through the lens of our updated personas.

- [x] **Conduct Review**:
  - Walk through the entire "Player" flow (Campaign -> Level -> Win) as Zoey.
  - Walk through the entire "Architect" flow (Create Pack -> Build Level -> Test) as Jonas.
  - Document friction points, inconsistencies, and opportunities in `docs/design/friction-log.md`.
- [x] **Synthesize Findings**:
  - Create a prioritized list of design debt and polish tasks for future phases.

## 4. Documentation Cleanup

**Objective:** Ensure all design documentation is up-to-date and organized.

- [x] **Update `docs/design/index.md`**: Ensure all new documents are linked and categorized.
- [x] **Archive Obsolete Docs**: Move any outdated design docs to `docs/design/archive/`.
