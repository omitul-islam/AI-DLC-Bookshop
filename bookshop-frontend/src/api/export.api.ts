import apiClient from './client';

export const exportApi = {
  downloadCsv: (entity: string, filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters).toString();
    const url = `${apiClient.defaults.baseURL}/export/${entity}${params ? '?' + params : ''}`;
    window.open(url, '_blank');
  },
};
