export interface BizcomConfig {
  apiUrl: string;
  storageUrl: string;
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
  analyticsEnabled: true
};
