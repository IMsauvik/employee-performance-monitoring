const express = require('express');
const cors = require('cors');
const emailService = require('./services/emailService');
require('dotenv').config();

// Debug logging
const debug = (...args) => console.log('[DEBUG]', ...args);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check endpoint for Railway
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Employee Performance API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Email Routes
app.post('/api/notifications/task-update', async (req, res) => {
  try {
    debug('Received task-update request:', req.body);
    const { recipient, taskData } = req.body;
    
    debug('Sending email to:', recipient);
    debug('Task data:', taskData);
    
    const result = await emailService.sendTaskUpdate(recipient, taskData);
    debug('Email result:', result);
    
    if (result.success) {
      debug('Email sent successfully');
      res.json({ success: true, messageId: result.messageId });
    } else {
      debug('Email failed:', result.error);
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    debug('Error in task-update endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/notifications/performance-report', async (req, res) => {
  try {
    const { recipient, reportData } = req.body;
    const result = await emailService.sendPerformanceReport(recipient, reportData);
    
    if (result.success) {
      res.json({ success: true, messageId: result.messageId });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/notifications/deadline-reminder', async (req, res) => {
  try {
    const { recipient, taskData } = req.body;
    const result = await emailService.sendDeadlineReminder(recipient, taskData);

    if (result.success) {
      res.json({ success: true, messageId: result.messageId });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/notifications/comment', async (req, res) => {
  try {
    debug('Received comment notification request:', req.body);
    const { recipients, commentData } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ success: false, error: 'Recipients array is required' });
    }

    // Send email to all recipients
    const results = await Promise.all(
      recipients.map(recipient =>
        emailService.sendCommentNotification(recipient, commentData)
      )
    );

    const allSuccessful = results.every(r => r.success);

    if (allSuccessful) {
      res.json({ success: true, sent: recipients.length });
    } else {
      const errors = results.filter(r => !r.success).map(r => r.error);
      res.status(500).json({ success: false, error: 'Some emails failed', details: errors });
    }
  } catch (error) {
    debug('Error in comment notification endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test email configuration
app.post('/api/notifications/test-config', async (req, res) => {
  try {
    const { recipient } = req.body;
    const result = await emailService.sendEmail({
      to: recipient,
      subject: 'Test Email Configuration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #ffde59; padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="color: #333; margin: 0;">Email Configuration Test</h2>
          </div>
          <div style="background-color: #fff; padding: 20px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <p style="color: #666;">This is a test email to verify your email configuration.</p>
            <p style="color: #666;">If you received this email, your email settings are working correctly!</p>
          </div>
        </div>
      `
    });
    
    if (result.success) {
      res.json({ success: true, messageId: result.messageId });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: err.message });
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server is running on http://0.0.0.0:${port}`);
  console.log('📧 Email configuration:', {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    from: process.env.EMAIL_FROM
  });
  console.log('🌍 Environment:', process.env.NODE_ENV);
  console.log('🔐 CORS origins:', process.env.ALLOWED_ORIGINS);
});

server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.log('Address in use, retrying...');
    setTimeout(() => {
      server.close();
      server.listen(port, '127.0.0.1');
    }, 1000);
  }
});