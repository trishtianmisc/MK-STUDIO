# MK Studio — Vibe Coding Workflow

Use this workflow for every meaningful AI coding task.

## 1. Understand

Before coding, inspect:
- relevant files
- existing patterns
- dependencies
- data flow
- affected routes/components

## 2. Plan

State:
- what will change
- why
- which files are affected
- what will remain untouched
- how it will be tested

## 3. Implement minimally

Make the smallest correct change.

Do not rewrite unrelated code.

## 4. Verify

Run the relevant:
- type checks
- tests
- build
- lint if configured

Manually test the affected flow.

## 5. Review

Check:
- security
- performance
- error handling
- mobile behavior
- accidental regressions

## 6. Commit

Create a focused Git commit.

Example:

```text
feat: connect catalogue to product service
```

Avoid giant commits containing unrelated work.

## 7. Continue

Only after the current phase is verified should the next phase begin.

## AI stop conditions

Stop and ask before:
- deleting data
- deleting existing files that may still be used
- changing database schema destructively
- changing authentication architecture
- adding major dependencies
- changing routing
- introducing a new framework
- exposing or handling secrets
- changing production infrastructure

## Golden rule

Do not optimize for "more code."

Optimize for:

```text
correctness
security
maintainability
performance
simplicity
```
