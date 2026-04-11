import axios from 'axios';
import moment from 'moment-timezone';
import Fuse from 'fuse.js';
import { JSDOM } from 'jsdom';
import UserAgent from 'user-agents';
import { translate } from '@vitalets/google-translate-api';
import { Client } from 'genius-lyrics';
import qs from 'querystring';
import { obterDadosBrasileiraoA, obterDadosBrasileiraoB } from './brasileirao.util';


export interface News { title: string; published: string; author: string; url: string }
export interface WebSearch { title: string; url: string; description: string }
export interface AnimeRelease { name: string; episode: string; url: string }
export interface MangaRelease { name: string; chapter: string; url: string }
export interface SearchGame { title: string; uploader: string; uploadDate: string; fileSize: string; uris: string[] }
export interface MusicLyrics { title: string; artist: string; image: string; lyrics: string }
export interface CurrencyConvert {
  value: number; currency: string;
  convertion: { currency: string; convertion_name: string; value_converted: string; value_converted_formatted: string; updated: string }[]
}
export interface WeatherInfo {
  location: { name: string; region: string; country: string; current_time: string };
  current: { last_updated: string; temp: string; feelslike: string; condition: string; wind: string; humidity: string; cloud: string };
  forecast: { day: string; max: string; min: string; avg: string; condition: string; max_wind: string; rain: string; chance_rain: string; snow: string; chance_snow: string; uv: number }[]
}

function timestampToDate(ts: number): string {
  return moment(ts).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
}

export async function animeReleases(): Promise<AnimeRelease[]> {
  const { data } = await axios.get('https://animedays.org/', { headers: { 'User-Agent': new UserAgent().toString() } });
  const { window: { document } } = new JSDOM(data);
  const $animes = document.querySelectorAll('div.postbody > div:nth-child(2) > div.listupd.normal > div.excstf > article > div');
  const animes: AnimeRelease[] = [];

  for (const $anime of $animes) {
    let name = $anime.querySelector('a > div.tt > h2')?.innerHTML;
    const episode = $anime.querySelector('a > div.limit > div.bt > span.epx')?.innerHTML;
    const url = ($anime.querySelector('a') as HTMLAnchorElement)?.href;
    if (!name || !episode || !url) continue;
    name = name.split('Episódio')[0];
    animes.push({ name, episode, url });
  }

  return animes;
}

export async function mangaReleases(): Promise<MangaRelease[]> {
  const { data } = await axios.get('https://mangabr.net/', { headers: { 'User-Agent': new UserAgent().toString() } });
  const { window: { document } } = new JSDOM(data);
  const $mangas = document.querySelectorAll('div.col-6.col-sm-3.col-md-3.col-lg-2.p-1');
  const mangas: MangaRelease[] = [];

  for (const $manga of $mangas) {
    const name = $manga.querySelector('h3.chapter-title > span.series-name')?.innerHTML.trim();
    const chapter = $manga.querySelector('h3.chapter-title > span.chapter-name')?.innerHTML.trim();
    const url = `https://mangabr.net${$manga.querySelector('a.link-chapter')?.getAttribute('href')}`;
    if (!name || !chapter) continue;
    mangas.push({ name, chapter, url });
  }

  return mangas;
}

export async function brasileiraoTable(serie: 'A' | 'B') {
  if (serie === 'A') return obterDadosBrasileiraoA();
  return obterDadosBrasileiraoB();
}

export async function moviedbTrendings(type: 'movie' | 'tv' = 'movie'): Promise<string> {
  let num = 0;
  const { data } = await axios.get(`https://api.themoviedb.org/3/trending/${type}/day?api_key=6618ac868ff51ffa77d586ee89223f49&language=pt-BR`);
  return data.results.map((item: { title: string; name: string; overview: string }) => {
    num++;
    return `${num}°: *${item.title || item.name}.*\n\`Sinopse:\` ${item.overview} \n`;
  }).join('\n');
}

export async function calcExpression(expr: string): Promise<string | null> {
  expr = expr.replace(/[Xx\xD7]/g, '*').replace(/\xF7/g, '/').replace(/,/g, '.').replace('em', 'in');
  const { data } = await axios.post('https://api.mathjs.org/v4/', { expr });
  const result = data.result;
  if (result === 'NaN' || result === 'Infinity') return null;
  return result as string;
}

