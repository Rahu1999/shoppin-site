import { logger } from '../config/logger';

// Mock Email Worker
// In production, this would use a real queue system like BullMQ with Redis and an email provider like SendGrid/AWS SES.
export class EmailJobs {
  static async sendOrderConfirmation(email: string, orderId: string, _items: any[], _total: number) {
    logger.info(`[Email Worker] Processing Order Confirmation for ${email}. Order ID: ${orderId}`);
    try {
      // simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      logger.info(`[Email Worker] Validated email template and dispatched to ${email}.`);
      return true;
    } catch (e) {
      logger.error(`[Email Worker] Failed to send order confirmation to ${email}:`, e);
      return false;
    }
  }

  static async sendWelcomeEmail(email: string, name: string) {
    logger.info(`[Email Worker] Processing Welcome Email for ${email}`);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      logger.info(`[Email Worker] Welcome email dispatched to ${name} <${email}>.`);
      return true;
    } catch (e) {
       logger.error(`[Email Worker] Failed sending welcome email to ${email}:`, e);
       return false;
    }
  }

  static async sendPasswordReset(email: string, resetToken: string) {
    logger.info(`[Email Worker] Processing Password Reset for ${email}`);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      logger.info(`[Email Worker] Reset link with token ${resetToken} dispatched to ${email}.`);
      return true;
    } catch (e) {
      logger.error(`[Email Worker] Failed sending reset link to ${email}:`, e);
      return false;
    }
  }
}
