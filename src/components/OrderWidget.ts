import { BizcomEmbed } from '../core/BizcomEmbed';

/**
 * <bizcom-order> - Order form component
 * 
 * @example
 * ```html
 * <bizcom-order 
 *   org="pizzeria-mario" 
 *   process="order"
 *   theme="light">
 * </bizcom-order>
 * ```
 */
export class OrderWidget extends BizcomEmbed {
  private menuItems: any[] = [];
  private cart: Map<string, number> = new Map();

  protected render(): void {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .bizcom-order {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .menu-item {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .menu-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .menu-item h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
        }
        .menu-item .price {
          font-weight: bold;
          color: #2563eb;
        }
        .cart {
          border-top: 2px solid #e0e0e0;
          padding-top: 16px;
        }
        .cart-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .total {
          font-size: 20px;
          font-weight: bold;
          margin: 16px 0;
        }
        button {
          background: #2563eb;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          width: 100%;
        }
        button:hover {
          background: #1d4ed8;
        }
        button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        .loading {
          text-align: center;
          padding: 40px;
        }
        .error {
          color: #dc2626;
          padding: 12px;
          background: #fee2e2;
          border-radius: 6px;
          margin-bottom: 16px;
        }
        .branding {
          text-align: center;
          margin-top: 16px;
          font-size: 12px;
          color: #6b7280;
        }
        .branding a {
          color: #2563eb;
          text-decoration: none;
        }
      </style>
      <div class="bizcom-order">
        <div class="loading">Loading menu...</div>
      </div>
    `;

    this.loadMenu();
  }

  protected attachEventListeners(): void {
    // Event listeners will be attached after menu loads
  }

  protected cleanup(): void {
    this.cart.clear();
  }

  private async loadMenu(): Promise<void> {
    try {
      const processConfig = await this.loadProcessConfig();
      this.menuItems = processConfig.menu || [];
      this.renderMenu();
    } catch (error) {
      this.renderError('Failed to load menu');
    }
  }

  private renderMenu(): void {
    const container = this.shadow.querySelector('.bizcom-order');
    if (!container) return;

    container.innerHTML = `
      <div class="menu-grid" id="menu"></div>
      <div class="cart">
        <h3>Your Order</h3>
        <div id="cart-items"></div>
        <div class="total" id="total">Total: $0.00</div>
        <button id="checkout" disabled>Checkout</button>
      </div>
      <div class="branding">
        <a href="https://wr.io" target="_blank">Powered by wr.io</a>
      </div>
    `;

    this.renderMenuItems();
    this.attachMenuListeners();
  }

  private renderMenuItems(): void {
    const menuGrid = this.shadow.getElementById('menu');
    if (!menuGrid) return;

    menuGrid.innerHTML = this.menuItems.map(item => `
      <div class="menu-item" data-id="${item.id}">
        <h3>${item.name}</h3>
        <p>${item.description || ''}</p>
        <div class="price">$${item.price.toFixed(2)}</div>
      </div>
    `).join('');
  }

  private attachMenuListeners(): void {
    const menuItems = this.shadow.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        if (id) this.addToCart(id);
      });
    });

    const checkoutBtn = this.shadow.getElementById('checkout');
    checkoutBtn?.addEventListener('click', () => this.handleCheckout());
  }

  private addToCart(itemId: string): void {
    const count = this.cart.get(itemId) || 0;
    this.cart.set(itemId, count + 1);
    this.updateCart();
  }

  private updateCart(): void {
    const cartItemsEl = this.shadow.getElementById('cart-items');
    const totalEl = this.shadow.getElementById('total');
    const checkoutBtn = this.shadow.getElementById('checkout') as HTMLButtonElement;

    if (!cartItemsEl || !totalEl || !checkoutBtn) return;

    let total = 0;
    const items: string[] = [];

    this.cart.forEach((count, itemId) => {
      const item = this.menuItems.find(m => m.id === itemId);
      if (item) {
        total += item.price * count;
        items.push(`
          <div class="cart-item">
            <span>${count}x ${item.name}</span>
            <span>$${(item.price * count).toFixed(2)}</span>
          </div>
        `);
      }
    });

    cartItemsEl.innerHTML = items.join('') || '<p>Cart is empty</p>';
    totalEl.textContent = `Total: $${total.toFixed(2)}`;
    checkoutBtn.disabled = this.cart.size === 0;
  }

  private async handleCheckout(): Promise<void> {
    const checkoutBtn = this.shadow.getElementById('checkout') as HTMLButtonElement;
    if (!checkoutBtn) return;

    try {
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = 'Processing...';

      const orderData = {
        items: Array.from(this.cart.entries()).map(([itemId, count]) => ({
          itemId,
          count,
          item: this.menuItems.find(m => m.id === itemId)
        })),
        total: this.calculateTotal()
      };

      // 1. Создаем Payment Intent
      const paymentResponse = await fetch(`${this.config.apiUrl}/api/v1/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderData.items,
          metadata: {
            org: this.processConfig.org,
            processId: this.processConfig.processId
          }
        })
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = await paymentResponse.json();

