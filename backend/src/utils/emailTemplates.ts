const BRAND_COLOR = '#1a1a2e';
const ACCENT_COLOR = '#e8562a';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

function baseLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <!-- Header -->
      <tr>
        <td style="background:${BRAND_COLOR};padding:28px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:900;letter-spacing:1px;">RAJESH INDUSTRIES</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:2px;">PREMIUM STEEL KITCHEN STORAGE</p>
        </td>
      </tr>
      <!-- Body -->
      <tr><td style="padding:40px;">${body}</td></tr>
      <!-- Footer -->
      <tr>
        <td style="background:#f9f9f9;border-top:1px solid #eee;padding:24px 40px;text-align:center;">
          <p style="margin:0 0 8px;color:#888;font-size:12px;">Rajesh Industries · Sonawala Road, Goregaon East, Mumbai – 400063</p>
          <p style="margin:0;color:#bbb;font-size:11px;">© 2025 Rajesh Industries. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function btn(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:${ACCENT_COLOR};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;letter-spacing:0.5px;">${text}</a>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #eee;margin:28px 0;" />`;
}

// ── Welcome Email ───────────────────────────────────────────────────────────
export function welcomeEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: `Welcome to Rajesh Industries, ${firstName}! 🎉`,
    html: baseLayout('Welcome', `
      <h2 style="margin:0 0 8px;color:${BRAND_COLOR};font-size:24px;font-weight:900;">Hi ${firstName}, welcome aboard!</h2>
      <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 20px;">
        Thank you for creating an account at <strong>Rajesh Industries</strong>. We're delighted to have you as part of our family of premium steel kitchen lovers.
      </p>
      <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 28px;">
        Explore our exclusive range of <strong>food-grade stainless steel racks, organisers & storage solutions</strong> — built to last a lifetime.
      </p>
      <div style="text-align:center;margin-bottom:32px;">
        ${btn('Shop Now', `${FRONTEND_URL}/products`)}
      </div>
      ${divider()}
      <p style="color:#888;font-size:13px;margin:0;">
        Have questions? WhatsApp us at <a href="https://wa.me/919870212660" style="color:${ACCENT_COLOR};">+91 98702 12660</a> or email <a href="mailto:rajeshindustries29@gmail.com" style="color:${ACCENT_COLOR};">rajeshindustries29@gmail.com</a>.
      </p>
    `),
  };
}

// ── Order Confirmation Email ────────────────────────────────────────────────
export function orderConfirmationEmail(opts: {
  firstName: string;
  orderId: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  shippingAddress: Record<string, string>;
  paymentMethod: string;
}): { subject: string; html: string } {
  const { firstName, orderId, items, subtotal, tax, taxRate, total, shippingAddress, paymentMethod } = opts;
  const shortId = orderId.slice(0, 8).toUpperCase();

  const itemRows = items.map(i => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:#333;font-size:14px;">${i.name}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:14px;text-align:center;">×${i.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:#333;font-size:14px;text-align:right;font-weight:700;">₹${(Number(i.price) * i.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const address = shippingAddress;
  const isCod = paymentMethod?.toLowerCase() === 'cod';

  return {
    subject: `Order Confirmed — #${shortId} | Rajesh Industries`,
    html: baseLayout('Order Confirmed', `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin-bottom:28px;display:flex;align-items:center;gap:12px;">
        <span style="font-size:24px;">✅</span>
        <div>
          <p style="margin:0;font-weight:900;color:#166534;font-size:16px;">Your order has been confirmed!</p>
          <p style="margin:4px 0 0;color:#166534;font-size:13px;">Order #${shortId}</p>
        </div>
      </div>

      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Hi <strong>${firstName}</strong>, thank you for shopping with us. We've received your order and it's being prepared.
        ${isCod ? ' Our team will contact you before delivery.' : ''}
      </p>

      <!-- Items Table -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <thead>
          <tr style="background:#f8f8f8;">
            <th style="padding:10px 0;text-align:left;font-size:12px;color:#888;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Item</th>
            <th style="padding:10px 0;text-align:center;font-size:12px;color:#888;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Qty</th>
            <th style="padding:10px 0;text-align:right;font-size:12px;color:#888;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:16px 0 4px;font-size:13px;color:#888;">Subtotal</td>
            <td style="padding:16px 0 4px;text-align:right;font-size:13px;color:#333;font-weight:700;">₹${Number(subtotal).toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:4px 0;font-size:13px;color:#888;">Shipping</td>
            <td style="padding:4px 0;text-align:right;font-size:13px;color:#16a34a;font-weight:700;">Free</td>
          </tr>
          ${tax > 0 ? `<tr>
            <td colspan="2" style="padding:4px 0;font-size:13px;color:#888;">GST (${Number(taxRate).toFixed(0)}%)</td>
            <td style="padding:4px 0;text-align:right;font-size:13px;color:#333;font-weight:700;">₹${Number(tax).toFixed(2)}</td>
          </tr>` : ''}
          <tr>
            <td colspan="2" style="padding:8px 0;font-size:16px;font-weight:900;color:${BRAND_COLOR};">Total</td>
            <td style="padding:8px 0;text-align:right;font-size:20px;font-weight:900;color:${ACCENT_COLOR};">₹${Number(total).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      ${divider()}

      <!-- Address + Payment -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:top;width:50%;padding-right:16px;">
            <p style="margin:0 0 8px;font-weight:900;color:${BRAND_COLOR};font-size:13px;text-transform:uppercase;letter-spacing:1px;">📦 Delivery Address</p>
            <p style="margin:0;color:#555;font-size:13px;line-height:1.8;">
              ${address.fullName || ''}<br/>
              ${address.line1 || ''}<br/>
              ${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}<br/>
              ${address.country || ''}
              ${address.phone ? `<br/>📞 ${address.phone}` : ''}
            </p>
          </td>
          <td style="vertical-align:top;width:50%;padding-left:16px;border-left:1px solid #eee;">
            <p style="margin:0 0 8px;font-weight:900;color:${BRAND_COLOR};font-size:13px;text-transform:uppercase;letter-spacing:1px;">💳 Payment</p>
            <p style="margin:0;color:#555;font-size:13px;line-height:1.8;">
              ${isCod ? 'Cash on Delivery' : paymentMethod}<br/>
              <span style="background:${isCod ? '#fef9c3' : '#dcfce7'};color:${isCod ? '#854d0e' : '#166534'};font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;text-transform:uppercase;">${isCod ? 'Pay on Delivery' : 'Paid'}</span>
            </p>
          </td>
        </tr>
      </table>

      ${divider()}

      <div style="text-align:center;margin-top:8px;">
        ${btn('View Order', `${FRONTEND_URL}/orders/${orderId}`)}
      </div>
    `),
  };
}

