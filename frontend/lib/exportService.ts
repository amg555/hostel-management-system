// frontend/lib/exportService.ts
import { saveAs } from 'file-saver';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ExportOptions {
  reportType: 'financial' | 'occupancy' | 'student' | 'complaint';
  startDate?: string;
  endDate?: string;
  format: 'pdf' | 'csv' | 'excel';
  filters?: Record<string, any>;
}

class ExportService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  async exportReport(options: ExportOptions): Promise<void> {
    const token = this.getAuthToken();
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      const loadingToast = toast.loading(`Generating ${options.format.toUpperCase()} report...`);
      
      const params = new URLSearchParams({
        format: options.format,
        ...(options.startDate && { startDate: options.startDate }),
        ...(options.endDate && { endDate: options.endDate }),
        ...options.filters
      });

      const response = await axios.get(
        `${API_URL}/reports/${options.reportType}?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      const filename = this.generateFilename(options);
      const blob = new Blob([response.data], { 
        type: this.getMimeType(options.format) 
      });
      
      saveAs(blob, filename);
      
      toast.dismiss(loadingToast);
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report. Please try again.');
    }
  }

  private generateFilename(options: ExportOptions): string {
    const date = new Date().toISOString().split('T')[0];
    return `${options.reportType}-report-${date}.${options.format}`;
  }

  private getMimeType(format: string): string {
    switch (format) {
      case 'pdf':
        return 'application/pdf';
      case 'csv':
        return 'text/csv';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
  }

  async exportToPDF(reportType: string, data: any): Promise<void> {
    await this.exportReport({
      reportType: reportType as any,
      format: 'pdf',
      startDate: data.startDate,
      endDate: data.endDate,
      filters: data.filters
    });
  }

  async exportToCSV(reportType: string, data: any[]): Promise<void> {
    try {
      const csv = this.convertToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
      saveAs(blob, filename);
      toast.success('CSV exported successfully!');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export CSV');
    }
  }

  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  async printReport(elementId: string): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        toast.error('Report element not found');
        return;
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to print');
        return;
      }

      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            return '';
          }
        })
        .join('\n');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Report - ${new Date().toLocaleDateString()}</title>
            <style>
              ${styles}
              @media print {
                body { margin: 0; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            ${element.innerHTML}
          </body>
        </html>
      `);

      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
      
      toast.success('Print dialog opened');
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print report');
    }
  }
}

export default new ExportService();