# Order Widget Specification

## Overview

The `<bizcom-order>` web component provides an embeddable order form with integrated Stripe payment processing and workflow automation.

## Component API

### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `org` | string | Yes | Organization identifier (e.g., "demo-pizza") |
| `project` | string | No | Project identifier (default: "main") |
| `process` | string | Yes | Process ID (e.g., "order") |
| `theme` | "light" \| "dark" | No | UI theme (default: "light") |
| `locale` | string | No | Locale code (default: "en") |

### Usage Example

```html
<script src="https://bizcom.wr.io/sdk/v1/bizcom.js"></script>
<bizcom-order 
  org="demo-pizza" 
  project="main"
  process="order"
  theme="light">
</bizcom-order>
```

## Architecture

### Shadow DOM + Light DOM Hybrid

The component uses **Shadow DOM** for encapsulation and **Light DOM** for Stripe Elements (which don't support Shadow DOM).

```
<bizcom-order>                    ← Custom Element
  #shadow-root                    ← Shadow DOM (UI)
    <slot name="stripe-payment">  ← Slot for Stripe
  <div slot="stripe-payment">     ← Light DOM (Stripe mounts here)
```

**Why?** Stripe Elements cannot mount in Shadow DOM due to iframe-based PCI compliance requirements.

## User Flow

### 1. Menu Loading

```
GET https://dev-storage-api.wr.io/{org}/projects/{project}/processes/{process}/index.jsonld

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
      "price": 12.99
    }
  ]
}
```

### 2. Cart Management

- User clicks menu items to add to cart
- Cart updates in real-time with totals
- Checkout button enabled when cart has items

### 3. Payment Flow

#### 3.1 Create Payment Intent

```
POST https://dev-workflows-api.wr.io/api/v1/payments/create-intent

Request:
{
  "items": [
    { "itemId": "margherita", "count": 2, "item": {...} }
  ],
  "metadata": {
    "org": "demo-pizza",
    "projectId": "main",
    "processId": "order"
  }
}

Response:
{
  "clientSecret": "pi_xxx_secret_yyy",
  "paymentIntentId": "pi_xxx",
  "amount": 2598
}
```

#### 3.2 Show Payment Form

- Stripe Elements initialized with `clientSecret`
- Payment Element mounted in **Light DOM** (via slot)
- User enters card details

#### 3.3 Confirm Payment

```javascript
const { error } = await stripe.confirmPayment({
  elements,
  redirect: 'if_required'
});
```

#### 3.4 Start Workflow

```
POST https://dev-workflows-api.wr.io/api/v1/workflows/start

Request:
{
  "processId": "order",
  "instanceId": "99b3cbff-b044-4811-95c4-b9914936eaa3",
  "projectId": "main",
  "ownerIdentifier": "demo-pizza",
  "variables": {
    "items": [...],
    "total": 25.98,
    "paymentIntentId": "pi_xxx"
  },
  "type": "general"
}

Response:
{
  "instanceId": "99b3cbff-b044-4811-95c4-b9914936eaa3"
}
```

### 4. Success State

- Show success message with instance ID
- Provide "Place Another Order" button
- Clear cart and Light DOM payment container

## Error Handling

| Error | Cause | User Message |
|-------|-------|--------------|
| Menu load failure | Storage API unavailable | "Failed to load menu" |
| Payment Intent creation failure | Workflows API error | "Failed to create payment intent" |
| Stripe mount failure | Missing Light DOM container | "Payment system error: UI element missing" |
| Payment confirmation failure | Card declined / network error | Stripe error message |
| Workflow start failure | Workflows API error | "Failed to start process: {error}" |

## Configuration

### Default Config (`src/core/config.ts`)

```typescript
export const DEFAULT_CONFIG: BizcomConfig = {
  apiUrl: 'https://dev-workflows-api.wr.io',
  storageUrl: 'https://dev-storage-api.wr.io',
  stripePublishableKey: 'pk_test_XaPz77xL6qe2ms1TefPcO1jg',
  analyticsEnabled: true
};
```

## Testing

### Unit Tests

- [x] **OW-001**: Menu loading from Storage API
- [x] **OW-002**: Cart add/update/clear operations
- [x] **OW-003**: Total calculation
- [x] **OW-004**: Payment Intent creation
- [x] **OW-005**: Stripe Elements initialization
- [x] **OW-006**: Light DOM container creation/cleanup
- [x] **OW-007**: Workflow start with correct payload
- [x] **OW-008**: Error handling (menu, payment, workflow)

### E2E Tests

- [x] **OW-E2E-001**: Complete order flow (menu → cart → payment → success)
- [x] **OW-E2E-002**: Cancel payment and return to menu
- [x] **OW-E2E-003**: Multiple orders in sequence

## Success Criteria

- ✅ Menu loads from Storage API
- ✅ Cart updates correctly
- ✅ Stripe Payment Element mounts in Light DOM (no Shadow DOM errors)
- ✅ Payment confirmation works
- ✅ Workflow starts with correct instance ID
- ✅ Success message displays
- ✅ Light DOM cleanup on success/cancel

## Known Limitations

1. **Stripe Elements in Shadow DOM**: Not supported. Workaround: Light DOM + `<slot>`.
2. **Single Payment Method**: Only Stripe supported (no PayPal, Apple Pay, etc.).
3. **No Inventory Check**: Menu items always available.
4. **No Authentication**: Public widget, no user login.

## Future Enhancements

- [ ] Multiple payment providers (PayPal, Google Pay)
- [ ] Real-time inventory updates
- [ ] User authentication integration
- [ ] Order tracking UI
- [ ] Webhook for payment status updates
- [ ] Customizable styling (CSS variables)
