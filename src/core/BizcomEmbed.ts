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
    const url = `${this.config.storageUrl}/${this.processConfig.org}/processes/${this.processConfig.processId}/index.jsonld`;
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
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org: this.processConfig.org,
        processId: this.processConfig.processId,
        input
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to start process: ${response.statusText}`);
    }

    return response.json();
  }
}
