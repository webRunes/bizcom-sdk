import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OrderWidget } from './OrderWidget';

// Mock fetch globally
global.fetch = vi.fn();

// Mock Stripe
const mockStripe = {
  elements: vi.fn(() => ({
    create: vi.fn(() => ({
      mount: vi.fn(),
      unmount: vi.fn()
    }))
  })),
  confirmPayment: vi.fn()
};

// Mock window.Stripe
(global as any).window = {
  Stripe: vi.fn(() => mockStripe)
};

// Register custom element for tests
if (!customElements.get('bizcom-order')) {
  customElements.define('bizcom-order', OrderWidget);
}

describe('OrderWidget', () => {
  let widget: OrderWidget;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Create widget instance
    widget = document.createElement('bizcom-order') as OrderWidget;
    widget.setAttribute('org', 'test-org');
    widget.setAttribute('process', 'test-process');
    
    // Mock successful menu fetch
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        '@context': 'https://schema.org',
        '@type': 'Process',
        name: 'Test Menu',
        menu: [
          { id: 'item1', name: 'Item 1', price: 10.99, description: 'Test item 1' },
          { id: 'item2', name: 'Item 2', price: 15.99, description: 'Test item 2' }
        ]
      })
    });
  });

  afterEach(() => {
    widget?.remove();
  });

  describe('OW-001: Menu Loading', () => {
    it('should load menu from Storage API', async () => {
      document.body.appendChild(widget);
      
      // Wait for menu to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://dev-storage-api.wr.io/test-org/processes/test-process/index.jsonld'
      );
    });

    it('should render menu items', async () => {
      document.body.appendChild(widget);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const shadow = widget.shadowRoot!;
      const menuItems = shadow.querySelectorAll('.menu-item');
      
      expect(menuItems.length).toBe(2);
      expect(menuItems[0].textContent).toContain('Item 1');
      expect(menuItems[0].textContent).toContain('$10.99');
    });

    it('should handle menu load failure', async () => {
      (global.fetch as any).mockReset();
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      document.body.appendChild(widget);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const shadow = widget.shadowRoot!;
      const errorEl = shadow.querySelector('.error');
      
      expect(errorEl).toBeTruthy();
      expect(errorEl?.textContent).toContain('Failed to load menu');
    });
  });

  describe('OW-002: Cart Operations', () => {
    beforeEach(async () => {
      document.body.appendChild(widget);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should add item to cart', () => {
      const shadow = widget.shadowRoot!;
      const menuItem = shadow.querySelector('.menu-item[data-id="item1"]') as HTMLElement;
      
      menuItem.click();
      
      const cartItems = shadow.getElementById('cart-items');
      expect(cartItems?.textContent).toContain('1x Item 1');
    });

    it('should increment count for duplicate items', () => {
      const shadow = widget.shadowRoot!;
      const menuItem = shadow.querySelector('.menu-item[data-id="item1"]') as HTMLElement;
      
      menuItem.click();
      menuItem.click();
      
      const cartItems = shadow.getElementById('cart-items');
      expect(cartItems?.textContent).toContain('2x Item 1');
    });

    it('should enable checkout button when cart has items', () => {
      const shadow = widget.shadowRoot!;
      const menuItem = shadow.querySelector('.menu-item[data-id="item1"]') as HTMLElement;
      const checkoutBtn = shadow.getElementById('checkout') as HTMLButtonElement;
      
      expect(checkoutBtn.disabled).toBe(true);
      
      menuItem.click();
      
      expect(checkoutBtn.disabled).toBe(false);
    });
  });

  describe('OW-003: Total Calculation', () => {
    beforeEach(async () => {
      document.body.appendChild(widget);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should calculate total correctly', () => {
      const shadow = widget.shadowRoot!;
      const item1 = shadow.querySelector('.menu-item[data-id="item1"]') as HTMLElement;
      const item2 = shadow.querySelector('.menu-item[data-id="item2"]') as HTMLElement;
      
      item1.click();
      item1.click();
      item2.click();
      
      const totalEl = shadow.getElementById('total');
      expect(totalEl?.textContent).toBe('Total: $37.97'); // 2*10.99 + 15.99
    });
  });

  describe('OW-004: Payment Intent Creation', () => {
    beforeEach(async () => {
      document.body.appendChild(widget);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Mock payment intent creation
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          clientSecret: 'pi_test_secret',
          paymentIntentId: 'pi_test_123',
          amount: 1099
        })
      });
    });

    it('should create payment intent on checkout', async () => {
      const shadow = widget.shadowRoot!;
      const menuItem = shadow.querySelector('.menu-item[data-id="item1"]') as HTMLElement;
      const checkoutBtn = shadow.getElementById('checkout') as HTMLElement;
      
      menuItem.click();
      checkoutBtn.click();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://dev-workflows-api.wr.io/api/v1/payments/create-intent',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });
  });

  describe('OW-006: Light DOM Container', () => {
    beforeEach(async () => {
      document.body.appendChild(widget);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Mock payment intent
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          clientSecret: 'pi_test_secret',
          paymentIntentId: 'pi_test_123',
          amount: 1099
        })
      });
    });

    it('should create Light DOM container for Stripe', async () => {
      const shadow = widget.shadowRoot!;
      const menuItem = shadow.querySelector('.menu-item[data-id="item1"]') as HTMLElement;
      const checkoutBtn = shadow.getElementById('checkout') as HTMLElement;
      
      menuItem.click();
      checkoutBtn.click();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const lightDomContainer = widget.querySelector('[slot="stripe-payment"]');
      expect(lightDomContainer).toBeTruthy();
      expect(lightDomContainer?.id).toBe('payment-element-light');
    });

    it('should cleanup Light DOM container on cancel', async () => {
      const shadow = widget.shadowRoot!;
      const menuItem = shadow.querySelector('.menu-item[data-id="item1"]') as HTMLElement;
      const checkoutBtn = shadow.getElementById('checkout') as HTMLElement;
      
      menuItem.click();
      checkoutBtn.click();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const cancelBtn = shadow.getElementById('cancel-button') as HTMLElement;
      cancelBtn.click();
      
      const lightDomContainer = widget.querySelector('[slot="stripe-payment"]');
      expect(lightDomContainer).toBeNull();
    });
  });

  describe('OW-008: Error Handling', () => {
    it('should handle payment intent creation failure', async () => {
      document.body.appendChild(widget);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Mock failed payment intent
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      });
      
      const shadow = widget.shadowRoot!;
      const menuItem = shadow.querySelector('.menu-item[data-id="item1"]') as HTMLElement;
      const checkoutBtn = shadow.getElementById('checkout') as HTMLElement;
      
      menuItem.click();
      checkoutBtn.click();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const errorEl = shadow.querySelector('.error');
      expect(errorEl?.textContent).toContain('Failed to create payment intent');
    });
  });
});
