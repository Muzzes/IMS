const { sendEmail } = require('../../services/emailService');

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StockFlow IMS</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f0ff; color: #1a1a2e; padding: 40px 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e0e0f0; }
    .header { background: #0d0d18; padding: 28px 32px; display: flex; align-items: center; gap: 12px; }
    .logo-box { width: 36px; height: 36px; background: #818cf8; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #ffffff; }
    .app-name { color: #e8e8ff; font-size: 18px; font-weight: 600; }
    .body { padding: 36px 32px; }
    .greeting { font-size: 22px; font-weight: 600; color: #0f0f1a; margin-bottom: 16px; }
    .text { font-size: 15px; color: #3d3d5c; line-height: 1.7; margin-bottom: 16px; }
    .btn { display: inline-block; background: #818cf8; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 20px 0; }
    .btn-danger { background: #ef4444; }
    .divider { border: none; border-top: 1px solid #e8e8f5; margin: 24px 0; }
    .info-box { background: #f0f0ff; border: 1px solid #d0d0f0; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0; border-bottom: 1px solid #e0e0f0; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #6868a8; }
    .info-value { color: #0f0f1a; font-weight: 500; }
    .alert-box { background: #fff8e1; border: 1px solid #f59e0b; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 14px 16px; margin: 16px 0; font-size: 14px; color: #854f0b; }
    .danger-box { background: #fff5f5; border: 1px solid #fca5a5; border-left: 4px solid #ef4444; border-radius: 8px; padding: 14px 16px; margin: 16px 0; font-size: 14px; color: #a32d2d; }
    .footer { background: #f8f8ff; padding: 24px 32px; border-top: 1px solid #e8e8f5; }
    .footer-text { font-size: 12px; color: #9090c8; line-height: 1.6; }
    .link { color: #818cf8; text-decoration: none; }
    .small-link { font-size: 12px; color: #9090c8; word-break: break-all; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-amber { background: #fef3c7; color: #92400e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-box">IMS</div>
      <div class="app-name">${process.env.APP_NAME || 'StockFlow IMS'}</div>
    </div>
    ${content}
    <div class="footer">
      <div class="footer-text">
        This email was sent by ${process.env.APP_NAME || 'StockFlow IMS'}.<br>
        If you did not expect this email, you can safely ignore it.<br><br>
        &copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'StockFlow IMS'}. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
`;

const sendVerificationEmail = async (name, email, token) => {
  const verifyUrl = \`\${process.env.APP_URL || 'http://localhost:5173'}/verify-email?token=\${token}\`;
  const content = \`
    <div class="body">
      <div class="greeting">Verify your email address</div>
      <p class="text">Hi \${name},</p>
      <p class="text">
        Thanks for registering with StockFlow IMS. Click the button below to verify your email address and activate your account.
      </p>
      <div style="text-align:center">
        <a href="\${verifyUrl}" class="btn">Verify my email address</a>
      </div>
      <div class="alert-box">
        This link expires in 24 hours. If it expires, you can request a new one from the login page.
      </div>
      <hr class="divider">
      <p class="text">If the button doesn't work, copy and paste this link into your browser:</p>
      <p class="small-link">\${verifyUrl}</p>
      <hr class="divider">
      <p class="text" style="font-size:13px;color:#9090c8">
        If you didn't create this account, you can safely ignore this email.
      </p>
    </div>
  \`;
  return sendEmail({ to: email, subject: 'Verify your StockFlow IMS account', html: baseTemplate(content) });
};

const sendWelcomeEmail = async (name, email, role) => {
  const loginUrl = \`\${process.env.APP_URL || 'http://localhost:5173'}/login\`;
  const roleDescriptions = {
    admin: 'full system access including user management, all reports, and system configuration.',
    staff: 'access to products, inventory, sales, purchases, and billing.',
    manufacturer: 'access to your products, stock levels, and purchase orders.',
  };
  const content = \`
    <div class="body">
      <div class="greeting">Welcome to StockFlow IMS!</div>
      <p class="text">Hi \${name},</p>
      <p class="text">
        Your email has been verified and your account is now active. You have been set up with
        <strong>\${role}</strong> access, giving you \${roleDescriptions[role] || 'access to your dashboard.'}
      </p>
      <div style="text-align:center">
        <a href="\${loginUrl}" class="btn">Go to StockFlow IMS</a>
      </div>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Email</span><span class="info-value">\${email}</span></div>
        <div class="info-row"><span class="info-label">Role</span><span class="info-value" style="text-transform:capitalize">\${role}</span></div>
      </div>
    </div>
  \`;
  return sendEmail({ to: email, subject: 'Welcome to StockFlow IMS — Account Active', html: baseTemplate(content) });
};

const sendPasswordResetEmail = async (name, email, token) => {
  const resetUrl = \`\${process.env.APP_URL || 'http://localhost:5173'}/reset-password?token=\${token}\`;
  const content = \`
    <div class="body">
      <div class="greeting">Reset your password</div>
      <p class="text">Hi \${name},</p>
      <p class="text">We received a request to reset your password. Click the button below to create a new one.</p>
      <div style="text-align:center">
        <a href="\${resetUrl}" class="btn btn-danger">Reset my password</a>
      </div>
      <div class="danger-box">
        This link expires in 1 hour for your security. If you did not request a password reset, please ignore this email.
      </div>
    </div>
  \`;
  return sendEmail({ to: email, subject: 'Reset your StockFlow IMS password', html: baseTemplate(content) });
};

const sendLowStockAlert = async (recipientEmail, recipientName, workspaceName, products) => {
  const criticalCount = products.filter(p => p.stock_quantity === 0).length;
  const lowCount = products.filter(p => p.stock_quantity > 0).length;
  const productRows = products.map(p => \`
    <div class="info-row">
      <span class="info-label">\${p.name} <span style="font-size:11px;color:#9090c8">(\${p.sku})</span></span>
      <span class="info-value"><span class="badge \${p.stock_quantity === 0 ? 'badge-red' : 'badge-amber'}">\${p.stock_quantity === 0 ? 'Out of stock' : \`\${p.stock_quantity} left\`}</span></span>
    </div>
  \`).join('');
  const inventoryUrl = \`\${process.env.APP_URL || 'http://localhost:5173'}/inventory\`;
  const content = \`
    <div class="body">
      <div class="greeting">Low stock alert — \${workspaceName}</div>
      <p class="text">Hi \${recipientName},</p>
      <p class="text">
        \${criticalCount > 0 ? \`<strong>\${criticalCount} product(s) are completely out of stock</strong> and \` : ''}
        \${lowCount} product(s) in <strong>\${workspaceName}</strong> are running low and need attention.
      </p>
      <div class="info-box">\${productRows}</div>
      <div style="text-align:center"><a href="\${inventoryUrl}" class="btn">View inventory alerts</a></div>
    </div>
  \`;
  return sendEmail({ to: recipientEmail, subject: \`[\${workspaceName}] Low stock alert — \${products.length} product(s) need attention\`, html: baseTemplate(content) });
};

const sendPurchaseOrderUpdate = async (recipientEmail, recipientName, po, newStatus) => {
  const statusMessages = {
    received: { subject: 'Purchase order received', heading: 'Order received', body: \`Purchase order <strong>\${po.number}</strong> has been marked as received. Stock levels have been updated automatically.\`, badge: 'badge-green', badgeText: 'Received' },
    cancelled: { subject: 'Purchase order cancelled', heading: 'Order cancelled', body: \`Purchase order <strong>\${po.number}</strong> has been cancelled. No stock changes have been made.\`, badge: 'badge-red', badgeText: 'Cancelled' },
    partial: { subject: 'Purchase order partially received', heading: 'Partial receipt recorded', body: \`A partial receipt has been recorded for purchase order <strong>\${po.number}</strong>. Stock has been updated for received items.\`, badge: 'badge-amber', badgeText: 'Partial' },
  };
  const config = statusMessages[newStatus];
  if (!config) return { success: false, error: 'unknown status for email' };
  const poUrl = \`\${process.env.APP_URL || 'http://localhost:5173'}/purchases\`;
  const content = \`
    <div class="body">
      <div class="greeting">\${config.heading}</div>
      <p class="text">Hi \${recipientName},</p>
      <p class="text">\${config.body}</p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">PO Number</span><span class="info-value">\${po.number}</span></div>
        <div class="info-row"><span class="info-label">Supplier</span><span class="info-value">\${po.supplier_name}</span></div>
        <div class="info-row"><span class="info-label">Status</span><span class="info-value"><span class="badge \${config.badge}">\${config.badgeText}</span></span></div>
      </div>
      <div style="text-align:center"><a href="\${poUrl}" class="btn">View purchase order</a></div>
    </div>
  \`;
  return sendEmail({ to: recipientEmail, subject: \`[PO] \${config.subject} — \${po.number}\`, html: baseTemplate(content) });
};

const sendBillToCustomer = async (customerEmail, customerName, bill) => {
  const billUrl = \`\${process.env.APP_URL || 'http://localhost:5173'}/sales\`;
  const content = \`
    <div class="body">
      <div class="greeting">Invoice from \${bill.workspace_name || 'IMS'}</div>
      <p class="text">Hi \${customerName},</p>
      <p class="text">Please find your invoice details below. Payment is due by <strong>\${new Date(bill.due_date).toLocaleDateString()}</strong>.</p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Invoice number</span><span class="info-value">\${bill.invoice_number}</span></div>
        <div class="info-row"><span class="info-label">Total due</span><span class="info-value" style="font-size:16px;color:#0f0f1a">$\${parseFloat(bill.total_amount).toFixed(2)}</span></div>
      </div>
      <div style="text-align:center"><a href="\${billUrl}" class="btn">View full invoice</a></div>
    </div>
  \`;
  return sendEmail({ to: customerEmail, subject: \`Invoice \${bill.invoice_number} — $\${parseFloat(bill.total_amount).toFixed(2)} due\`, html: baseTemplate(content) });
};

const sendOverdueReminder = async (customerEmail, customerName, bill) => {
  const daysOverdue = Math.floor((Date.now() - new Date(bill.due_date)) / 86400000);
  const billUrl = \`\${process.env.APP_URL || 'http://localhost:5173'}/sales\`;
  const content = \`
    <div class="body">
      <div class="greeting">Payment overdue — Invoice \${bill.invoice_number}</div>
      <p class="text">Hi \${customerName},</p>
      <div class="danger-box">
        Invoice \${bill.invoice_number} is <strong>\${daysOverdue} day(s) overdue</strong>. The outstanding balance is <strong>$\${parseFloat(bill.total_amount).toFixed(2)}</strong>.
      </div>
      <div style="text-align:center"><a href="\${billUrl}" class="btn btn-danger">View and pay invoice</a></div>
    </div>
  \`;
  return sendEmail({ to: customerEmail, subject: \`OVERDUE: Invoice \${bill.invoice_number}\`, html: baseTemplate(content) });
};

const sendPaymentConfirmation = async (customerEmail, customerName, bill, payment) => {
  const content = \`
    <div class="body">
      <div class="greeting">Payment received — Thank you!</div>
      <p class="text">Hi \${customerName},</p>
      <p class="text">We have received your payment of <strong>$\${parseFloat(payment.amount).toFixed(2)}</strong> for invoice <strong>\${bill.invoice_number}</strong>.</p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Invoice</span><span class="info-value">\${bill.invoice_number}</span></div>
        <div class="info-row"><span class="info-label">Payment amount</span><span class="info-value" style="color:#16a34a;font-weight:600">$\${parseFloat(payment.amount).toFixed(2)}</span></div>
        <div class="info-row"><span class="info-label">Payment method</span><span class="info-value">\${payment.method}</span></div>
      </div>
    </div>
  \`;
  return sendEmail({ to: customerEmail, subject: \`Payment confirmed — Invoice \${bill.invoice_number}\`, html: baseTemplate(content) });
};

const sendInviteEmail = async (inviteEmail, inviterName, role, workspaces, token) => {
  const acceptUrl = \`\${process.env.APP_URL || 'http://localhost:5173'}/accept-invite?token=\${token}\`;
  const workspaceList = workspaces && workspaces.length > 0 ? workspaces.map(w => \`<li>\${w.name}</li>\`).join('') : '<li>General System Access</li>';
  const content = \`
    <div class="body">
      <div class="greeting">You have been invited to StockFlow IMS</div>
      <p class="text"><strong>\${inviterName}</strong> has invited you to join StockFlow IMS as a <strong style="text-transform:capitalize">\${role}</strong>.</p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Your role</span><span class="info-value" style="text-transform:capitalize">\${role}</span></div>
        <div class="info-row">
          <span class="info-label">Workspace access</span>
          <span class="info-value"><ul style="list-style:none;padding:0;margin:0">\${workspaceList}</ul></span>
        </div>
      </div>
      <p class="text">Click the button below to accept the invitation and create your password.</p>
      <div style="text-align:center"><a href="\${acceptUrl}" class="btn">Accept invitation</a></div>
      <div class="alert-box">This invitation expires in 7 days.</div>
    </div>
  \`;
  return sendEmail({ to: inviteEmail, subject: \`\${inviterName} invited you to StockFlow IMS\`, html: baseTemplate(content) });
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendLowStockAlert,
  sendPurchaseOrderUpdate,
  sendBillToCustomer,
  sendOverdueReminder,
  sendPaymentConfirmation,
  sendInviteEmail
};
