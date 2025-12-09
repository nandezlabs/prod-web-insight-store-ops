# CI/CD Pipeline for Insight Monorepo

## Automated Checks

- Lint: ESLint
- Type: TypeScript strict mode
- Test: Vitest
- Accessibility: Storybook a11y, Lighthouse
- Bundle size: size-limit

## Example GitHub Actions Workflow

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run lint --workspace packages/admin-app
      - run: npm run lint --workspace packages/store-app
      - run: npm run typecheck --workspace packages/admin-app
      - run: npm run typecheck --workspace packages/store-app
      - run: npm test --workspace packages/ui
      - run: npm test --workspace packages/admin-app
      - run: npm test --workspace packages/store-app
      - run: npm run storybook --workspace packages/ui
      - run: npm run size-limit --workspace packages/ui
```

## Next Steps

- Add accessibility and performance checks to pipeline
- Review results on each PR
