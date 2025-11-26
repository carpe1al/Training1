import { Worker } from 'bullmq';
import { PDFJobData } from '../queues';
import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { promises as fs } from 'fs';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379
};

export const pdfWorker = new Worker(
  'pdf-rendering',
  async (job) => {
    const data = job.data as PDFJobData;
    console.log(`Rendering PDF job ${job.id}:`, data);

    try {
      const outputPath = `/tmp/${data.documentId}.pdf`;

      switch (data.templateType) {
        case 'certificate':
          await renderCertificate(data.data, outputPath);
          break;
        case 'handout':
          await renderHandout(data.data, outputPath);
          break;
        case 'report':
          await renderReport(data.data, outputPath);
          break;
        default:
          throw new Error(`Unknown template type: ${data.templateType}`);
      }

      await job.updateProgress(90);

      // Upload to S3 (TODO: implement actual S3 upload)
      const s3Url = `https://s3.amazonaws.com/training1/${data.documentId}.pdf`;

      await job.updateProgress(100);

      return { success: true, pdfUrl: s3Url };
    } catch (error: any) {
      console.error('PDF rendering error:', error);
      throw error;
    }
  },
  { connection, concurrency: 5 }
);

async function renderCertificate(data: any, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', layout: 'landscape' });
    const stream = createWriteStream(outputPath);

    doc.pipe(stream);

    // Certificate design
    doc.fontSize(48).font('Helvetica-Bold')
      .text('Certificate of Completion', 50, 100, { align: 'center' });

    doc.fontSize(24).font('Helvetica')
      .text(`Awarded to`, 50, 180, { align: 'center' });

    doc.fontSize(36).font('Helvetica-Bold')
      .text(data.userName, 50, 220, { align: 'center' });

    doc.fontSize(18).font('Helvetica')
      .text(`For successfully completing`, 50, 300, { align: 'center' });

    doc.fontSize(24).font('Helvetica-Bold')
      .text(data.courseName, 50, 340, { align: 'center' });

    doc.fontSize(14).font('Helvetica')
      .text(`Date: ${new Date(data.completedAt).toLocaleDateString()}`, 50, 420, { align: 'center' });

    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

async function renderHandout(data: any, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = createWriteStream(outputPath);

    doc.pipe(stream);

    doc.fontSize(20).text(data.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(data.content);

    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

async function renderReport(data: any, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = createWriteStream(outputPath);

    doc.pipe(stream);

    doc.fontSize(24).text(data.reportTitle, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    // Add report data
    if (data.sections) {
      data.sections.forEach((section: any) => {
        doc.fontSize(16).text(section.title);
        doc.fontSize(12).text(section.content);
        doc.moveDown();
      });
    }

    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

pdfWorker.on('completed', (job) => {
  console.log(`PDF job ${job.id} completed successfully`);
});

pdfWorker.on('failed', (job, err) => {
  console.error(`PDF job ${job?.id} failed:`, err.message);
});
