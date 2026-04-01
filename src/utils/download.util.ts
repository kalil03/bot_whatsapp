import { instagramGetUrl } from 'instagram-url-direct';
import { getFbVideoInfo } from 'fb-downloader-scrapper';
import Tiktok from '@tobyg74/tiktok-api-dl';
import axios from 'axios';
import yts from 'yt-search';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { logger } from '../app/logger';

// ─── Tipos ─────────────────────────────────────────────────────────────────

export interface YTInfo {
  id_video: string;
  title: string;
  description: string;
  duration: number;
  channel: string;
  is_live: boolean;
  duration_formatted: string;
  url: string;
  file_path: string;
}

export interface FacebookMedia {
  url: string;
  duration: number;
  sd: string;
  hd: string;
  title: string;
  thumbnail: string;
}

export interface InstagramMedia {
  author_username: string;
  author_fullname: string;
  caption: string;
  likes: number;
  media: { type: 'image' | 'video'; url: string }[];
}

export interface TiktokMedia {
  author_profile: string;
  description: string;
  type: 'video' | 'image';
  duration: number | null;
  url: string | string[];
}

export interface XMedia {
  text: string;
  media: { type: 'image' | 'video'; url: string }[];
}

export interface ImageSearch {
  url: string;
  [key: string]: any;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

// Cookies do YouTube para evitar restrições
const YT_COOKIES = [
  {
    name: 'cookie1',
    value:
      'GPS=1; YSC=CkypMSpfgiI; VISITOR_INFO1_LIVE=4nF8vxPW1gU; VISITOR_PRIVACY_METADATA=CgJCUhIEGgAgZA%3D%3D; PREF=f6=40000000&tz=America.Sao_Paulo;' +
      'SID=g.a000lggw9yBHfdDri-OHg79Bkk2t6L2X7cbwK7jv8BYZZa4Q1hDbH4SZC5IHPqi_QBmSiigPHAACgYKAYgSARASFQHGX2Mi3N21zLYOMAku61_CaeccrxoVAUF8yKo3X97N4REFyHP4du4RIo1b0076;' +
      '__Secure-1PSIDTS=sidts-CjIB3EgAEmNr03Tidygwml9aTrgDf0woi14K6jndMv5Ox5uI22tYDMNEYiaAoEF0KjGYgRAA; __Secure-3PSIDTS=sidts-CjIB3EgAEmNr03Tidygwml9aTrgDf0woi14K6jndMv5Ox5uI22tYDMNEYiaAoEF0KjGYgRAA;' +
      '__Secure-1PSID=g.a000lggw9yBHfdDri-OHg79Bkk2t6L2X7cbwK7jv8BYZZa4Q1hDbYpnHl6jq9y45aoBaqMd96QACgYKAR4SARASFQHGX2MiqFuOgRtuIS_FKmulaCrckxoVAUF8yKpX5r8ISh5S5eQ4eofBuyCg0076;' +
      '__Secure-3PSID=g.a000lggw9yBHfdDri-OHg79Bkk2t6L2X7cbwK7jv8BYZZa4Q1hDb_8Q3teG8nn23ceeF8jiOvwACgYKAY0SARASFQHGX2MiwBtnenbu4CRMpjQza-asfhoVAUF8yKoFXx_Zxl4MvxGnWSSsnv1z0076;' +
      'HSID=AWgIQn3iifuaU_eRW; SSID=AR8Jlj2XTnPAmL5kf; APISID=l6PTqM9Dy8G_2E6P/A-sAusHOyG1pQ3T75; SAPISID=OSmwE6VjdFmB1u5-/A2N-7DiRQUreUSpgT; __Secure-1PAPISID=OSmwE6VjdFmB1u5-/A2N-7DiRQUreUSpgT;' +
      '__Secure-3PAPISID=OSmwE6VjdFmB1u5-/A2N-7DiRQUreUSpgT; SIDCC=AKEyXzXkXTftuhPOtObUSCLHxp1byOAtlesMkptSGp8hyE3d97Dvy2UHd4-2ePWBpzUbQhV6; __Secure-1PSIDCC=AKEyXzXlrhkCIONPS4jCvhmtFb8nAKr8fEFCCFEFqN8BKyrw8tKHFh3-r8EWjrqjAKH9Z9fq0A; __Secure-3PSIDCC=AKEyXzWLIbNbh8dxdyKhTafkyKIbEBwVKGR4lNRhhYX5u_v1k4vBnu4eAS9lgpP-JK2PgiSDJw'
  }
];

// ─── Download Functions ─────────────────────────────────────────────────────

export async function xMedia(url: string): Promise<XMedia | null> {
  try {
    const newURL = url.replace(/twitter\.com|x\.com/g, 'api.vxtwitter.com');
    const { data } = await axios.get(newURL);
    if (!data.media_extended) return null;
    return {
      text: data.text,
      media: data.media_extended.map((m: { type: string; url: string }) => ({
        type: m.type === 'video' ? 'video' : 'image',
        url: m.url,
      })),
    };
  } catch {
    return null;
  }
}

export async function tiktokMedia(url: string): Promise<TiktokMedia | null> {
  try {
    const res = await Tiktok.Downloader(url, { version: 'v1' });
    if (res.status === 'error') return null;

    let mediaUrl: string | string[];
    if (res.result?.type === 'video') {
      if (!res.result?.video?.playAddr?.length) return null;
      mediaUrl = res.result.video.playAddr[0];
    } else if (res.result?.type === 'image') {
      if (!res.result?.images) return null;
      mediaUrl = res.result.images;
    } else {
      return null;
    }

    return {
      author_profile: res.result?.author?.nickname ?? '',
      description: res.result?.desc ?? '',
      type: res.result?.type as 'video' | 'image',
      duration: res.result?.type === 'video' ? parseInt(((res.result?.video?.duration as number) / 1000).toFixed(0)) : null,
      url: mediaUrl,
    };
  } catch {
    return null;
  }
}

export async function facebookMedia(url: string): Promise<FacebookMedia> {
  const res = await getFbVideoInfo(url);
  return {
    url: res.url,
    duration: parseInt((res.duration_ms / 1000).toFixed(0)),
    sd: res.sd,
    hd: res.hd,
    title: res.title,
    thumbnail: res.thumbnail,
  };
}

export async function instagramMedia(url: string): Promise<InstagramMedia> {
  const res = await instagramGetUrl(url);
  const media: InstagramMedia['media'] = [];

  for (const u of res.url_list) {
    const { headers } = await axios.head(u);
    const type = headers['content-type'] === 'video/mp4' ? 'video' : 'image';
    media.push({ type, url: u });
  }

  return {
    author_username: res.post_info.owner_username,
    author_fullname: res.post_info.owner_fullname,
    caption: res.post_info.caption,
    likes: res.post_info.likes,
    media,
  };
}

export async function youtubeMedia(text: string): Promise<YTInfo | null> {
  try {
    const isURL = /https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(text);
    const query = isURL ? text : `ytsearch1:${text}`;
    
    // Procura o yt-dlp no bin local ou no PATH do sistema (Docker)
    const localYtDlp = path.join(process.cwd(), 'bin', 'yt-dlp');
    const ytDlpPath = fs.existsSync(localYtDlp) ? localYtDlp : 'yt-dlp';
    
    const nodePath = process.execPath;

    // Executa yt-dlp para pegar metadados e URL de stream em MP4
    const { stdout } = await execAsync(`${ytDlpPath} --js-runtimes "${nodePath}" "${query}" --print "%(id)s|%(title)s|%(duration)s|%(uploader)s|%(live_status)s|%(url)s" -f "best[ext=mp4]/best" --no-playlist`);
    const lines = stdout.trim().split('\n');
    const lastLine = lines[lines.length - 1]; // Pega a última linha caso haja avisos acima
    
    const [id, title, duration, channel, liveStatus, url] = lastLine.split('|');
    if (!id || !url) return null;

    // Bufferiza o vídeo para evitar 403 do Axios (usando o yt-dlp para baixar também se necessário)
    const tempPath = path.join(os.tmpdir(), `ytdl_${crypto.randomBytes(6).toString('hex')}.mp4`);
    await execAsync(`${ytDlpPath} --js-runtimes "${nodePath}" "${id}" -o "${tempPath}" -f "best[ext=mp4]/best" --max-filesize 50M`);

    return {
      id_video: id,
      title: title || 'YouTube Video',
      description: '',
      duration: Number(duration) || 0,
      channel: channel || 'Unknown',
      is_live: liveStatus === 'is_live',
      duration_formatted: formatSeconds(Number(duration) || 0),
      url: url,
      file_path: tempPath
    };
  } catch (error) {
    logger.error({ err: error }, 'Erro ao processar youtube via yt-dlp');
    return null;
  }
}

export async function imageSearchGoogle(text: string): Promise<ImageSearch[]> {
  try {
    const google = (await import('@victorsouzaleal/googlethis')).default;
    const images = await google.image(text, { safe: false, additional_params: { hl: 'pt' } });
    return images.filter((img: any) => img.url) as ImageSearch[];
  } catch {
    return [];
  }
}
