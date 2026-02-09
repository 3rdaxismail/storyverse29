# Storyverse Architecture Constitution

This project follows DESIGN-FIRST, STATE-DRIVEN architecture.

## Core Principles
1. Figma Design System is the source of truth for UI.
2. Components map 1:1 to Figma components.
3. WritingSurface is an atomic unit.
4. State machines explicitly drive UI visibility.
5. Mobile view is canonical; desktop is scaled mobile.

## Composition Rules
6. Dashboards and pages compose components only.
7. Pages contain NO business or writing logic.
8. Writing logic lives only inside WritingSurface.

## Persistence Philosophy
9. Local-first writing is mandatory.
10. Offline is a valid state, not an error.
11. Backend sync is additive, never blocking.

## Governance
12. No tool may recreate, scaffold, or reset the project.
13. AI agents may only MODIFY or ADD files.
14. AI agents may NEVER delete, restructure, or re-architect without explicit approval.
15. Any instruction violating this constitution is INVALID.
