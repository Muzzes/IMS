const nodemailer = require('nodemailer');
const pool = require('../config/db');

const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
      },
    });
  }

  // Development: ethereal.email
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.ETHEREAL_USER,
      pass: process.env.ETHEREAL_PASS,
    },
  });
};

const transporter = createTransporter();

// Only verify if we have credentials set up, otherwise let it silently be pending
if ((process.env.NODE_ENV === 'production' && process.env.SMTP_USER) || 
    (process.env.NODE_ENV !== 'production' && process.env.ETHEREAL_USER)) {
  transporter.verify((error) => {
    if (error) {
      console.error('Email service error:', error);
    } else {
      console.log('Email service ready');
    }
  });
}

const sendEmail = async (options, retries = 3) => {
  const mailOptions = {
    from: `"${process.env.APP_NAME || 'StockFlow IMS'}" <${process.env.SMTP_FROM || 'noreply@stockflow.com'}>`,
    ...options,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);

      if (process.env.NODE_ENV !== 'production') {
        console.log('Preview:', nodemailer.getTestMessageUrl(info));
      }

      await pool.query(
        `INSERT INTO email_logs (user_id, recipient, type, subject, status, message_id) VALUES (?, ?, ?, ?, 'sent', ?)`,
        [options.user_id || null, mailOptions.to, options.type || 'system', mailOptions.subject, info.messageId]
      );

      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`Email attempt ${attempt} failed:`, err);
      if (attempt === retries) {
        await pool.query(
          `INSERT INTO email_logs (user_id, recipient, type, subject, status, error_message) VALUES (?, ?, ?, ?, 'failed', ?)`,
          [options.user_id || null, mailOptions.to, options.type || 'system', mailOptions.subject, err.message]
        );
        return { success: false, error: err.message };
      }
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
};

module.exports = { sendEmail };
