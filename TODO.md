# BizCom SDK - TODO

## 🎯 Phase 1: MVP (Current)

### Core Infrastructure
- [x] **SDK-001**: Project setup (Vite + TypeScript)
- [x] **SDK-002**: Base `BizcomEmbed` class
- [x] **SDK-003**: Configuration system (`config.ts`)
- [x] **SDK-004**: Demo page (`index.html`)
- [ ] **SDK-005**: Build configuration for production bundle
- [ ] **SDK-006**: Source maps generation

### OrderWidget Component
- [x] **SDK-010**: Basic OrderWidget structure
- [x] **SDK-011**: Menu grid rendering
- [x] **SDK-012**: Shopping cart logic
- [x] **SDK-013**: Total calculation
- [ ] **SDK-014**: Loading states (skeleton UI)
- [ ] **SDK-015**: Error handling UI
- [ ] **SDK-016**: Empty cart state
- [ ] **SDK-017**: Item quantity controls (+/-)
- [ ] **SDK-018**: Remove from cart button

### API Integration
- [ ] **SDK-020**: Storage API client (`utils/api.ts`)
- [ ] **SDK-021**: Error handling for API calls
- [ ] **SDK-022**: Retry logic for failed requests
- [ ] **SDK-023**: Workflows API client
- [ ] **SDK-024**: Process start endpoint integration
- [ ] **SDK-025**: Instance ID tracking

### Styling & Theming
- [ ] **SDK-030**: CSS variables system
- [ ] **SDK-031**: Light theme
- [ ] **SDK-032**: Dark theme
- [ ] **SDK-033**: Mobile responsive design
- [ ] **SDK-034**: Accessibility (ARIA labels, keyboard nav)
- [ ] **SDK-035**: Custom CSS injection support

### Testing
- [ ] **SDK-040**: Vitest setup
- [ ] **SDK-041**: Unit tests for `BizcomEmbed`
- [ ] **SDK-042**: Unit tests for `OrderWidget`
- [ ] **SDK-043**: Unit tests for cart logic
- [ ] **SDK-044**: Playwright setup
- [ ] **SDK-045**: E2E test: Full order flow
- [ ] **SDK-046**: E2E test: Error scenarios
- [ ] **SDK-047**: Bundle size test (< 50KB)

---

## 🚀 Phase 2: Payment Integration

### Stripe Integration
- [ ] **SDK-050**: Payment Node interface
- [ ] **SDK-051**: Stripe Checkout integration
- [ ] **SDK-052**: Redirect to Stripe after checkout
- [ ] **SDK-053**: Success/cancel URL handling
- [ ] **SDK-054**: Webhook handler in Workflows API
- [ ] **SDK-055**: Payment event → Process continuation

### Commission Tracking
- [ ] **SDK-060**: D1 schema for transactions
- [ ] **SDK-061**: Log transaction on payment success
- [ ] **SDK-062**: Calculate commission (2.5% free, 1.5% paid)
- [ ] **SDK-063**: Tier detection from process config
- [ ] **SDK-064**: Admin dashboard for commission tracking

### Branding Logic
- [ ] **SDK-070**: "Powered by WR.IO" component
- [ ] **SDK-071**: Conditional rendering based on tier
- [ ] **SDK-072**: CSS class for hiding branding
- [ ] **SDK-073**: Link to WR.IO homepage

---

## 📦 Phase 3: Production Deployment

### Build & Deploy
- [ ] **SDK-080**: Production build optimization
- [ ] **SDK-081**: Minification + tree-shaking
- [ ] **SDK-082**: Cloudflare Pages deployment
- [ ] **SDK-083**: CDN setup (`bizcom.wr.io/sdk/v1/`)
- [ ] **SDK-084**: Versioning strategy (`/v1/`, `/v2/`)
- [ ] **SDK-085**: Rollback mechanism

### Documentation
- [ ] **SDK-090**: API reference docs
- [ ] **SDK-091**: Integration guide
- [ ] **SDK-092**: Code examples (React, Vue, Svelte)
- [ ] **SDK-093**: Troubleshooting guide
- [ ] **SDK-094**: Video tutorial (1 min)

### Monitoring
- [ ] **SDK-100**: Analytics tracking (widget loads)
- [ ] **SDK-101**: Error reporting (Sentry)
- [ ] **SDK-102**: Performance monitoring (Core Web Vitals)
- [ ] **SDK-103**: Usage dashboard

---

## 🎨 Phase 4: Additional Components

### BookingWidget
- [ ] **SDK-110**: `<bizcom-booking>` component
- [ ] **SDK-111**: Calendar UI
- [ ] **SDK-112**: Time slot selection
- [ ] **SDK-113**: Booking confirmation

### RequestWidget
- [ ] **SDK-120**: `<bizcom-request>` component
- [ ] **SDK-121**: Multi-step form
- [ ] **SDK-122**: File upload support
- [ ] **SDK-123**: Status tracking UI

---

## 🔧 Tech Debt & Improvements

### Performance
- [ ] **SDK-130**: Lazy load components
- [ ] **SDK-131**: Code splitting
- [ ] **SDK-132**: Image optimization
- [ ] **SDK-133**: Prefetch process config

### Developer Experience
- [ ] **SDK-140**: TypeScript types export
- [ ] **SDK-141**: JSDoc comments
- [ ] **SDK-142**: ESLint configuration
- [ ] **SDK-143**: Prettier setup
- [ ] **SDK-144**: Pre-commit hooks

### Security
- [ ] **SDK-150**: CSP headers
- [ ] **SDK-151**: XSS protection
- [ ] **SDK-152**: CORS configuration
- [ ] **SDK-153**: Rate limiting

---

## 📋 Backlog

### Nice-to-Have
- [ ] **SDK-200**: Multi-language support (i18n)
- [ ] **SDK-201**: Custom event system
- [ ] **SDK-202**: Plugin architecture
- [ ] **SDK-203**: A/B testing support
- [ ] **SDK-204**: Offline mode (Service Worker)

### Research
- [ ] **SDK-300**: SSR compatibility
- [ ] **SDK-301**: React Native wrapper
- [ ] **SDK-302**: WordPress plugin
- [ ] **SDK-303**: Shopify app

---

## 🐛 Known Issues

- None yet (project just started!)

---

## 📊 Metrics

### Current Status
- **Lines of Code**: ~500
- **Bundle Size**: Not measured yet
- **Test Coverage**: 0%
- **Components**: 1 (OrderWidget)

### Goals
- **Bundle Size**: < 50KB gzipped
- **Test Coverage**: > 80%
- **Components**: 3 (Order, Booking, Request)
- **Load Time**: < 500ms
