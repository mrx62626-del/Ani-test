import { LUNAPAHE_API } from "../config/api";
import type { Episode } from "../types/anime";

export interface AnimePaheAnime {
  id: number;
  title: string;
  poster: string;
  session: string;
  year?: number;
  type?: string;
}

export interface StreamSource {
  url: string;
  quality: string;
  audio?: string;
  fansub?: string;
}

const request = async (endpoint: string) => {
  const res = await fetch(
    `${LUNAPAHE_API}${endpoint}`
  );

  if (!res.ok) {
    throw new Error(
      `LunaPahe API Error: ${res.status}`
    );
  }

  return res.json();
};

export const lunapaheService = {
  async searchAnime(query: string) {
    const data = await request(
      `/search?q=${encodeURIComponent(query)}`
    );

    return Array.isArray(data)
      ? data
      : [];
  },

  async getEpisodes(
    session: string
  ): Promise<{ episodes: Episode[] }> {
    const data = await request(
      `/episodes?session=${session}`
    );

    const episodes: Episode[] =
      Array.isArray(data)
        ? data.map((ep: any) => ({
            session: ep.session,
            episodeNumber: String(
              ep.number
            ),
            title: ep.title,
            snapshot: ep.snapshot,
          }))
        : [];

    return {
      episodes,
    };
  },

  async getSources(
    animeSession: string,
    episodeSession: string
  ): Promise<StreamSource[]> {
    const data = await request(
      `/sources?anime_session=${animeSession}&episode_session=${episodeSession}`
    );

    return Array.isArray(data)
      ? data
      : [];
  },

  async resolveM3U8(url: string) {
    return request(
      `/m3u8?url=${encodeURIComponent(url)}`
    );
  },
};