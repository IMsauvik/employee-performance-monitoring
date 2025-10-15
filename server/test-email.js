require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
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

    console.log('Testing connection...');
    await transporter.verify();
    console.log('Connection successful!');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: "sauvikparia1@gmail.com",
      subject: "Test Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #ffde59; padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="color: #333; margin: 0;">Test Email</h2>
          </div>
          <div style="background-color: #fff; padding: 20px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <p style="color: #666;">This is a test email to verify the email configuration.</p>
            <p style="color: #666;">If you received this email, your settings are working correctly!</p>
          </div>
        </div>
      `
    });

    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error:', error);
  }
}

testEmail();