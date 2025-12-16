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
  stripePublishableKey: 'pk_test_51QbbqkIHOdCVkw9OvXPxfkCXMFJJzLEqKTewXljMjrHvnGe6w56kgAwDxE9J4XZhbZ0UvDfN3bUJDO7svVxs7z6g00EXxb9ICK',
  analyticsEnabled: true
};
