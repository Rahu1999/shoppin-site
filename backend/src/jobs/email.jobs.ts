import { sendMail } from '@utils/emailService';
import { welcomeEmail, orderConfirmationEmail, passwordResetEmail, adminNewOrderEmail } from '@utils/emailTemplates';
import { logger } from '../config/logger';
import { env } from '@config/env';

export class EmailJobs {
  static async sendOrderConfirmation(
    email: string,
    orderId: string,
    items: Array<{ name: string; quantity: number; price: number }>,
    total: number,
    opts?: { firstName?: string; shippingAddress?: Record<string, string>; paymentMethod?: string; subtotal?: number; shippingFee?: number; shippingMethodName?: string; tax?: number; taxRate?: number },
  ) {
    try {
      const subtotal = opts?.subtotal ?? total;
      const tpl = orderConfirmationEmail({
        firstName: opts?.firstName || 'Customer',
        orderId,
        items,
        subtotal,
        shippingFee: opts?.shippingFee ?? 0,
        shippingMethodName: opts?.shippingMethodName,
        tax: opts?.tax ?? 0,
        taxRate: opts?.taxRate ?? 0,
        total,
        shippingAddress: opts?.shippingAddress || {},
        paymentMethod: opts?.paymentMethod || 'COD',
      });
      await sendMail({ to: email, subject: tpl.subject, html: tpl.html });
      return true;
    } catch (e) {
      logger.error(`[EmailJobs] sendOrderConfirmation failed for ${email}:`, e);
      return false;
    }
  }

  static async sendWelcomeEmail(email: string, firstName: string) {
    try {
      const tpl = welcomeEmail(firstName);
      await sendMail({ to: email, subject: tpl.subject, html: tpl.html });
      return true;
    } catch (e) {
      logger.error(`[EmailJobs] sendWelcomeEmail failed for ${email}:`, e);
      return false;
    }
  }

  static async sendAdminNewOrderNotification(opts: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    subtotal: number;
    shippingFee: number;
    shippingMethodName?: string;
    tax: number;
    taxRate: number;
    discount: number;
    total: number;
    shippingAddress: Record<string, string>;
    paymentMethod: string;
  }) {
    const adminEmail = env.ADMIN_EMAIL;
    if (!adminEmail) {
      logger.warn('[EmailJobs] ADMIN_EMAIL not set — skipping admin order notification');
      return false;
    }
    try {
      const tpl = adminNewOrderEmail(opts);
      await sendMail({ to: adminEmail, subject: tpl.subject, html: tpl.html });
      return true;
    } catch (e) {
      logger.error(`[EmailJobs] sendAdminNewOrderNotification failed:`, e);
      return false;
    }
  }

  static async sendPasswordReset(email: string, firstName: string, resetUrl: string) {
    try {
      const tpl = passwordResetEmail({ firstName, resetUrl });
      await sendMail({ to: email, subject: tpl.subject, html: tpl.html });
      return true;
    } catch (e) {
      logger.error(`[EmailJobs] sendPasswordReset failed for ${email}:`, e);
      return false;
    }
  }
}