      // 2. Загружаем Stripe и показываем форму оплаты
      const stripe = await this.loadStripe(this.config.stripePublishableKey);
      await this.showPaymentForm(stripe, clientSecret, paymentIntentId, orderData);

    } catch (error) {
      console.error('Checkout error:', error);
      this.renderError(error instanceof Error ? error.message : 'Failed to process checkout');
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = 'Checkout';
    }
  }

  private async showPaymentForm(
    stripe: any, 
    clientSecret: string, 
    paymentIntentId: string,
    orderData: any
  ): Promise<void> {
    const container = this.shadow.querySelector('.bizcom-order');
    if (!container) return;

    // Создаем UI для оплаты
    container.innerHTML = `
      <div class="payment-form">
        <h3>Payment Details</h3>
        <div id="payment-element"></div>
        <div style="margin-top: 16px; display: flex; gap: 8px;">
          <button id="pay-button" style="flex: 1;">Pay $${orderData.total.toFixed(2)}</button>
          <button id="cancel-button" style="flex: 1; background: #6b7280;">Cancel</button>
        </div>
        <div id="payment-message" class="error" style="display: none; margin-top: 16px;"></div>
      </div>
    `;

    // Инициализируем Stripe Elements
    const elements = stripe.elements({ clientSecret });
    const paymentElement = elements.create('payment');
    paymentElement.mount(this.shadow.getElementById('payment-element'));

    // Обработка оплаты
    const payButton = this.shadow.getElementById('pay-button');
    payButton?.addEventListener('click', async () => {
      try {
        (payButton as HTMLButtonElement).disabled = true;
        (payButton as HTMLButtonElement).textContent = 'Processing...';

        const { error } = await stripe.confirmPayment({
          elements,
          redirect: 'if_required'
        });

        if (error) {
          throw new Error(error.message);
        }

        // Оплата успешна — запускаем воркфлоу
        const result = await this.startProcess({
          ...orderData,
          paymentIntentId
        });

        // Показываем успех
        this.showSuccess(result.instanceId);

      } catch (err) {
        const messageEl = this.shadow.getElementById('payment-message');
        if (messageEl) {
          messageEl.textContent = err instanceof Error ? err.message : 'Payment failed';
          messageEl.style.display = 'block';
        }
        (payButton as HTMLButtonElement).disabled = false;
        (payButton as HTMLButtonElement).textContent = `Pay $${orderData.total.toFixed(2)}`;
      }
    });

    // Кнопка отмены
    this.shadow.getElementById('cancel-button')?.addEventListener('click', () => {
      this.renderMenu();
    });
  }

  private showSuccess(instanceId: string): void {
    const container = this.shadow.querySelector('.bizcom-order');
    if (!container) return;

    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
        <h2>Order Placed Successfully!</h2>
        <p>Your order has been received and is being processed.</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">
          Instance ID: ${instanceId}
        </p>
        <button id="new-order" style="margin-top: 24px;">Place Another Order</button>
      </div>
    `;

    this.shadow.getElementById('new-order')?.addEventListener('click', () => {
      this.cart.clear();
      this.renderMenu();
    });
  }

  private calculateTotal(): number {
    let total = 0;
    this.cart.forEach((count, itemId) => {
      const item = this.menuItems.find(m => m.id === itemId);
      if (item) total += item.price * count;
    });
    return total;
  }

  private renderError(message: string): void {
    const container = this.shadow.querySelector('.bizcom-order');
    if (container) {
      container.innerHTML = `<div class="error">${message}</div>`;
    }
  }
}
