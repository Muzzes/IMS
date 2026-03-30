require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Handled on frontend for SPA
  crossOriginEmbedderPolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true },
  frameguard: { action: 'deny' },
  xContentTypeOptions: true
}));

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = [process.env.CLIENT_URL || 'http://localhost:5173'];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Workspace-ID', 'X-CSRF-Token', 'X-Client-Version'],
  maxAge: 86400,
};
app.use(cors(corsOptions));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const rateLimit = require('express-rate-limit');
const { blockSQLInjection } = require('./middleware/validate');

app.use(blockSQLInjection);
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per IP per window
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per `window`
  message: { message: 'Too many login attempts, please try again later.' },
  skipSuccessfulRequests: true,
});

app.use('/api', globalLimiter);

// Routes
app.use('/api/auth',          authLimiter, require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/workspaces',    require('./routes/workspaces'));
app.use('/api/products',      require('./routes/products'));
app.use('/api/suppliers',     require('./routes/suppliers'));
app.use('/api/purchases',     require('./routes/purchases'));
app.use('/api/sales',         require('./routes/sales'));
app.use('/api/bills',         require('./routes/bills'));
app.use('/api/notifications',      require('./routes/notifications'));
app.use('/api/reports',            require('./routes/reports'));
app.use('/api/notification-prefs', require('./routes/notificationPrefs'));
app.use('/api/email-logs',         require('./routes/emailLogs'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Unhandled error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method
    });
  } else {
    // Only log basic info in production
    console.error(`[${req.method}] ${req.url} - ${err.message}`);
  }
  
  const isDev = process.env.NODE_ENV === 'development';
  res.status(err.status || 500).json({ 
    message: isDev ? err.message : 'Internal server error.' 
  });
});

const cron = require('node-cron');
const { getLowStockProducts, getAdminsAndStaff, getOverdueBills, shouldSendEmail } = require('./utils/notificationUtils');
const { sendLowStockAlert, sendOverdueReminder } = require('./templates/emails');
const pool = require('./config/db');

// Run at 8:00 AM every day
cron.schedule('0 8 * * *', async () => {
  try {
    const lowStockProducts = await getLowStockProducts();
    if (lowStockProducts.length > 0) {
      const adminsAndStaff = await getAdminsAndStaff();
      for (const user of adminsAndStaff) {
        const canSend = await shouldSendEmail(user.id, 'low_stock');
        if (canSend) {
          const userProducts = lowStockProducts.filter(p => user.workspaces.includes(p.workspace_id) || user.role === 'admin');
          if (userProducts.length > 0) {
            await sendLowStockAlert(user.email, user.name, userProducts[0].workspace_name, userProducts);
          }
        }
      }
    }
  } catch (error) {
    console.error('Cron 8AM Error:', error);
  }
});

// Run at 9:00 AM every day
cron.schedule('0 9 * * *', async () => {
  try {
    const overdueBills = await getOverdueBills();
    for (const bill of overdueBills) {
      const canSend = await shouldSendEmail(bill.customer_id, 'bill_overdue');
      if (canSend) {
        const lastReminder = bill.last_reminder_sent_at;
        const daysSince = lastReminder ? (Date.now() - new Date(lastReminder)) / 86400000 : Infinity;
        if (daysSince >= 3) {
          await sendOverdueReminder(bill.customer_email, bill.customer_name, bill);
          await pool.query(`UPDATE bills SET last_reminder_sent_at = NOW() WHERE id = ?`, [bill.id]);
        }
      }
    }
  } catch (error) {
    console.error('Cron 9AM Error:', error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server running on port ${PORT}`);
  }
});

module.exports = app;
