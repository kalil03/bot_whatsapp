import { config } from '../app/config';
import { logger } from '../app/logger';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class MusicService {
  private static accessToken: string | null = null;
  private static tokenExpiry: number = 0;

  private static async getAccessToken(): Promise<string | null> {
    if (!config.SPOTIFY_CLIENT_ID || !config.SPOTIFY_CLIENT_SECRET) {
      return null;
    }

    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(`${config.SPOTIFY_CLIENT_ID}:${config.SPOTIFY_CLIENT_SECRET}`).toString('base64');
      
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error(`Spotify Auth failed: ${response.statusText}`);
      }

      const data = await response.json() as SpotifyTokenResponse;
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
      
      return this.accessToken;
    } catch (error) {
      logger.error({ err: error }, 'Erro ao obter token do Spotify');
      return null;
    }
  }

  static async searchTrack(query: string) {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('Spotify API não configurada ou erro no Auth.');
    }

    try {
      const searchUrl = new URL('https://api.spotify.com/v1/search');
      searchUrl.searchParams.append('q', query);
      searchUrl.searchParams.append('type', 'track');
      searchUrl.searchParams.append('limit', '1');

      const response = await fetch(searchUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Spotify Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      const track = data.tracks?.items?.[0];

      if (!track) return null;

      return {
        name: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        album: track.album.name,
        url: track.external_urls.spotify
      };
    } catch (error) {
      logger.error({ err: error }, 'Erro ao buscar no Spotify');
      throw error;
    }
  }
}
