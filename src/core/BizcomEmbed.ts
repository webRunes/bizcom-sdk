import type { BizcomConfig, ProcessConfig } from './config';
import { DEFAULT_CONFIG } from './config';

/**
 * Base class for all BizCom embed components
 */
export abstract class BizcomEmbed extends HTMLElement {
  protected config: BizcomConfig;
  protected processConfig: ProcessConfig;
  protected shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.config = DEFAULT_CONFIG;
    this.processConfig = this.parseAttributes();
  }

  /**
   * Parse component attributes into ProcessConfig
   */
  protected parseAttributes(): ProcessConfig {
    return {
      org: this.getAttribute('org') || '',
      projectId: this.getAttribute('project') || 'main',
      processId: this.getAttribute('process') || '',
      theme: (this.getAttribute('theme') as 'light' | 'dark') || 'light',
      locale: this.getAttribute('locale') || 'en'
    };
  }

  /**
   * Lifecycle: component connected to DOM
   */
  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  /**
   * Lifecycle: component disconnected from DOM
   */
  disconnectedCallback() {
    this.cleanup();
  }

  /**
   * Render component UI
   */
  protected abstract render(): void;

  /**
   * Attach event listeners
   */
  protected abstract attachEventListeners(): void;

  /**
   * Cleanup on disconnect
   */
  protected abstract cleanup(): void;

  /**
   * Load process configuration from Storage API
   */
  protected async loadProcessConfig(): Promise<any> {
    const url = `${this.config.storageUrl}/${this.processConfig.org}/projects/${this.processConfig.projectId}/processes/${this.processConfig.processId}/index.jsonld`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load process config: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Start process execution via Workflows API
   */
  protected async startProcess(input: any): Promise<{ instanceId: string }> {
    const url = `${this.config.apiUrl}/api/v1/workflows/start`;
    
    // Генерация уникальных ID
    const instanceId = crypto.randomUUID();
    
    const payload = {
      processId: this.processConfig.processId,
      instanceId,
      projectId: this.processConfig.projectId,
      ownerIdentifier: this.processConfig.org,
      variables: input,
      type: 'general'
    };
    
    console.log('[BizcomSDK] Starting workflow with payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to start process: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Load Stripe.js dynamically
   */
  protected async loadStripe(publishableKey: string): Promise<any> {
    // @ts-ignore - Stripe will be loaded globally
    if (window.Stripe) {
      // @ts-ignore
      return window.Stripe(publishableKey);
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        // @ts-ignore
        if (window.Stripe) {
          // @ts-ignore
          resolve(window.Stripe(publishableKey));
        } else {
          reject(new Error('Stripe.js failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Stripe.js'));
      document.head.appendChild(script);
    });
  }
}
