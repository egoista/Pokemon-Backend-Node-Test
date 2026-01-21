# ADR-011: Feature Branch Strategy

**Status:** Accepted

## Context

The project is developed incrementally with a strong emphasis on architectural clarity, specifications, and isolated changes.
To support this workflow—especially in the context of AI-assisted development—a clear branching strategy is required to avoid large, unfocused changes and reduce integration risk.

## Decision

Adopt a **feature-branch-based workflow**, where each branch represents a single, well-defined change aligned with a specification, use case, or architectural concern.

### Branch Naming Convention

```
feature/<short-description>
spec/<short-description>
docs/<short-description>
chore/<short-description>
```

### Examples

```
spec/pokemon-domain
feature/create-pokemon-usecase
feature/rest-api-v1
feature/graphql-adapter
docs/architecture-adrs
```

## Workflow

1. Create a branch from `main`
2. Make focused commits following the commit message convention
3. Ensure changes align with an existing or new specification
4. Merge back into `main` once the change is complete and coherent

## Consequences

- Changes remain small, reviewable, and purposeful.
- Architectural and specification changes are clearly traceable.
- Reduces cognitive load during reviews and interviews.
- Slight overhead in managing branches, offset by improved clarity.
