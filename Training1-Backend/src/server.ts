import fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { createSocketServer } from './ws/socket';

// Import all route registrations
import { registerAuth } from './modules/auth/routes';
import { registerTraining } from './modules/training/routes';
import { registerTenants } from './modules/tenants/routes';
import { registerUsers } from './modules/users/routes';
import { registerAssessment } from './modules/assessment/routes';
import { registerGrading } from './modules/grading/routes';
import { registerAuthoring } from './modules/authoring/routes';
import { registerRenderers } from './modules/renderers/routes';
import { registerRecorder } from './modules/recorder/routes';
import { registerMedia } from './modules/media/routes';
import { registerLive } from './modules/live/routes';
import { registerCompliance } from './modules/compliance/routes';
import { registerAnalytics } from './modules/analytics/routes';
import { registerNotify } from './modules/notify/routes';
import { registerBilling } from './modules/billing/routes';
import { registerSearch } from './modules/search/routes';
import { registerVideoGen } from './modules/video-gen/routes';
import { registerInteractive } from './modules/interactive/routes';

export function createServer(){
  const app = fastify({ logger: true });
  
  // Middleware
  app.register(cors, { origin: process.env.CORS_ORIGIN_FRONTEND?.split(','), credentials: true });
  app.register(cookie, { hook: 'onRequest' });
  
  // Health check
  app.get('/healthz', async()=>({ ok:true }));
  
  // Register all module routes with proper prefixes
  app.register(registerAuth, { prefix: '/v1/auth' });
  app.register(registerTenants, { prefix: '/v1/tenants' });
  app.register(registerUsers, { prefix: '/v1/users' });
  app.register(registerTraining, { prefix: '/v1/courses' });
  app.register(registerAssessment, { prefix: '/v1/assessment' });
  app.register(registerGrading, { prefix: '/v1/grading' });
  app.register(registerAuthoring, { prefix: '/v1/authoring' });
  app.register(registerRenderers, { prefix: '/v1/renderers' });
  app.register(registerRecorder, { prefix: '/v1/recorder' });
  app.register(registerMedia, { prefix: '/v1/media' });
  app.register(registerLive, { prefix: '/v1/live' });
  app.register(registerCompliance, { prefix: '/v1/compliance' });
  app.register(registerAnalytics, { prefix: '/v1/analytics' });
  app.register(registerNotify, { prefix: '/v1/notify' });
  app.register(registerBilling, { prefix: '/v1/billing' });
  app.register(registerSearch, { prefix: '/v1/search' });
  app.register(registerVideoGen, { prefix: '/v1/video-gen' });
  app.register(registerInteractive, { prefix: '/v1/interactive' });
  
  return app;
}

if (require.main === module){
  const app = createServer();
  const port = Number(process.env.PORT||4000);
  
  app.listen({ port, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`HTTP Server listening at ${address}`);
    
    // Initialize WebSocket server
    const io = createSocketServer(app.server);
    console.log('WebSocket server initialized');
    
    // Make io available to routes via app decorator
    app.decorate('io', io);
  });
}