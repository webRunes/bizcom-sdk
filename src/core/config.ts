export interface BizcomConfig {
  apiUrl: string;
  storageUrl: string;
  stripePublishableKey: string;
  analyticsEnabled: boolean;
}

export interface ProcessConfig {
  org: string;
  processId: string;
  theme?: 'light' | 'dark';
  locale?: string;
}

export const DEFAULT_CONFIG: BizcomConfig = {
  apiUrl: 'https://dev-workflows-api.wr.io',
  storageUrl: 'https://dev-storage-api.wr.io',
  stripePublishableKey: 'pk_test_XaPz77xL6qe2ms1TefPcO1jg',
  analyticsEnabled: true
};