export async function newsGoogle(lang = 'pt-BR'): Promise<News[]> {
  const google = (await import('@victorsouzaleal/googlethis')).default;
  const newsList = await google.getTopNews(lang);
  return newsList.headline_stories.map((news: any) => ({
    title: news.title,
    published: news.published,
    author: news.by,
    url: news.url,
  }));
}

export async function translationGoogle(text: string, lang: 'pt' | 'es' | 'en' | 'ja' | 'it' | 'ru' | 'ko'): Promise<string> {
  const res = await translate(text, { to: lang });
  return res.text;
}

export async function shortenUrl(url: string): Promise<string | null> {
  try {
    const { data } = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    return data || null;
  } catch {
    return null;
  }
}

export async function webSearchGoogle(texto: string): Promise<WebSearch[]> {
  try {
    const { data } = await axios.get(`https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(texto)}&utf8=&format=json`, {
      headers: { 'User-Agent': 'BotWhatsapp/1.0' }
    });

    if (!data?.query?.search) return [];

    return data.query.search.map((r: any) => ({
      title: r.title,
      url: `https://pt.wikipedia.org/wiki/${encodeURIComponent(r.title)}`,
      description: r.snippet.replace(/<[^>]*>?/gm, '')
    }));
  } catch {
    return [];
  }
}

export async function wheatherInfo(location: string): Promise<WeatherInfo> {
  let searchLocation = location;
  
  // Valida se é no Brasil
  if (!location.includes(',') && !location.includes(' ')) {
    try {
      const { data: searchResults } = await axios.get(`http://api.weatherapi.com/v1/search.json?key=516f58a20b6c4ad3986123104242805&q=${encodeURIComponent(location)}`);
      if (searchResults && searchResults.length > 0) {
        // Busca resultado no Brasil
        const brResult = searchResults.find((r: any) => r.country.toLowerCase().includes('brazil') || r.country.toLowerCase().includes('brasil'));
        if (brResult) {
          searchLocation = `${brResult.name}, ${brResult.region}, Brazil`;
        } else {
          searchLocation = `${searchResults[0].name}, ${searchResults[0].region}, ${searchResults[0].country}`;
        }
      }
    } catch {
      // Continua com localização original
    }
  }

  const { data: wr } = await axios.get(`http://api.weatherapi.com/v1/forecast.json?key=516f58a20b6c4ad3986123104242805&q=${encodeURIComponent(searchLocation)}&days=3&aqi=no&alerts=no&lang=pt`);
  const { data: wc } = await axios.get('https://www.weatherapi.com/docs/conditions.json', { responseType: 'json' });

  const findConditionPt = (code: number, isDay: boolean) => {
    const cond = wc.find((c: any) => c.code === code)?.languages?.find((l: any) => l.lang_iso === 'pt');
    return isDay ? cond?.day_text : cond?.night_text;
  };

  const result: WeatherInfo = {
    location: {
      name: wr.location.name, region: wr.location.region, country: wr.location.country,
      current_time: timestampToDate(wr.location.localtime_epoch * 1000)
    },
    current: {
      last_updated: timestampToDate(wr.current.last_updated_epoch * 1000),
      temp: `${wr.current.temp_c} C°`, feelslike: `${wr.current.feelslike_c} C°`,
      condition: findConditionPt(wr.current.condition.code, !!wr.current.is_day),
      wind: `${wr.current.wind_kph} Km/h`, humidity: `${wr.current.humidity} %`, cloud: `${wr.current.cloud} %`
    },
    forecast: []
  };

  for (const fd of wr.forecast.forecastday) {
    const [year, month, day] = fd.date.split('-');
    const cond = findConditionPt(fd.day.condition.code, true);
    result.forecast.push({
      day: `${day}/${month}/${year}`, max: `${fd.day.maxtemp_c} C°`, min: `${fd.day.mintemp_c} C°`,
      avg: `${fd.day.avgtemp_c} C°`, condition: cond, max_wind: `${fd.day.maxwind_kph} Km/h`,
      rain: fd.day.daily_will_it_rain ? 'Sim' : 'Não', chance_rain: `${fd.day.daily_chance_of_rain} %`,
      snow: fd.day.daily_will_it_snow ? 'Sim' : 'Não', chance_snow: `${fd.day.daily_chance_of_snow} %`,
      uv: fd.day.uv
    });
  }

  return result;
}

export async function musicLyrics(text: string): Promise<MusicLyrics | null> {
  const client = new Client();
  const results = await client.songs.search(text).catch((e: any) => {
    if (e.message === 'No result was found') return null;
    throw e;
  });
  if (!results || !results.length) return null;
  return {
    title: results[0].title, artist: results[0].artist.name,
    image: results[0].artist.image, lyrics: await results[0].lyrics()
  };
}

