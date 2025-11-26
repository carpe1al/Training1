import { Worker } from 'bullmq';
import { VideoJobData } from './queues';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379
};

export const videoWorker = new Worker(
  'video-processing',
  async (job) => {
    const data = job.data as VideoJobData;
    console.log(`Processing video job ${job.id}:`, data);

    try {
      const results = [];

      // Download from S3 (TODO: implement actual S3 download)
      const inputPath = `/tmp/${data.mediaFileId}-input.mp4`;
      await job.updateProgress(10);

      if (data.operations.includes('transcode')) {
        const outputPath = `/tmp/${data.mediaFileId}-transcoded.mp4`;
        await transcodeVideo(inputPath, outputPath);
        results.push({ operation: 'transcode', path: outputPath });
        await job.updateProgress(50);
      }

      if (data.operations.includes('thumbnail')) {
        const thumbnailPath = `/tmp/${data.mediaFileId}-thumb.jpg`;
        await generateThumbnail(inputPath, thumbnailPath);
        results.push({ operation: 'thumbnail', path: thumbnailPath });
        await job.updateProgress(70);
      }

      if (data.operations.includes('captions')) {
        // TODO: Implement caption generation (Whisper API, etc.)
        await job.updateProgress(90);
      }

      // Upload results to S3 (TODO: implement actual S3 upload)
      await job.updateProgress(100);

      return { success: true, results };
    } catch (error: any) {
      console.error('Video processing error:', error);
      throw error;
    }
  },
  { connection, concurrency: 2 }
);

async function transcodeVideo(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-i', inputPath,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      outputPath
    ]);

    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });

    ffmpeg.on('error', reject);
  });
}

async function generateThumbnail(videoPath: string, thumbnailPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-i', videoPath,
      '-ss', '00:00:01',
      '-vframes', '1',
      '-vf', 'scale=320:-1',
      thumbnailPath
    ]);

    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });

    ffmpeg.on('error', reject);
  });
}

videoWorker.on('completed', (job) => {
  console.log(`Video job ${job.id} completed successfully`);
});

videoWorker.on('failed', (job, err) => {
  console.error(`Video job ${job?.id} failed:`, err.message);
});
