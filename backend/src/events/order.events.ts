import { EventEmitter } from 'events';
import { logger } from '../config/logger';
import { EmailJobs } from '../jobs/email.jobs';

// Define typed events
export interface AppEvents {
  'order.created': [{ orderId: string; userEmail: string; total: number; items: any[] }];
  'order.payment.success': [{ orderId: string; userEmail: string }];
  'user.registered': [{ userEmail: string; firstName: string }];
}

class AppEventDriver extends EventEmitter {
  public emitEvent<K extends keyof AppEvents>(event: K, ...args: AppEvents[K]): boolean {
    return super.emit(event, ...args);
  }

  public onEvent<K extends keyof AppEvents>(event: K, listener: (...args: AppEvents[K]) => void): this {
    return super.on(event, listener as any);
  }
}

export const eventBus = new AppEventDriver();

// Setup Order Events Listeners
export function setupOrderEvents() {
  logger.info('[Events] Initializing Order Event Listeners');

  eventBus.onEvent('order.created', async (data) => {
    logger.info(`[Events] Received order.created event for Order #${data.orderId}`);
    
    // Trigger background email job
    EmailJobs.sendOrderConfirmation(data.userEmail, data.orderId, data.items, data.total).catch(e => {
       logger.error(`[Events] Background job failed silently: ${e}`);
    });
  });

  eventBus.onEvent('order.payment.success', async (data) => {
    logger.info(`[Events] Received order.payment.success event for Order #${data.orderId}`);
    
    // Further events like triggering logistics/fulfillment API can be added here
    logger.info(`[Events] Triggering fulfillment worker wrapper for Order #${data.orderId}`);
  });
  
  eventBus.onEvent('user.registered', async (data) => {
     logger.info(`[Events] Received user.registered event for ${data.userEmail}`);
     // Background welcome email
     EmailJobs.sendWelcomeEmail(data.userEmail, data.firstName).catch(e => {
        logger.error(`[Events] Failed to send welcome email: ${e}`);
     });
  });
}
