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
        <a href="https://wr.io" target="_blank">Powered by WR.IO</a>
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
    try {
      const orderData = {
        items: Array.from(this.cart.entries()).map(([itemId, count]) => ({
          itemId,
          count,
          item: this.menuItems.find(m => m.id === itemId)
        })),
        total: this.calculateTotal()
      };

      const result = await this.startProcess(orderData);
      console.log('Order started:', result.instanceId);
      
      // TODO: Redirect to payment or show confirmation
      alert(`Order placed! Instance ID: ${result.instanceId}`);
    } catch (error) {
      this.renderError('Failed to place order');
    }
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
