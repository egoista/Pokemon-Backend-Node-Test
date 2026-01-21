# ADR-010: Commit Message Convention

**Status:** Accepted

## Context

The project emphasizes clarity, maintainability, and architectural reasoning.
Commit history is treated as a first-class artifact, especially in a spec-first and AI-assisted workflow, where understanding *why* changes were made is as important as *what* changed.

Without a clear convention, commit messages tend to become inconsistent, vague, and less useful during reviews or interviews.

## Decision

Adopt a **structured commit message convention inspired by Conventional Commits**, focusing on clarity and intent rather than tooling automation.

### Commit Message Format

```
<type>(optional-scope): short description
```

### Allowed Types

- `spec`: changes related to specifications or ADRs
- `feat`: new functionality
- `fix`: bug fixes
- `refactor`: code restructuring without behavior changes
- `test`: adding or modifying tests
- `docs`: documentation changes
- `chore`: tooling, setup, or maintenance tasks

### Examples

```
spec: define pokemon domain rules
feat(application): implement create pokemon use case
feat(api-rest): expose pokemon endpoints v1
refactor(infra): extract prisma repository adapter
test(use-case): add validation scenarios for create pokemon
docs: document architecture decisions
```

## Consequences

- Commit history clearly communicates intent and scope.
- Easier code reviews and architectural discussions.
- Specs and decisions are visible in version control, not just code.
- Requires discipline to maintain consistency across contributors.
