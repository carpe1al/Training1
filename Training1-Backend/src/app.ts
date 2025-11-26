import { createServer } from './server';

async function bootstrap() {
  const app = createServer();
  
  try {
    await app.listen({ port: Number(process.env.PORT || 4000), host: '0.0.0.0' });
    console.log('🚀 Server ready at http://localhost:4000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();