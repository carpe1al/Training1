// Import all workers to start them
import { videoWorker } from './video.worker';
import { pdfWorker } from './pdf.worker';
import { emailWorker } from './email.worker';
import { analyticsWorker } from './analytics.worker';

console.log('Starting all workers...');

// Export workers for potential management
export { videoWorker, pdfWorker, emailWorker, analyticsWorker };

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down workers gracefully...');
  await Promise.all([
    videoWorker.close(),
    pdfWorker.close(),
    emailWorker.close(),
    analyticsWorker.close()
  ]);
  process.exit(0);
});