// ── Order Status Update Email ───────────────────────────────────────────────
const STATUS_INFO: Record<string, { emoji: string; title: string; message: string; color: string }> = {
  processing: {
    emoji: '⚙️',
    title: 'Your order is being processed',
    message: 'We\'ve confirmed your order and our team is now preparing it for dispatch.',
    color: '#f59e0b',
  },
  shipped: {
    emoji: '🚚',
    title: 'Your order is on its way!',
    message: 'Great news! Your order has been dispatched and is heading to you.',
    color: '#3b82f6',
  },
  delivered: {
    emoji: '🎉',
    title: 'Your order has been delivered!',
    message: 'We hope you love your new steel kitchen products. Enjoy cooking smarter!',
    color: '#22c55e',
  },
  cancelled: {
    emoji: '❌',
    title: 'Your order has been cancelled',
    message: 'Your order has been cancelled. If you have any questions, please contact us.',
    color: '#ef4444',
  },
  refunded: {
    emoji: '💰',
    title: 'Your refund has been processed',
    message: 'Your refund has been initiated. It may take 5-7 business days to reflect in your account.',
    color: '#6b7280',
  },
};

export function orderStatusEmail(opts: {
  firstName: string;
  orderId: string;
  status: string;
  notes?: string;
}): { subject: string; html: string } | null {
  const { firstName, orderId, status, notes } = opts;
  const info = STATUS_INFO[status.toLowerCase()];
  if (!info) return null;

  const shortId = orderId.slice(0, 8).toUpperCase();

  return {
    subject: `${info.emoji} Order #${shortId} — ${info.title}`,
    html: baseLayout(info.title, `
      <div style="background:#f8fafc;border-left:4px solid ${info.color};border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:28px;">
        <p style="margin:0;font-size:22px;">${info.emoji}</p>
        <p style="margin:6px 0 0;font-weight:900;color:${BRAND_COLOR};font-size:18px;">${info.title}</p>
      </div>

      <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 16px;">
        Hi <strong>${firstName}</strong>, ${info.message}
      </p>

      ${notes ? `
        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#0369a1;font-weight:700;margin-bottom:4px;">Update from our team:</p>
          <p style="margin:0;font-size:14px;color:#0c4a6e;">${notes}</p>
        </div>
      ` : ''}

      <p style="color:#888;font-size:14px;margin:0 0 28px;">Order Reference: <strong style="color:${BRAND_COLOR};">#${shortId}</strong></p>

      <div style="text-align:center;margin-bottom:32px;">
        ${btn('Track Your Order', `${FRONTEND_URL}/orders/${orderId}`)}
      </div>

      ${divider()}
      <p style="color:#888;font-size:13px;margin:0;">
        Need help? WhatsApp us at <a href="https://wa.me/919870212660" style="color:${ACCENT_COLOR};">+91 98702 12660</a>
      </p>
    `),
  };
}

// ── Password Reset Email ────────────────────────────────────────────────────
export function passwordResetEmail(opts: {
  firstName: string;
  resetUrl: string;
}): { subject: string; html: string } {
  const { firstName, resetUrl } = opts;
  return {
    subject: 'Reset Your Password — Rajesh Industries',
    html: baseLayout('Reset Password', `
      <h2 style="margin:0 0 8px;color:${BRAND_COLOR};font-size:22px;font-weight:900;">Password Reset Request</h2>
      <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 20px;">
        Hi <strong>${firstName}</strong>, we received a request to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
      </p>

      <div style="text-align:center;margin:32px 0;">
        ${btn('Reset My Password', resetUrl)}
      </div>

      <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:14px 18px;margin-top:8px;">
        <p style="margin:0;color:#854d0e;font-size:13px;">
          ⚠️ If you didn't request this, you can safely ignore this email. Your password will not change.
        </p>
      </div>

      ${divider()}
      <p style="color:#888;font-size:12px;margin:0;">
        Or paste this link in your browser:<br/>
        <a href="${resetUrl}" style="color:${ACCENT_COLOR};word-break:break-all;">${resetUrl}</a>
      </p>
    `),
  };
}
