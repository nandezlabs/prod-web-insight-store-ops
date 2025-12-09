# Automated Accessibility & Performance Checks in CI

## Accessibility (axe, Storybook a11y)

- Add `@axe-core/react` to UI tests for automated a11y assertions
- Run Storybook a11y addon in CI for component-level checks

## Performance (Lighthouse)

- Use `lighthouse-ci` for automated audits on PRs and deployments

## Example GitHub Actions Workflow

```yaml
name: Accessibility & Performance
on: [push, pull_request]
jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run test:a11y --workspace packages/ui
      - run: npm run storybook --workspace packages/ui
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install -g @lhci/cli
      - run: npm run build --workspace packages/admin-app
      - run: npx lhci autorun --collect.url=http://localhost:3000
```

## Next Steps

- Add test:a11y script to UI package
- Integrate Lighthouse CI for main app URLs
- Review reports on each PR
