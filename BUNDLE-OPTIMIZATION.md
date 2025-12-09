# Bundle Optimization for Insight Monorepo

## Recommendations

- Use `vite-plugin-inspect` and `vite-plugin-visualizer` to analyze bundle size and imports.
- Prefer named imports from shared UI package to enable tree-shaking.
- Avoid importing entire libraries (e.g., `import * as _ from 'lodash'`).
- Use dynamic imports for large, infrequently used modules.
- Remove unused dependencies from `package.json`.
- Enable `build.ssr` and `build.minify` in Vite config for production.

## Example: Vite Visualizer

Install:

```sh
npm install --save-dev vite-plugin-visualizer
```

Add to `vite.config.ts`:

```ts
import { visualizer } from "vite-plugin-visualizer";
export default {
  plugins: [visualizer()],
};
```

Run:

```sh
npm run build && npm run visualize
```

## Next Steps

- Review visualizer output for large modules
- Refactor imports and dependencies as needed
