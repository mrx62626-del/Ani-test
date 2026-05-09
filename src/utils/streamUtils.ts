import type { StreamLink } from "../types/stream";
import type { Episode } from "../types/anime";

import { lunapaheService } from "../services/lunapaheService";

/**
 * Maps numerical quality to labels
 */
export const getMappedQuality = (
  q: string
): string => {

  const res = parseInt(q);

  if (res >= 1000) return "1080P";
  if (res >= 600) return "720P";

  return "360P";
};

/**
 * Fetches streams directly from LunaPahe
 */
export const getStreamData = async (
  episode: Episode,
  scraperSession: string
): Promise<StreamLink[]> => {

  try {

    const sources =
      await lunapaheService.getSources(
        scraperSession,
        episode.session
      );

    if (
      !Array.isArray(sources) ||
      sources.length === 0
    ) {
      return [];
    }

    const resolvedStreams =
      await Promise.all(

        sources.map(async (source: any) => {

          try {

            const m3u8 =
              await lunapaheService.resolveM3U8(
                source.url
              );

			
			console.log(
					  "[STREAM]",
					  {
						source,
						m3u8,
					  }
					);
					
            return {

  url:
    source.url
      ? `https://animepaheapi-k2b1.onrender.com/player?url=${encodeURIComponent(source.url)}`
      : undefined,

  directUrl:
    source.url,

  quality:
    source.quality || "720p",

  audio:
    source.audio || "sub",

  isHls: false,

  headers: {},

} as StreamLink;

          } catch (err) {

            console.error(
              "Failed to resolve stream",
              err
            );

            return null;
          }
        })
      );

    const filtered: StreamLink[] =
	  resolvedStreams.filter(
		Boolean
	  ) as StreamLink[];

    const scoreStream = (
      stream: StreamLink
    ) => {

      const quality =
        parseInt(
          String(stream.quality || "0"),
          10
        ) || 0;

      return quality;
    };

    const qualityMap =
      new Map<string, StreamLink>();

    const sorted =
      [...filtered].sort(
        (a, b) =>
          scoreStream(b) -
          scoreStream(a)
      );

    sorted.forEach((stream) => {

      const mapped =
        getMappedQuality(
          stream.quality
        );

      const audio =
        String(
          stream.audio || "sub"
        ).toLowerCase();

      const key =
        `${audio}:${mapped}`;

      if (!qualityMap.has(key)) {
        qualityMap.set(key, stream);
      }
    });

    return Array.from(
      qualityMap.values()
    );

  } catch (err) {

    console.error(
      "Failed to fetch streams",
      err
    );

    return [];
  }
};