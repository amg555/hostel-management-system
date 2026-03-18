// backend/src/services/pdfService.js
const puppeteer = require('puppeteer');
const moment = require('moment');
const logger = require('../utils/logger');

class PDFService {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async generateFinancialReportPDF(reportData) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      const html = this.generateFinancialHTML(reportData);
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      await page.close();
      return pdf;
    } catch (error) {
      logger.error('PDF generation error:', error);
      throw error;
    }
  }

  async generateOccupancyReportPDF(reportData) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      const html = this.generateOccupancyHTML(reportData);
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      await page.close();
      return pdf;
    } catch (error) {
      logger.error('PDF generation error:', error);
      throw error;
    }
  }

  async generateStudentReportPDF(reportData) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      const html = this.generateStudentHTML(reportData);
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      await page.close();
      return pdf;
    } catch (error) {
      logger.error('PDF generation error:', error);
      throw error;
    }
  }

  async generateComplaintReportPDF(reportData) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      const html = this.generateComplaintHTML(reportData);
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      await page.close();
      return pdf;
    } catch (error) {
      logger.error('PDF generation error:', error);
      throw error;
    }
  }

  generateFinancialHTML(data) {
    const { summary, paymentBreakdown, expenseBreakdown, period } = data;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #4F46E5;
          }
          .header h1 {
            color: #4F46E5;
            margin-bottom: 10px;
          }
          .period {
            color: #666;
            font-size: 14px;
          }
          .summary {
            display: flex;
            justify-content: space-around;
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
          }
          .summary-item {
            text-align: center;
          }
          .summary-item h3 {
            color: #666;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .summary-item p {
            font-size: 24px;
            font-weight: bold;
            color: #333;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e0e0e0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
          }
          th {
            background: #f8f9fa;
            font-weight: 600;
            color: #666;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .profit { color: #10B981; }
          .loss { color: #EF4444; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Financial Report</h1>
          <p class="period">Period: ${period.from} to ${period.to}</p>
          <p class="period">Generated on: ${moment().format('MMMM DD, YYYY')}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <h3>Total Revenue</h3>
            <p>₹${summary.revenue.toLocaleString()}</p>
          </div>
          <div class="summary-item">
            <h3>Total Expenses</h3>
            <p>₹${summary.expenses.toLocaleString()}</p>
          </div>
          <div class="summary-item">
            <h3>Net Profit</h3>
            <p class="${summary.profit >= 0 ? 'profit' : 'loss'}">
              ₹${summary.profit.toLocaleString()}
            </p>
          </div>
          <div class="summary-item">
            <h3>Profit Margin</h3>
            <p>${summary.profitMargin}%</p>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Revenue Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Count</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${paymentBreakdown.map(item => `
                <tr>
                  <td>${item.paymentType}</td>
                  <td>${item.dataValues.count}</td>
                  <td>₹${Number(item.dataValues.total).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">Expense Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${expenseBreakdown.map(item => `
                <tr>
                  <td>${item.category}</td>
                  <td>${item.dataValues.count}</td>
                  <td>₹${Number(item.dataValues.total).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>This is a computer-generated report. For any queries, please contact the administration.</p>
          <p>© ${new Date().getFullYear()} Hostel Management System</p>
        </div>
      </body>
      </html>
    `;
  }

  generateOccupancyHTML(data) {
    const { summary, floorWise, typeWise } = data;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          ${this.getCommonStyles()}
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Occupancy Report</h1>
          <p class="period">Generated on: ${moment().format('MMMM DD, YYYY')}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <h3>Total Rooms</h3>
            <p>${summary.totalRooms}</p>
          </div>
          <div class="summary-item">
            <h3>Total Capacity</h3>
            <p>${summary.totalCapacity}</p>
          </div>
          <div class="summary-item">
            <h3>Total Occupied</h3>
            <p>${summary.totalOccupied}</p>
          </div>
          <div class="summary-item">
            <h3>Available Beds</h3>
            <p>${summary.availableBeds}</p>
          </div>
          <div class="summary-item">
            <h3>Occupancy Rate</h3>
            <p>${summary.occupancyRate}</p>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Floor-wise Occupancy</h2>
          <table>
            <thead>
              <tr>
                <th>Floor</th>
                <th>Rooms</th>
                <th>Capacity</th>
                <th>Occupied</th>
                <th>Occupancy Rate</th>
              </tr>
            </thead>
            <tbody>
              ${floorWise.map(floor => `
                <tr>
                  <td>Floor ${floor.floor}</td>
                  <td>${floor.rooms}</td>
                  <td>${floor.capacity}</td>
                  <td>${floor.occupied}</td>
                  <td>${floor.occupancyRate}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">Room Type Occupancy</h2>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Rooms</th>
                <th>Capacity</th>
                <th>Occupied</th>
                <th>Occupancy Rate</th>
              </tr>
            </thead>
            <tbody>
              ${typeWise.map(type => `
                <tr>
                  <td>${type.type}</td>
                  <td>${type.rooms}</td>
                  <td>${type.capacity}</td>
                  <td>${type.occupied}</td>
                  <td>${type.occupancyRate}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>This is a computer-generated report. For any queries, please contact the administration.</p>
          <p>© ${new Date().getFullYear()} Hostel Management System</p>
        </div>
      </body>
      </html>
    `;
  }

  generateStudentHTML(data) {
    const { summary, courseDistribution, yearDistribution } = data;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          ${this.getCommonStyles()}
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Student Report</h1>
          <p class="period">Generated on: ${moment().format('MMMM DD, YYYY')}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <h3>Total Students</h3>
            <p>${summary.total}</p>
          </div>
          <div class="summary-item">
            <h3>Active</h3>
            <p class="profit">${summary.active}</p>
          </div>
          <div class="summary-item">
            <h3>Inactive</h3>
            <p>${summary.inactive}</p>
          </div>
          <div class="summary-item">
            <h3>Occupancy Rate</h3>
            <p>${summary.occupancyRate}%</p>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Course Distribution</h2>
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Number of Students</th>
              </tr>
            </thead>
            <tbody>
              ${courseDistribution.map(course => `
                <tr>
                  <td>${course.course}</td>
                  <td>${course.dataValues.count}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">Academic Year Distribution</h2>
          <table>
            <thead>
              <tr>
                <th>Academic Year</th>
                <th>Number of Students</th>
              </tr>
            </thead>
            <tbody>
              ${yearDistribution.map(year => `
                <tr>
                  <td>${year.academicYear}</td>
                  <td>${year.dataValues.count}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>This is a computer-generated report. For any queries, please contact the administration.</p>
          <p>© ${new Date().getFullYear()} Hostel Management System</p>
        </div>
      </body>
      </html>
    `;
  }

  generateComplaintHTML(data) {
    const { summary, statusDistribution, categoryDistribution, priorityDistribution, period } = data;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          ${this.getCommonStyles()}
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Complaint Report</h1>
          <p class="period">Period: ${period.from} to ${period.to}</p>
          <p class="period">Generated on: ${moment().format('MMMM DD, YYYY')}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <h3>Total Complaints</h3>
            <p>${summary.total}</p>
          </div>
          <div class="summary-item">
            <h3>Resolved</h3>
            <p class="profit">${summary.resolved}</p>
          </div>
          <div class="summary-item">
            <h3>Pending</h3>
            <p class="loss">${summary.pending}</p>
          </div>
          <div class="summary-item">
            <h3>Avg Resolution Time</h3>
            <p>${summary.avgResolutionTime}</p>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Status Distribution</h2>
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              ${statusDistribution.map(status => `
                <tr>
                  <td>${status.status}</td>
                  <td>${status.dataValues.count}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">Category Distribution</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              ${categoryDistribution.map(category => `
                <tr>
                  <td>${category.category}</td>
                  <td>${category.dataValues.count}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">Priority Distribution</h2>
          <table>
            <thead>
              <tr>
                <th>Priority</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              ${priorityDistribution.map(priority => `
                <tr>
                  <td>${priority.priority}</td>
                  <td>${priority.dataValues.count}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>This is a computer-generated report. For any queries, please contact the administration.</p>
          <p>© ${new Date().getFullYear()} Hostel Management System</p>
        </div>
      </body>
      </html>
    `;
  }

  getCommonStyles() {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
        color: #333;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #4F46E5;
      }
      .header h1 {
        color: #4F46E5;
        margin-bottom: 10px;
      }
      .period {
        color: #666;
        font-size: 14px;
      }
      .summary {
        display: flex;
        justify-content: space-around;
        margin-bottom: 30px;
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
      }
      .summary-item {
        text-align: center;
      }
      .summary-item h3 {
        color: #666;
        font-size: 14px;
        margin-bottom: 5px;
      }
      .summary-item p {
        font-size: 24px;
        font-weight: bold;
        color: #333;
      }
      .section {
        margin-bottom: 30px;
      }
      .section-title {
        font-size: 18px;
        color: #333;
        margin-bottom: 15px;
        padding-bottom: 5px;
        border-bottom: 1px solid #e0e0e0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }
      th {
        background: #f8f9fa;
        font-weight: 600;
        color: #666;
      }
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e0e0e0;
        text-align: center;
        color: #666;
        font-size: 12px;
      }
      .profit { color: #10B981; }
      .loss { color: #EF4444; }
    `;
  }
}

module.exports = new PDFService();