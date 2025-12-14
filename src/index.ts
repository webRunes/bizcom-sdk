// Main entry point for BizCom SDK
export { BizcomEmbed } from './core/BizcomEmbed';
export { OrderWidget } from './components/OrderWidget';
export type { BizcomConfig, ProcessConfig } from './core/config';

// Auto-register web components
import { OrderWidget } from './components/OrderWidget';

// Register custom elements
if (typeof window !== 'undefined' && !customElements.get('bizcom-order')) {
  customElements.define('bizcom-order', OrderWidget);
}
