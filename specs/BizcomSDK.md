# BizCom SDK Specification

## Overview
BizCom SDK is a lightweight JavaScript library that enables embedding business process components into any website. It provides web components for common business workflows (orders, bookings, requests) with built-in process execution and payment integration.

## Goals
1. **Zero-friction integration** - Single `<script>` tag, no build step required
2. **Framework-agnostic** - Works with vanilla HTML, React, Vue, Svelte, etc.
3. **Modular architecture** - Easy to add new payment providers and components
4. **Type-safe** - Full TypeScript support for developers
5. **Tiny bundle** - < 50KB gzipped for core + OrderWidget

## User Stories

### US-1: Restaurant Owner Embeds Order Form
**As a** restaurant owner  
**I want to** add an order form to my website with one line of code  
**So that** customers can place orders without me building a custom form

**Acceptance Criteria:**
- Copy-paste `<script>` + `<bizcom-order>` tags
- Menu loads from BizCom Storage API
- Orders trigger BPMN process execution
- "Powered by WR.IO" branding shown for free tier

### US-2: Developer Customizes Theme
**As a** developer  
**I want to** customize the widget appearance  
**So that** it matches my website design

**Acceptance Criteria:**
- `theme="light|dark"` attribute
- CSS variables for colors
- Custom CSS injection support

### US-3: Payment Integration
**As a** business owner  
**I want** payments to be processed automatically  
**So that** I get paid when orders are placed

**Acceptance Criteria:**
- Stripe Checkout integration
- Webhook triggers process continuation
- Commission tracking (2.5% for free, 1.5% for paid)

## Architecture

### Core Components

#### 1. BizcomEmbed (Base Class)
```typescript
abstract class BizcomEmbed extends HTMLElement {
  // Lifecycle
  connectedCallback()
  disconnectedCallback()
  
  // Configuration
  protected parseAttributes(): ProcessConfig
  protected loadProcessConfig(): Promise<any>
  
  // Process execution
  protected startProcess(input: any): Promise<{ instanceId: string }>
  
  // Abstract methods
  protected abstract render(): void
  protected abstract attachEventListeners(): void
  protected abstract cleanup(): void
}
```

**Responsibilities:**
- Parse component attributes
- Load process config from Storage API
- Start process via Workflows API
- Manage component lifecycle

#### 2. OrderWidget
```typescript
class OrderWidget extends BizcomEmbed {
  private menuItems: any[]
  private cart: Map<string, number>
  
  // Render menu grid
  private renderMenu(): void
  
  // Cart management
  private addToCart(itemId: string): void
  private updateCart(): void
  
  // Checkout
  private handleCheckout(): Promise<void>
}
```

**Features:**
- Grid layout for menu items
- Shopping cart with quantity
- Total calculation
- Checkout button
- Loading/error states

### Data Flow

```
1. Page loads → <bizcom-order> registered
2. connectedCallback() → loadProcessConfig()
3. Storage API → GET /{org}/processes/{processId}/index.jsonld
4. Render menu from config.menu[]
5. User adds items → updateCart()
6. User clicks Checkout → startProcess()
7. Workflows API → POST /api/v1/workflows/start
8. Process executes → Payment Node → Stripe Checkout
9. Webhook → Process continues → Notifications sent
```

### API Integration

#### Storage API
```
GET https://dev-storage-api.wr.io/{org}/processes/{processId}/index.jsonld

Response:
{
  "@context": "https://schema.org",
  "@type": "Process",
  "name": "Pizza Order",
  "menu": [
    {
      "id": "margherita",
      "name": "Margherita",
      "description": "Classic tomato and mozzarella",
      "price": 12.99,
      "image": "https://..."
    }
  ],
  "payment": {
    "provider": "stripe",
    "publicKey": "pk_live_xxx"
  }
}
```

#### Workflows API
```
POST https://dev-workflows-api.wr.io/api/v1/workflows/start

Request:
{
  "org": "demo-pizza",
  "processId": "order",
  "input": {
    "items": [
      { "itemId": "margherita", "count": 2, "price": 12.99 }
    ],
    "total": 25.98
  }
}

Response:
{
  "instanceId": "wf_abc123",
  "status": "running"
}
```

## Pricing Integration

### Free Tier
- **Branding**: `<div class="bizcom-branding">Powered by WR.IO</div>`
- **Commission**: 2.5% on transactions
- **Limit**: 100 process executions/month

### Paid Tier (Pro)
- **Branding**: Hidden via CSS class
- **Commission**: 1.5% on transactions
- **Limit**: Unlimited executions

### Implementation
```typescript
// In OrderWidget
private renderBranding(): string {
  const tier = this.processConfig.tier || 'free';
  if (tier === 'free') {
    return `
      <div class="bizcom-branding">
        <a href="https://wr.io" target="_blank">Powered by WR.IO</a>
      </div>
    `;
  }
  return '';
}
```

## Testing Strategy

### Unit Tests (Vitest)
- `BizcomEmbed.test.ts` - Base class lifecycle
- `OrderWidget.test.ts` - Menu rendering, cart logic
- `config.test.ts` - Configuration parsing

### E2E Tests (Playwright)
```typescript
test('SDK-E2E-001: Full order flow', async ({ page }) => {
  await page.goto('http://localhost:3001');
  
  // Wait for menu to load
  await page.waitForSelector('.menu-item');
  
  // Add item to cart
  await page.click('.menu-item[data-id="margherita"]');
  
  // Verify cart updated
  await expect(page.locator('.cart-item')).toContainText('1x Margherita');
  
  // Click checkout
  await page.click('#checkout');
  
  // Verify process started
  await expect(page.locator('.success')).toBeVisible();
});
```

### Manual Testing Checklist
- [ ] Menu loads from Storage API
- [ ] Items can be added to cart
- [ ] Total calculates correctly
- [ ] Checkout triggers process
- [ ] Branding shows for free tier
- [ ] Works in Chrome, Firefox, Safari
- [ ] Mobile responsive

## Success Criteria

### Phase 1 (MVP)
- [x] Base `BizcomEmbed` class implemented
- [x] `OrderWidget` component functional
- [x] Demo page works locally
- [ ] Storage API integration tested
- [ ] Workflows API integration tested
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Bundle size < 50KB

### Phase 2 (Payment)
- [ ] Stripe Payment Node implemented
- [ ] Webhook handler for payment events
- [ ] Commission tracking in D1
- [ ] Tier-based branding logic

### Phase 3 (Production)
- [x] Deployed to GitHub Pages (Demo)
- [ ] Deployed to Cloudflare Pages (CDN)
- [ ] CDN distribution (`https://bizcom.wr.io/sdk/v1/bizcom.js`)
- [ ] 1 pilot customer (pizzeria) in production
- [ ] Video demo recorded

## Non-Goals (Out of Scope)
- ❌ Server-side rendering (SSR)
- ❌ Native mobile apps
- ❌ Offline support
- ❌ Multi-language i18n (Phase 1)
- ❌ Custom form builder UI

## Open Questions
1. **Versioning strategy**: `/sdk/v1/` vs `/sdk/latest/`?
2. **Analytics**: Track widget loads, conversions?
3. **Error reporting**: Sentry integration?
4. **Rate limiting**: How to prevent abuse of free tier?
