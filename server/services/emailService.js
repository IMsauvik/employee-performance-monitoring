const nodemailer = require('nodemailer');
const { getBase64Logo } = require('../utils/logoUtil');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Company branding configuration
    this.branding = {
      logoUrl: getBase64Logo(),
      companyName: process.env.COMPANY_NAME || 'Amwoodo',
      primaryColor: '#ffde59', // Brand primary color
      secondaryColor: '#333333', // Brand secondary color
      accentColor: '#4A90E2', // Brand accent color
    };

    // Initial connection test
    this.testConnection();
  }

  async sendTaskUpdate(recipient, taskData) {
    const content = `
      <div style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e1e1e1;">
        <div style="padding: 20px;">
          <h2 style="color: ${this.branding.secondaryColor}; margin-top: 0;">Task Update: ${taskData.title}</h2>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Status:</strong></td>
                <td style="padding: 8px 0; color: #333;">${this.getStatusBadge(taskData.status)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Due Date:</strong></td>
                <td style="padding: 8px 0; color: #333;">${this.formatDate(taskData.dueDate)}</td>
              </tr>
              ${taskData.description ? `
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Description:</strong></td>
                <td style="padding: 8px 0; color: #333;">${taskData.description}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="text-align: center; margin-top: 25px;">
            <a href="${taskData.taskUrl}" 
               style="display: inline-block; padding: 12px 25px; background-color: ${this.branding.primaryColor}; 
                      color: ${this.branding.secondaryColor}; text-decoration: none; border-radius: 6px; 
                      font-weight: bold; transition: background-color 0.3s;">
              View Task Details
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: recipient,
      subject: `Task Update: ${taskData.title}`,
      html: content
    });
  }

  getStatusBadge(status) {
    const statusStyles = {
      'Not Started': { bg: '#e0e0e0', color: '#666666' },
      'In Progress': { bg: '#fff3cd', color: '#856404' },
      'Completed': { bg: '#d4edda', color: '#155724' },
      'Delayed': { bg: '#f8d7da', color: '#721c24' }
    };

    const style = statusStyles[status] || statusStyles['Not Started'];
    return `<span style="background-color: ${style.bg}; color: ${style.color}; 
                         padding: 4px 8px; border-radius: 4px; font-size: 0.9em;">
              ${status}
            </span>`;
  }

  formatDate(dateString) {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  async sendPerformanceReport(recipient, reportData) {
    const content = `
      <div style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e1e1e1;">
        <div style="padding: 20px;">
          <h2 style="color: ${this.branding.secondaryColor}; margin-top: 0;">Performance Summary Report</h2>
          
          <!-- Period Overview -->
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <h3 style="color: ${this.branding.secondaryColor}; margin-top: 0;">Period: ${reportData.period}</h3>
            
            <!-- Key Metrics -->
            <div style="display: flex; justify-content: space-between; margin: 20px 0;">
              <div style="text-align: center; padding: 15px; background-color: #ffffff; border-radius: 6px; flex: 1; margin: 0 10px;">
                <div style="font-size: 24px; font-weight: bold; color: ${this.branding.accentColor};">
                  ${reportData.tasksCompleted}
                </div>
                <div style="color: #666; font-size: 14px;">Tasks Completed</div>
              </div>
              
              <div style="text-align: center; padding: 15px; background-color: #ffffff; border-radius: 6px; flex: 1; margin: 0 10px;">
                <div style="font-size: 24px; font-weight: bold; color: ${this.branding.accentColor};">
                  ${reportData.onTimeRate}%
                </div>
                <div style="color: #666; font-size: 14px;">On-time Completion</div>
              </div>
            </div>

            ${reportData.highlights ? `
            <!-- Highlights -->
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e1e1e1;">
              <h4 style="color: ${this.branding.secondaryColor}; margin-top: 0;">Key Highlights</h4>
              <p style="color: #666; line-height: 1.6;">${reportData.highlights}</p>
            </div>
            ` : ''}
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin-top: 25px;">
            <a href="${reportData.reportUrl}" 
               style="display: inline-block; padding: 12px 25px; background-color: ${this.branding.primaryColor}; 
                      color: ${this.branding.secondaryColor}; text-decoration: none; border-radius: 6px; 
                      font-weight: bold; transition: background-color 0.3s;">
              View Detailed Report
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: recipient,
      subject: `Performance Report: ${reportData.period}`,
      html: content
    });
  }

  async sendCommentNotification(recipient, commentData) {
    const content = `
      <div style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e1e1e1;">
        <div style="padding: 20px;">
          <h2 style="color: ${this.branding.secondaryColor}; margin-top: 0;">New Comment on Task</h2>

          <!-- Task Info -->
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <h3 style="color: ${this.branding.secondaryColor}; margin-top: 0;">${commentData.taskName}</h3>
            <p style="color: #666; font-size: 14px;">${commentData.taskDescription || ''}</p>
          </div>

          <!-- Comment -->
          <div style="background-color: #e8f4f8; border-left: 4px solid ${this.branding.accentColor}; padding: 15px; margin: 15px 0; border-radius: 4px;">
            <div style="margin-bottom: 10px;">
              <strong style="color: ${this.branding.secondaryColor};">${commentData.authorName}</strong>
              <span style="color: #666; font-size: 14px;"> commented:</span>
            </div>
            <p style="color: #333; line-height: 1.6; margin: 0;">${commentData.commentText}</p>
            ${commentData.isBlocker ? `
              <div style="margin-top: 10px; padding: 8px; background-color: #fee; border: 1px solid #fcc; border-radius: 4px;">
                <strong style="color: #c00;">⚠️ This is marked as a BLOCKER</strong>
              </div>
            ` : ''}
          </div>

          ${commentData.mentions && commentData.mentions.length > 0 ? `
          <div style="background-color: #fff3cd; padding: 12px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>👤 You were mentioned in this comment</strong>
            </p>
          </div>
          ` : ''}

          <!-- Action Button -->
          <div style="text-align: center; margin-top: 25px;">
            <a href="${commentData.taskUrl}"
               style="display: inline-block; padding: 12px 25px; background-color: ${this.branding.primaryColor};
                      color: ${this.branding.secondaryColor}; text-decoration: none; border-radius: 6px;
                      font-weight: bold; transition: background-color 0.3s;">
              View Task & Reply
            </a>
          </div>
        </div>
      </div>
    `;

    const subject = commentData.isBlocker
      ? `⚠️ Blocker Reported: ${commentData.taskName}`
      : commentData.mentions && commentData.mentions.length > 0
      ? `👤 You were mentioned in: ${commentData.taskName}`
      : `New Comment: ${commentData.taskName}`;

    return this.sendEmail({
      to: recipient,
      subject: subject,
      html: content
    });
  }

  async sendDeadlineReminder(recipient, taskData) {
    const content = `
      <div style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e1e1e1;">
        <div style="padding: 20px;">
          <!-- Urgent Notice Banner -->
          <div style="background-color: #fff3cd; border-left: 4px solid #ffeeba; padding: 15px; margin-bottom: 20px;">
            <h2 style="color: #856404; margin: 0;">
              ⚠️ Urgent: Task Deadline Approaching
            </h2>
          </div>

          <!-- Task Details -->
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px;">
            <h3 style="color: ${this.branding.secondaryColor}; margin-top: 0;">${taskData.title}</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; color: #666; width: 140px;"><strong>Due Date:</strong></td>
                <td style="padding: 12px 0; color: #dc3545; font-weight: bold;">
                  ${this.formatDate(taskData.dueDate)}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #666;"><strong>Time Remaining:</strong></td>
                <td style="padding: 12px 0;">
                  <span style="background-color: #dc3545; color: white; padding: 4px 8px; border-radius: 4px;">
                    ${taskData.timeRemaining}
                  </span>
                </td>
              </tr>
              ${taskData.description ? `
              <tr>
                <td style="padding: 12px 0; color: #666;"><strong>Description:</strong></td>
                <td style="padding: 12px 0; color: #333;">${taskData.description}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <!-- Action Required Notice -->
          <div style="margin: 20px 0; padding: 15px; background-color: #e8f4f8; border-radius: 6px;">
            <p style="margin: 0; color: #0c5460; font-weight: bold;">
              ⏰ Immediate Action Required
            </p>
            <p style="margin: 10px 0 0; color: #0c5460;">
              Please review and complete this task before the deadline.
            </p>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin-top: 25px;">
            <a href="${taskData.taskUrl}" 
               style="display: inline-block; padding: 12px 25px; background-color: ${this.branding.primaryColor}; 
                      color: ${this.branding.secondaryColor}; text-decoration: none; border-radius: 6px; 
                      font-weight: bold; transition: background-color 0.3s;">
              Review Task Now
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: recipient,
      subject: `⚠️ Deadline Reminder: ${taskData.title}`,
      html: content
    });
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Email service initialization error:', error.message);
    }
  }

  getBaseTemplate(content) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.branding.companyName} Notification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <!-- Header with Logo -->
          <div style="background-color: ${this.branding.primaryColor}; padding: 20px; text-align: center;">
            <img src="${this.branding.logoUrl}" alt="${this.branding.companyName}" style="max-height: 60px; margin-bottom: 10px;">
            <h1 style="margin: 0; color: ${this.branding.secondaryColor}; font-size: 24px;">${this.branding.companyName}</h1>
          </div>
          
          <!-- Content Area -->
          <div style="padding: 30px; color: #333333;">
            ${content}
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666666;">
            <p style="margin: 0;">This is an automated message from ${this.branding.companyName}</p>
            <p style="margin: 5px 0 0;">Please do not reply to this email</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendEmail({ to, subject, html }) {
    try {
      // Wrap the content in the base template
      const fullHtml = this.getBaseTemplate(html);
      
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject: `${this.branding.companyName} - ${subject}`,
        html: fullHtml
      });

      console.log('Email sent:', info.messageId);
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        command: error.command
      });
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();