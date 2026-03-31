import api from '../utils/api';

export interface ReportRequestDto {
  reportName: string;
  format?: 'EXCEL' | 'CSV';
  parameters?: Record<string, any>;
  startDate?: string;
  endDate?: string;
}

export const reportsService = {
  /**
   * Generates a report and returns a Blob.
   */
  generateReport: async (request: ReportRequestDto): Promise<Blob> => {
    // Determine the accept header based on format
    let acceptHeader = 'application/pdf';
    if (request.format === 'EXCEL') {
      acceptHeader = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (request.format === 'CSV') {
      acceptHeader = 'text/csv';
    }

    const response = await api.post<Blob>('/ims-reports-service/api/v1/reports/generate', request, {
      responseType: 'blob', // crucial for handling binary file downloads
      headers: {
        Accept: acceptHeader,
      },
    });
    
    return response.data;
  },

  /**
   * Helper function to trigger the browser download of the generated Blob.
   */
  downloadBlob: (blob: Blob, reportName: string, format: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const extension = format === 'EXCEL' ? 'xlsx' : format.toLowerCase();
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `${reportName}_${dateStr}.${extension}`);
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Fetches a report template configuration.
   */
  getTemplate: async (type: string): Promise<any> => {
    const response = await api.get(`/ims-reports-service/api/templates/${type}`);
    return response.data;
  },

  /**
   * Saves or updates a report template configuration.
   */
  saveTemplate: async (type: string, config: string): Promise<any> => {
    const response = await api.post(`/ims-reports-service/api/templates/${type}`, config, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
    return response.data;
  }
};