export async function convertCurrency(currency: 'dolar' | 'euro' | 'real' | 'iene', value: number): Promise<CurrencyConvert> {
  const params: Record<string, string> = {
    dolar: 'USD-BRL,USD-EUR,USD-JPY', euro: 'EUR-BRL,EUR-USD,EUR-JPY',
    iene: 'JPY-BRL,JPY-USD,JPY-EUR', real: 'BRL-USD,BRL-EUR,BRL-JPY'
  };
  const { data } = await axios.get(`https://economia.awesomeapi.com.br/json/last/${params[currency]}`);

  const result: CurrencyConvert = { value, currency, convertion: [] };
  const names: Record<string, [string, string]> = {
    BRL: ['Real', 'R$'], EUR: ['Euro', 'Є'], USD: ['Dólar', '$'], JPY: ['Iene', '¥']
  };

  for (const key in data) {
    const item = data[key];
    const [currencyType, currencySymbol] = names[item.codein] ?? [item.codein, ''];
    const [d] = item.create_date.split(' ');
    const [yr, mo, dy] = d.split('-');
    const hr = item.create_date.split(' ')[1];
    result.convertion.push({
      currency: currencyType, convertion_name: item.name,
      value_converted: (item.bid * value).toFixed(2),
      value_converted_formatted: `${currencySymbol} ${(item.bid * value).toFixed(2)}`,
      updated: `${dy}/${mo}/${yr} às ${hr}`
    });
  }

  return result;
}

export async function infoDDD(ddd: string): Promise<{ state: string; region: string } | null> {
  const { data } = await axios.get('https://gist.githubusercontent.com/victorsouzaleal/ea89a42a9f912c988bbc12c1f3c2d110/raw/af37319b023503be780bb1b6a02c92bcba9e50cc/ddd.json');
  const idx = data.estados.findIndex((s: any) => s.ddd.includes(ddd));
  if (idx === -1) return null;
  return { state: data.estados[idx].nome, region: data.estados[idx].regiao };
}

export async function symbolsASCI(): Promise<string> {
  const { data } = await axios.get('https://gist.githubusercontent.com/victorsouzaleal/9a58a572233167587e11683aa3544c8a/raw/aea5d03d251359b61771ec87cb513360d9721b8b/tabela.txt');
  return data as string;
}

export async function searchGame(gameTitle: string): Promise<SearchGame[]> {
  const LIBRARIES = [
    'https://hydralinks.cloud/sources/fitgirl.json',
    'https://hydralinks.cloud/sources/dodi.json',
    'https://hydralinks.cloud/sources/kaoskrew.json',
    'https://hydralinks.cloud/sources/onlinefix.json',
    'https://hydralinks.cloud/sources/steamrip.json',
    'https://hydralinks.cloud/sources/atop-games.json'
  ];

  const gamesList: SearchGame[] = [];
  for (const lib of LIBRARIES) {
    try {
      const { data } = await axios.get(lib, { responseType: 'json' });
      for (const game of data.downloads) {
        gamesList.push({ uploader: data.name, ...game });
      }
    } catch { /* ignora biblioteca inacessível */ }
  }

  const fuse = new Fuse(gamesList, { ignoreLocation: true, keys: ['title'], threshold: 0.1 });
  const results = fuse.search(gameTitle).map(r => r.item);
  results.forEach(r => { r.uploadDate = moment(r.uploadDate).format('DD/MM/YYYY'); });
  return results;
}

export async function funnyRandomPhrases(): Promise<string> {
  const { data } = await axios.get('https://gist.githubusercontent.com/victorsouzaleal/bfbafb665a35436acc2310d51d754abb/raw/2be5f3b5333b2a9c97492888ed8e63b7c7675ae6/frases.json');
  let phrase = data.frases[Math.floor(Math.random() * data.frases.length)];
  let cont = 1;
  if (phrase.includes('{p3}')) cont = 3;
  else if (phrase.includes('{p2}')) cont = 2;
  for (let i = 1; i <= cont; i++) {
    const comp = data.complementos[Math.floor(Math.random() * data.complementos.length)];
    phrase = phrase.replace(`{p${i}}`, `*${comp}*`);
    data.complementos.splice(data.complementos.indexOf(comp, 1));
  }
  return phrase;
}
