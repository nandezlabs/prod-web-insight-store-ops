# Storybook for Insight UI

This Storybook instance documents and previews all shared UI components in the Insight monorepo. It enables live editing, accessibility checks, and visual regression testing for Button, Input, Card, and future components.

## Getting Started

1. Install Storybook:

   ```sh
   npx storybook@latest init
   ```

   (Run in `/packages/ui`)

2. Start Storybook:

   ```sh
   npm run storybook
   ```

3. Add stories for each component in `/packages/ui/src`:
   - `Button.stories.tsx`
   - `Input.stories.tsx`
   - `Card.stories.tsx`

## Features

- Live component previews
- Accessibility checks (a11y addon)
- Visual regression testing
- Docs and usage examples

## Next Steps

- Add stories for all shared components
- Integrate Storybook in CI for automated checks
- Expand documentation for props, variants, and usage
