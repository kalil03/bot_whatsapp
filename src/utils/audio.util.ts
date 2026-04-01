import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../app/logger';
import os from 'os';
import crypto from 'crypto';
import axios, { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
// @ts-ignore
import tts from 'node-gtts';
import format from 'format-duration';
// @ts-ignore
import { fileTypeFromBuffer } from 'file-type';
import { extractAudioFromVideo, convertToOgg } from './convert.util';
import { aiService } from '../services/ai.service';

function getTempPath(ext: string): string {
  return path.join(os.tmpdir(), `botwa_aud_${crypto.randomBytes(6).toString('hex')}.${ext}`);
}

export type AudioModificationType = 'estourar' | 'x2' | 'reverso' | 'grave' | 'agudo' | 'volume';

export interface MusicRecognition {
  producer: string;
  duration: string;
  release_date: string;
  album: string;
  title: string;
  artists: string;
}

// ─── Transcrição de Áudio ──────────────────────────────────────────────────

export async function audioTranscription(audioBuffer: Buffer): Promise<string> {
  try {
    // Usa o Gemini do próprio usuário configurado no .env
    // É muito mais estável que buscar chaves públicas que o Vercel bloqueia
    return await aiService.transcribeAudio(audioBuffer);
  } catch (error) {
    logger.error({ err: error }, 'Erro na transcrição via Gemini');
    throw new Error('❌ Não foi possível transcrever o áudio no momento. Verifique sua chave API do Gemini ou tente novamente mais tarde.');
  }
}

// ─── Reconhecimento de Música ──────────────────────────────────────────────

export async function musicRecognition(mediaBuffer: Buffer, messageType: string): Promise<MusicRecognition | null> {
  const fileType = await fileTypeFromBuffer(mediaBuffer);
  if (!fileType) throw new Error('Tipo de arquivo não reconhecido.');

  let audioBuffer: Buffer;
  if (messageType === 'video' || messageType === 'file') {
    audioBuffer = await convertToOgg('buffer', mediaBuffer);
  } else {
    audioBuffer = mediaBuffer;
  }

  try {
    const { data: keysData } = await axios.get('https://dub.sh/lbot-api-keys', {
      responseType: 'json', timeout: 5000,
      headers: { 'User-Agent': 'BotWhatsapp/1.0' }
    });
    const keys = keysData?.acrcloud ?? [];

    for (const key of keys) {
      try {
        const ENDPOINT = '/v1/identify';
        const URL_BASE = `http://${key.host}${ENDPOINT}`;
        const timestamp = (Date.now() / 1000).toFixed(0);
        const signatureString = ['POST', ENDPOINT, key.access_key, 'audio', 1, timestamp].join('\n');
        const signature = crypto.createHmac('sha1', key.secret_key).update(Buffer.from(signatureString, 'utf-8')).digest().toString('base64');

        const formData = new FormData();
        formData.append('access_key', key.access_key);
        formData.append('data_type', 'audio');
        formData.append('sample', audioBuffer);
        formData.append('sample_bytes', audioBuffer.length);
        formData.append('signature_version', 1);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp);

        const { data: res } = await axios.request({ url: URL_BASE, method: 'POST', data: formData });

        if (res.status.code === 1001) return null;
        if (res.status.code === 3003 || res.status.code === 3015 || res.status.code === 3000) continue;

        const h = res.metadata.humming[0];
        const dateArr = h.release_date ? h.release_date.split('-') : [];
        return {
          producer: h.label || '-----',
          duration: format(h.duration_ms),
          release_date: dateArr.length ? `${dateArr[2]}/${dateArr[1]}/${dateArr[0]}` : '-----',
          album: h.album.name,
          title: h.title,
          artists: h.artists.map((a: { name: string }) => a.name).join(', ')
        };
      } catch { /* tenta próxima key */ }
    }
  } catch { /* sem keys */ }

  return null;
}

// ─── Texto para Voz ─────────────────────────────────────────────────────────

export async function textToVoice(lang: 'pt' | 'en' | 'ja' | 'es' | 'it' | 'ru' | 'ko' | 'sv', text: string): Promise<Buffer> {
  const audioPathMp3 = getTempPath('mp3');
  await new Promise<void>((resolve) => {
    tts(lang).save(audioPathMp3, text, () => resolve());
  });

  const audioPathOgg = getTempPath('ogg');
  await new Promise<void>((resolve, reject) => {
    ffmpeg(audioPathMp3)
      .outputOptions([
        '-c:a libopus',
        '-b:a 128k',
        '-vbr on',
        '-compression_level 10',
        '-application voip',
        '-ac 1',
        '-ar 48000'
      ])
      .save(audioPathOgg)
      .on('end', () => resolve())
      .on('error', (err: any) => reject(err));
  });

  const buffer = fs.readFileSync(audioPathOgg);
  try { fs.unlinkSync(audioPathMp3); } catch { }
  try { fs.unlinkSync(audioPathOgg); } catch { }
  return buffer;
}

// ─── Efeitos de Áudio ──────────────────────────────────────────────────────

export async function audioModified(audioBuffer: Buffer, type: AudioModificationType): Promise<Buffer> {
  const inputPath = getTempPath('mp3');
  const outputPath = getTempPath('ogg');

  const optionsMap: Record<AudioModificationType, string[]> = {
    estourar: ['-y', '-c:a', 'libopus', '-ac', '1', '-ar', '48000', '-filter_complex', 'acrusher=level_in=3:level_out=5:bits=10:mode=log:aa=1'],
    reverso: ['-y', '-c:a', 'libopus', '-ac', '1', '-ar', '48000', '-filter_complex', 'areverse'],
    grave: ['-y', '-c:a', 'libopus', '-ac', '1', '-ar', '48000', '-af', 'asetrate=44100*0.5,aresample=44100,atempo=1.20'],
    agudo: ['-y', '-c:a', 'libopus', '-ac', '1', '-ar', '48000', '-af', 'asetrate=44100*1.1,aresample=44100,atempo=0.70'],
    x2: ['-y', '-c:a', 'libopus', '-ac', '1', '-ar', '48000', '-filter:a', 'atempo=2.0', '-vn'],
    volume: ['-y', '-c:a', 'libopus', '-ac', '1', '-ar', '48000', '-filter:a', 'volume=4.0'],
  };

  fs.writeFileSync(inputPath, audioBuffer);

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(optionsMap[type])
      .save(outputPath)
      .on('end', () => resolve())
      .on('error', (err: any) => { try { fs.unlinkSync(inputPath); } catch { } reject(err); });
  });

  const result = fs.readFileSync(outputPath);
  [inputPath, outputPath].forEach(p => { try { fs.unlinkSync(p); } catch { } });
  return result;
}
