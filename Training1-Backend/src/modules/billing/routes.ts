import { FastifyPluginAsync } from 'fastify';

export const registerBilling: FastifyPluginAsync = async (app) => {
  // Plans
  app.get('/plans', async (req, reply) => {
    // TODO: List available plans
    return { plans: [] };
  });

  app.get('/plans/:id', async (req, reply) => {
    // TODO: Get plan details
    return { plan: null };
  });

  // Subscriptions
  app.get('/subscription', async (req, reply) => {
    // TODO: Get current subscription
    return { subscription: null };
  });

  app.post('/subscription/upgrade', async (req, reply) => {
    // TODO: Upgrade subscription
    return { message: 'Subscription upgraded' };
  });

  app.post('/subscription/downgrade', async (req, reply) => {
    // TODO: Downgrade subscription
    return { message: 'Subscription downgraded' };
  });

  app.post('/subscription/cancel', async (req, reply) => {
    // TODO: Cancel subscription
    return { message: 'Subscription cancelled' };
  });

  // Payment methods
  app.get('/payment-methods', async (req, reply) => {
    // TODO: List payment methods
    return { methods: [] };
  });

  app.post('/payment-methods', async (req, reply) => {
    // TODO: Add payment method
    return { methodId: '' };
  });

  app.delete('/payment-methods/:id', async (req, reply) => {
    // TODO: Remove payment method
    return { message: 'Method removed' };
  });

  app.post('/payment-methods/:id/default', async (req, reply) => {
    // TODO: Set default payment method
    return { message: 'Default method updated' };
  });

  // Invoices
  app.get('/invoices', async (req, reply) => {
    // TODO: List invoices
    return { invoices: [] };
  });

  app.get('/invoices/:id', async (req, reply) => {
    // TODO: Get invoice
    return { invoice: null };
  });

  app.get('/invoices/:id/download', async (req, reply) => {
    // TODO: Download invoice PDF
    return reply.send('pdf');
  });

  // Stripe webhooks
  app.post('/webhooks/stripe', async (req, reply) => {
    // TODO: Handle Stripe webhook
    return { message: 'Webhook processed' };
  });

  // Usage tracking
  app.get('/usage', async (req, reply) => {
    // TODO: Get current usage metrics
    return { usage: null };
  });
};
