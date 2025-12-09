# Deployment Automation Guide

## Recommended Tools

- Vercel (admin-app, store-app)
- Netlify (serverless functions)
- GitHub Actions (CI/CD)

## Vercel Setup

1. Connect repo to Vercel
2. Set up project for `admin-app` and `store-app`
3. Configure build command: `npm run build --workspace packages/admin-app`
4. Set output directory: `packages/admin-app/dist`
5. Add environment variables as needed

## Netlify Setup

1. Connect repo to Netlify
2. Set up project for serverless functions in `store-app/api/serverless`
3. Configure build command: `npm run build --workspace packages/store-app`
4. Set output directory: `packages/store-app/dist`
5. Add environment variables as needed

## GitHub Actions Deployment Example

```yaml
name: Deploy
on:
  push:
    branches:
      - main
jobs:
  deploy-vercel:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: packages/admin-app
          github-token: ${{ secrets.GITHUB_TOKEN }}
  deploy-netlify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: packages/store-app/dist
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          netlify-auth-token: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          netlify-site-id: ${{ secrets.NETLIFY_SITE_ID }}
```

## Next Steps

- Add deployment secrets to repo settings
- Monitor deployments and automate rollbacks on failure
