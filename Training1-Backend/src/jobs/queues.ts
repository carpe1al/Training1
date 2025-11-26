import { Queue, Worker, QueueEvents } from 'bullmq';
import { redis } from '../config/redis';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379
};

// Define job queues
export const videoQueue = new Queue('video-processing', { connection });
export const pdfQueue = new Queue('pdf-rendering', { connection });
export const emailQueue = new Queue('email-sending', { connection });
export const analyticsQueue = new Queue('analytics-aggregation', { connection });

// Job data types
export interface VideoJobData {
  mediaFileId: string;
  s3Key: string;
  operations: Array<'transcode' | 'thumbnail' | 'captions'>;
}

export interface PDFJobData {
  documentId: string;
  templateType: 'certificate' | 'handout' | 'report';
  data: Record<string, any>;
}

export interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export interface AnalyticsJobData {
  type: 'course-completion' | 'user-progress' | 'xapi-aggregation';
  tenantId: string;
  dateRange?: { start: Date; end: Date };
}

// Helper functions to enqueue jobs
export async function enqueueVideoProcessing(data: VideoJobData, priority = 5) {
  return videoQueue.add('process-video', data, { priority });
}

export async function enqueuePDFRendering(data: PDFJobData, priority = 5) {
  return pdfQueue.add('render-pdf', data, { priority });
}

export async function enqueueEmail(data: EmailJobData, priority = 5) {
  return emailQueue.add('send-email', data, { priority, attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
}

export async function enqueueAnalytics(data: AnalyticsJobData) {
  return analyticsQueue.add('aggregate-analytics', data, { priority: 1 });
}

// Queue event listeners for monitoring
const videoEvents = new QueueEvents('video-processing', { connection });
videoEvents.on('completed', ({ jobId }) => {
  console.log(`Video job ${jobId} completed`);
});
videoEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`Video job ${jobId} failed:`, failedReason);
});

const emailEvents = new QueueEvents('email-sending', { connection });
emailEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`Email job ${jobId} failed:`, failedReason);
});
