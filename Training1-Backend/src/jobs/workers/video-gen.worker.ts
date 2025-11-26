import { Worker } from 'bullmq';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import axios from 'axios';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379
};

interface VideoGenJobData {
  projectId: string;
  scenes: Array<{
    id: string;
    type: 'avatar' | 'text' | 'image' | 'animation';
    duration: number;
    voiceText?: string;
    voiceConfig?: {
      voiceId: string;
      speed: number;
      pitch: number;
    };
    avatarId?: string;
    config: any;
  }>;
  config: {
    resolution: '720p' | '1080p' | '4k';
    fps: number;
    backgroundMusic?: string;
  };
}

export const videoGenWorker = new Worker(
  'video-generation',
  async (job) => {
    const data = job.data as VideoGenJobData;
    console.log(`Generating video for project ${data.projectId}`);

    try {
      const scenePaths: string[] = [];
      const totalScenes = data.scenes.length;

      // Step 1: Generate TTS audio for each scene
      await job.updateProgress(5);
      const audioFiles = await Promise.all(
        data.scenes.map(async (scene, idx) => {
          if (scene.voiceText) {
            return await generateTTS(scene.voiceText, scene.voiceConfig);
          }
          return null;
        })
      );

      // Step 2: Render each scene
      await job.updateProgress(20);
      for (let i = 0; i < data.scenes.length; i++) {
        const scene = data.scenes[i];
        const audioFile = audioFiles[i];

        let scenePath: string;
        switch (scene.type) {
          case 'avatar':
            scenePath = await renderAvatarScene(scene, audioFile);
            break;
          case 'text':
            scenePath = await renderTextScene(scene, audioFile);
            break;
          case 'image':
            scenePath = await renderImageScene(scene, audioFile);
            break;
          case 'animation':
            scenePath = await renderAnimationScene(scene, audioFile);
            break;
          default:
            throw new Error(`Unknown scene type: ${scene.type}`);
        }

        scenePaths.push(scenePath);
        await job.updateProgress(20 + (60 * (i + 1) / totalScenes));
      }

      // Step 3: Composite all scenes together
      await job.updateProgress(85);
      const outputPath = `/tmp/video-${data.projectId}-final.mp4`;
      await compositeScenes(scenePaths, outputPath, data.config);

      // Step 4: Upload to S3
      await job.updateProgress(95);
      const s3Url = await uploadToS3(outputPath, data.projectId);

      await job.updateProgress(100);

      return {
        success: true,
        videoUrl: s3Url,
        duration: data.scenes.reduce((acc, s) => acc + s.duration, 0)
      };
    } catch (error: any) {
      console.error('Video generation error:', error);
      throw error;
    }
  },
  { connection, concurrency: 2 }
);

async function generateTTS(text: string, config?: any): Promise<string> {
  // TODO: Integrate with ElevenLabs, Azure, or Google TTS
  console.log(`Generating TTS for: ${text.substring(0, 50)}...`);
  
  const outputPath = `/tmp/tts-${Date.now()}.mp3`;
  
  // Mock implementation - replace with actual TTS API
  if (process.env.ELEVENLABS_API_KEY) {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${config?.voiceId || 'default'}`,
      { text, model_id: 'eleven_monolingual_v1' },
      {
        headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY },
        responseType: 'arraybuffer'
      }
    );
    await fs.writeFile(outputPath, response.data);
  }
  
  return outputPath;
}

async function renderAvatarScene(scene: any, audioFile: string | null): Promise<string> {
  // TODO: Implement avatar rendering with D-ID, Synthesia API, or custom solution
  console.log(`Rendering avatar scene ${scene.id}`);
  
  const outputPath = `/tmp/scene-${scene.id}.mp4`;
  
  // Mock: Create a simple video with avatar image and audio
  // In production: Use D-ID API, Synthesia API, or custom avatar renderer
  
  return outputPath;
}

async function renderTextScene(scene: any, audioFile: string | null): Promise<string> {
  console.log(`Rendering text scene ${scene.id}`);
  
  const outputPath = `/tmp/scene-${scene.id}.mp4`;
  
  // Use FFmpeg to create video with text overlay
  return new Promise((resolve, reject) => {
    const args = [
      '-f', 'lavfi',
      '-i', `color=c=${scene.config.backgroundColor || 'white'}:s=1920x1080:d=${scene.duration}`,
      '-vf', `drawtext=text='${scene.config.text}':fontsize=${scene.config.fontSize || 48}:fontcolor=${scene.config.textColor || 'black'}:x=(w-text_w)/2:y=(h-text_h)/2`,
    ];
    
    if (audioFile) {
      args.push('-i', audioFile, '-c:a', 'aac');
    }
    
    args.push('-c:v', 'libx264', '-t', scene.duration.toString(), outputPath);
    
    const ffmpeg = spawn('ffmpeg', args);
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve(outputPath);
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });
}

async function renderImageScene(scene: any, audioFile: string | null): Promise<string> {
  console.log(`Rendering image scene ${scene.id}`);
  
  const outputPath = `/tmp/scene-${scene.id}.mp4`;
  
  // Create video from static image with Ken Burns effect
  return new Promise((resolve, reject) => {
    const args = [
      '-loop', '1',
      '-i', scene.config.imagePath,
      '-vf', `scale=1920:1080,zoompan=z='min(zoom+0.0015,1.5)':d=${scene.duration * 25}:s=1920x1080`,
    ];
    
    if (audioFile) {
      args.push('-i', audioFile, '-c:a', 'aac');
    }
    
    args.push('-c:v', 'libx264', '-t', scene.duration.toString(), '-pix_fmt', 'yuv420p', outputPath);
    
    const ffmpeg = spawn('ffmpeg', args);
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve(outputPath);
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });
}

async function renderAnimationScene(scene: any, audioFile: string | null): Promise<string> {
  // TODO: Integrate with animation library (Remotion, Lottie, etc)
  console.log(`Rendering animation scene ${scene.id}`);
  return `/tmp/scene-${scene.id}.mp4`;
}

async function compositeScenes(scenePaths: string[], outputPath: string, config: any): Promise<void> {
  console.log(`Compositing ${scenePaths.length} scenes`);
  
  // Create concat file
  const concatFile = '/tmp/concat.txt';
  const concatContent = scenePaths.map(p => `file '${p}'`).join('\n');
  await fs.writeFile(concatFile, concatContent);
  
  return new Promise((resolve, reject) => {
    const args = [
      '-f', 'concat',
      '-safe', '0',
      '-i', concatFile,
      '-c', 'copy',
    ];
    
    if (config.backgroundMusic) {
      args.push(
        '-i', config.backgroundMusic,
        '-filter_complex', '[0:a][1:a]amerge=inputs=2[a]',
        '-map', '0:v',
        '-map', '[a]',
        '-c:v', 'copy',
        '-c:a', 'aac'
      );
    }
    
    args.push(outputPath);
    
    const ffmpeg = spawn('ffmpeg', args);
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });
}

async function uploadToS3(filePath: string, projectId: string): Promise<string> {
  // TODO: Implement actual S3 upload
  console.log(`Uploading video to S3: ${projectId}`);
  return `https://s3.amazonaws.com/training1/videos/${projectId}.mp4`;
}

videoGenWorker.on('completed', (job) => {
  console.log(`Video generation job ${job.id} completed successfully`);
});

videoGenWorker.on('failed', (job, err) => {
  console.error(`Video generation job ${job?.id} failed:`, err.message);
});
