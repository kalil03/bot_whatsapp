import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs-extra';
import axios from 'axios';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

function getTempPath(ext: string): string {
  return path.join(os.tmpdir(), `botwa_${crypto.randomBytes(6).toString('hex')}.${ext}`);
}

export async function convertToOgg(sourceType: 'buffer' | 'url' | 'file', video: Buffer | string): Promise<Buffer> {
  let inputVideoPath = getTempPath('mp4');
  const outputAudioPath = getTempPath('ogg');

  if (sourceType === 'file') {
    inputVideoPath = video as string;
  } else if (sourceType === 'buffer') {
    if (!Buffer.isBuffer(video)) throw new Error('Esperava Buffer, mas recebeu outro tipo.');
    fs.writeFileSync(inputVideoPath, video as Buffer);
  } else {
    const { data } = await axios.get(video as string, { responseType: 'arraybuffer' });
    fs.writeFileSync(inputVideoPath, Buffer.from(data));
  }

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputVideoPath)
      .outputOptions([
        '-vn',
        '-c:a libopus',
        '-b:a 128k',
        '-vbr on',
        '-compression_level 10',
        '-application voip',
        '-ac 1',
        '-ar 48000'
      ])
      .save(outputAudioPath)
      .on('end', () => resolve())
      .on('error', (err: any) => { if (sourceType !== 'file') { try { fs.unlinkSync(inputVideoPath); } catch {} } reject(err); });
  });

  const audioBuffer = fs.readFileSync(outputAudioPath);
  if (sourceType !== 'file') try { fs.unlinkSync(inputVideoPath); } catch {}
  try { fs.unlinkSync(outputAudioPath); } catch {}
  return audioBuffer;
}

export async function extractAudioFromVideo(sourceType: 'file' | 'buffer' | 'url', video: Buffer | string): Promise<Buffer> {
  let inputVideoPath = getTempPath('mp4');
  const outputAudioPath = getTempPath('ogg');

  if (sourceType === 'file') {
    inputVideoPath = video as string;
  } else if (sourceType === 'buffer') {
    fs.writeFileSync(inputVideoPath, video as Buffer);
  } else {
    const { data } = await axios.get(video as string, { responseType: 'arraybuffer' });
    fs.writeFileSync(inputVideoPath, Buffer.from(data));
  }

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputVideoPath)
      .outputOptions([
        '-vn',
        '-c:a libopus',
        '-b:a 128k',
        '-vbr on',
        '-compression_level 10',
        '-application voip',
        '-ac 1',
        '-ar 48000'
      ])
      .save(outputAudioPath)
      .on('end', () => resolve())
      .on('error', (err: any) => { if (sourceType !== 'file') { try { fs.unlinkSync(inputVideoPath); } catch {} } reject(err); });
  });

  if (sourceType !== 'file') { try { fs.unlinkSync(inputVideoPath); } catch {} }
  const audioBuffer = fs.readFileSync(outputAudioPath);
  try { fs.unlinkSync(outputAudioPath); } catch {}
  return audioBuffer;
}

export async function convertVideoToWhatsApp(sourceType: 'buffer' | 'url', video: Buffer | string): Promise<Buffer> {
  const inputVideoPath = getTempPath('mp4');
  const outputVideoPath = getTempPath('mp4');

  if (sourceType === 'buffer') {
    fs.writeFileSync(inputVideoPath, video as Buffer);
  } else {
    const { data } = await axios.get(video as string, { responseType: 'arraybuffer' });
    fs.writeFileSync(inputVideoPath, Buffer.from(data));
  }

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputVideoPath)
      .outputOptions([
        '-c:v libx264', '-profile:v baseline', '-level 3.0', '-pix_fmt yuv420p',
        '-movflags faststart', '-crf 23', '-preset fast',
        '-c:a aac', '-b:a 128k', '-ar 44100', '-f mp4'
      ])
      .save(outputVideoPath)
      .on('end', () => resolve())
      .on('error', (err: any) => { try { fs.unlinkSync(inputVideoPath); } catch {} reject(err); });
  });

  const videoBuffer = fs.readFileSync(outputVideoPath);
  [inputVideoPath, outputVideoPath].forEach(p => { try { fs.unlinkSync(p); } catch {} });
  return videoBuffer;
}
