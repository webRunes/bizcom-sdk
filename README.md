# BizCom SDK

Embed SDK for BizCom business processes. Turn any website into a process-driven application with a single line of code.

## Quick Start

```html
<script src="https://bizcom.wr.io/sdk/v1/bizcom.js"></script>
<bizcom-order 
  org="your-org" 
  process="order"
  theme="light">
</bizcom-order>
```

## Features

- 🎨 **Web Components** - Native browser support, framework-agnostic
- 🔌 **Modular** - Payment nodes, notification nodes, analytics
- 🎯 **Type-safe** - Full TypeScript support
- 📦 **Tiny** - < 50KB gzipped
- 🚀 **Fast** - Lazy-loaded components

## Components

### `<bizcom-order>`
Order form with payment integration for restaurants, e-commerce.

### `<bizcom-booking>`
Appointment booking with calendar integration.

### `<bizcom-request>`
Service request form with status tracking.

## Development

```bash
# Install dependencies
pnpm install

# Dev server
pnpm dev

# Build
pnpm build

# Test
pnpm test
pnpm test:e2e
pnpm test:e2e
```

## Deployment

The demo page is automatically deployed to GitHub Pages via GitHub Actions when pushing to `master`.

- **Demo URL:** [https://webrunes.github.io/bizcom-sdk/](https://webrunes.github.io/bizcom-sdk/)
- **Workflow:** `.github/workflows/deploy.yml`
- **Build Output:** `dist-demo/` -> `docs/` (in `master` branch)

To deploy manually:
1. `pnpm build:demo`
2. Commit the `docs` folder
3. Push to `master`

## Architecture

```
src/
├── index.ts              # Main entry point
├── core/
│   ├── BizcomEmbed.ts    # Base class for all components
│   ├── config.ts         # SDK configuration
│   └── analytics.ts      # Usage tracking
├── components/
│   ├── OrderWidget.ts    # <bizcom-order>
│   ├── BookingWidget.ts  # <bizcom-booking>
│   └── RequestWidget.ts  # <bizcom-request>
└── utils/
    ├── api.ts            # API client
    └── theme.ts          # Theming system
```

## License

MIT
