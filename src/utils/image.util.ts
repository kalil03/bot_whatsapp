import axios, { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import crypto from 'crypto';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import { ImageUploadService } from 'node-upload-images';
// @ts-ignore
import getEmojiMixUrl, { checkSupported } from 'emoji-mixer';
import format from 'format-duration';

function getTempPath(ext: string): string {
  return path.join(os.tmpdir(), `botwa_img_${crypto.randomBytes(6).toString('hex')}.${ext}`);
}

function getRandomFilename(ext: string): string {
  return `${crypto.randomBytes(8).toString('hex')}.${ext}`;
}


export interface AnimeRecognition {
  initial_time: string;
  final_time: string;
  episode: number | null;
  title: string;
  similarity: number;
  preview_url: string;
}

export interface ImageSearch {
  url: string;
  preview?: any;
  [key: string]: any;
}


export async function uploadImage(imageBuffer: Buffer): Promise<string> {
  const service = new ImageUploadService('pixhost.to');
  const { directLink } = await service.uploadFromBinary(imageBuffer, getRandomFilename('png'));
  return directLink;
}


export function checkEmojiMixSupport(emoji1: string, emoji2: string) {
  return {
    emoji1: checkSupported(emoji1, true) ? true : false,
    emoji2: checkSupported(emoji2, true) ? true : false,
  };
}

export async function emojiMix(emoji1: string, emoji2: string): Promise<Buffer | null> {
  const url = getEmojiMixUrl(emoji1, emoji2, false, true);
  if (!url) return null;
  const { data } = await axios.get(url, { responseType: 'arraybuffer' });
  return data as Buffer;
}


export async function removeBackground(imageBuffer: Buffer): Promise<Buffer> {
  try {
    const URL_UPLOAD = 'https://download1.imageonline.co/ajax_upload_file.php';
    const URL_REMOVE = 'https://download1.imageonline.co/pngmaker.php';
    const uploadFileName = getRandomFilename('png');
    const formUpload = new FormData();
    formUpload.append('files', imageBuffer, { filename: uploadFileName });

    const configUpload: AxiosRequestConfig = {
      method: 'post', maxBodyLength: Infinity, url: URL_UPLOAD,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
        'Accept': '*/*', 'Origin': 'https://imageonline.co', 'Connection': 'keep-alive',
        'Referer': 'https://imageonline.co/', ...formUpload.getHeaders()
      },
      data: formUpload, responseType: 'json'
    };

    const { data: uploadRes } = await axios.request(configUpload);
    if (!uploadRes?.isSuccess) throw new Error('Upload falhou');

    const formRemove = new FormData();
    formRemove.append('name', uploadRes.files[0].name);
    formRemove.append('originalname', uploadRes.files[0].old_name);
    formRemove.append('option3', uploadRes.files[0].extension);
    formRemove.append('option4', '1');

    const { data: removeRes } = await axios.request({
      method: 'post', maxBodyLength: Infinity, url: URL_REMOVE,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
        'Accept': '*/*', 'Origin': 'https://imageonline.co', 'Connection': 'keep-alive', 'Referer': 'https://imageonline.co/'
      },
      data: formRemove
    });

    const [pictureUrl] = removeRes.match(/https:\/\/download1\.imageonline\.co\/download\.php\?filename=[A-Za-z0-9]+-imageonline\.co-[0-9]+\.png/m) ?? [];
    if (!pictureUrl) throw new Error('Não foi possível obter a imagem sem fundo');

    const { data: imgBuf } = await axios.get(pictureUrl, { responseType: 'arraybuffer' });
    return Buffer.from(imgBuf);
  } catch (e: any) {
    if (e.message?.includes('526') || e.message?.includes('socket') || e.code === 'ERR_BAD_REQUEST') {
      throw new Error('🔧 O site fornecedor da inteligência artificial (imageonline.co) está offline ou com problemas no servidor. Tente novamente mais tarde.');
    }
    throw new Error('❌ Falha ao tentar remover o fundo.');
  }
}


export async function animeRecognition(imageBuffer: Buffer): Promise<AnimeRecognition | null> {
  const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/jpeg' });
  const res = await fetch('https://api.trace.moe/search?anilistInfo', {
    method: 'POST', body: blob, headers: { 'Content-type': 'image/jpeg' }
  });

  if (!res.ok) return null;
  const { result } = await res.json();
  if (!result || !result.length) return null;

  const anime = result[0];
  return {
    initial_time: format(Math.round(anime.from * 1000)),
    final_time: format(Math.round(anime.to * 1000)),
    episode: anime.episode ?? null,
    title: anime.anilist.title.english || anime.anilist.title.romaji,
    similarity: parseInt((anime.similarity * 100).toFixed(2)),
    preview_url: anime.video,
  };
}


export async function imageSearchGoogle(text: string): Promise<ImageSearch[]> {
  const google = (await import('@victorsouzaleal/googlethis')).default;
  const images = await google.image(text, { safe: false, additional_params: { hl: 'pt' } });
  return images.filter((img: any) => img.url) as ImageSearch[];
}
