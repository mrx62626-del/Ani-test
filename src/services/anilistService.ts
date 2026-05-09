import type { Anime } from "../types/anime";
import { ANILIST_API } from "../config/api";

const sleep = (ms: number) =>
  new Promise((r) => setTimeout(r, ms));

const query = async (
  queryString: string,
  variables: Record<string, any> = {},
  retry = 0
) => {

  const response =
    await fetch(
      ANILIST_API,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        },

        body: JSON.stringify({
          query: queryString,
          variables,
        }),
      }
    );

  if (response.status === 429) {

    if (retry < 3) {

      await sleep(
        1500 * (retry + 1)
      );

      return query(
        String(query),
        variables,
        retry + 1
      );
    }

    throw new Error(
      "AniList rate limit exceeded"
    );
  }

  if (!response.ok) {

    const text =
      await response.text();

    console.error(
      "AniList Error:",
      text
    );

    throw new Error(
      `AniList request failed: ${response.status}`
    );
  }

  const json =
    await response.json();

  if (json.errors) {

    console.error(
      "GraphQL Errors:",
      json.errors
    );

    throw new Error(
      json.errors?.[0]?.message ||
      "AniList API Error"
    );
  }

  return json.data;
};

const mapAnime = (item: any): Anime => ({
  mal_id: item.idMal || item.id,
  id: item.id,

  title:
    item.title?.english ||
    item.title?.romaji ||
    item.title?.native ||
    "Unknown",

  title_english: item.title?.english,
  title_romaji: item.title?.romaji,
  title_japanese: item.title?.native,

  images: {
    jpg: {
      image_url: item.coverImage?.large || "",
      large_image_url:
        item.coverImage?.extraLarge ||
        item.coverImage?.large ||
        "",
    },
  },

  anilist_banner_image: item.bannerImage,
  anilist_cover_image:
    item.coverImage?.extraLarge ||
    item.coverImage?.large,

  synopsis:
    item.description?.replace(/<[^>]*>/g, "") || "",

  type: item.format || "TV",

  episodes: item.episodes || null,

  score: item.averageScore
    ? item.averageScore / 10
    : 0,

  status: item.status || "",

  genres:
    item.genres?.map((g: string) => ({
      mal_id: 0,
      name: g,
    })) || [],

  studios:
    item.studios?.nodes?.map((s: any) => ({
      mal_id: 0,
      name: s.name,
    })) || [],

  year: item.seasonYear,

  season: item.season?.toLowerCase(),

  aired: {
    from: item.startDate?.year
      ? `${item.startDate.year}-${item.startDate.month}-${item.startDate.day}`
      : undefined,
  },

  duration: item.duration
    ? `${item.duration} min`
    : undefined,

  latestEpisode: item.nextAiringEpisode
    ? item.nextAiringEpisode.episode - 1
    : item.episodes || 0,

  nextAiringEpisode: item.nextAiringEpisode
    ? {
        episode: item.nextAiringEpisode.episode,
        timeUntilAiring:
          item.nextAiringEpisode.timeUntilAiring,
      }
    : undefined,

  trailer: item.trailer
    ? {
        id: item.trailer.id,
        site: item.trailer.site,
        thumbnail: item.trailer.thumbnail,
      }
    : undefined,

  countryOfOrigin: item.countryOfOrigin,
});

export const anilistService = {
	
	async getLatestUpdates() {
  return this.getTrendingAnime(1, 18);
},

async getLatestUpdatesPage(page = 1) {
  return this.getTrendingAnime(page, 18);
},

async getPopularThisSeason(page = 1, perPage = 18) {
  return this.getTrendingAnime(page, perPage);
},

async getPopularThisMonth(page = 1, perPage = 18) {
  return this.getTrendingAnime(page, perPage);
},

async getTopAnime(page = 1, perPage = 18) {
  return this.getTrendingAnime(page, perPage);
},

peekTopAnime() {
  return null;
},

peekAnimeDetailsCache() {
  return null;
},

peekAnimeDetailsFastCache() {
  return null;
},

async getAnimeDetailsFast(id: number | string) {
  return this.getAnimeDetails(Number(id));
},

async getSpotlightAnime() {
  return this.getTrendingAnime(1, 10);
},

async getAnimeKaiTopTrending() {
	
	  return this.getTrendingAnime(1, 10);
	},

	async getHomeFastData() {
	  const trending = await this.getTrendingAnime(1, 10);

	  return {
		spotlightAnime: trending.data,
		latestUpdates: trending.data,
		trendingAnime: trending.data,
		popularSeason: trending.data,
		popularMonth: trending.data,
		topTenToday: trending.data,
		topTenWeek: trending.data,
		topTenMonth: trending.data,
		topAnime: trending.data,
		topAnimePagination: trending.pagination,
	  };
	},
	
  async getTrendingAnime(page = 1, perPage = 18) {
    const data = await query(
      `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            currentPage
            lastPage
            hasNextPage
          }

          media(
            sort: TRENDING_DESC
            type: ANIME
          ) {
            id
            idMal
            title {
              romaji
              english
              native
            }

            coverImage {
              large
              extraLarge
            }

            bannerImage

            description

            format
            episodes
            duration
            status
            season
            seasonYear
            averageScore
            genres

            studios(isMain: true) {
              nodes {
                name
              }
            }

            nextAiringEpisode {
              episode
              timeUntilAiring
            }
          }
        }
      }
      `,
      {
        page,
        perPage,
      }
    );

    return {
      data:
        data.Page.media.map(mapAnime),

      pagination: {
        current_page:
          data.Page.pageInfo.currentPage,

        last_visible_page:
          data.Page.pageInfo.lastPage,

        has_next_page:
          data.Page.pageInfo.hasNextPage,
      },
    };
  },

  async searchAnime(
    search: string,
    page = 1,
    perPage = 18
  ) {
    const data = await query(
      `
      query ($search: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            currentPage
            lastPage
            hasNextPage
          }

          media(
            search: $search
            type: ANIME
          ) {
            id
            idMal

            title {
              romaji
              english
              native
            }

            coverImage {
              large
              extraLarge
            }

            bannerImage

            format
            episodes
            status
            averageScore
          }
        }
      }
      `,
      {
        search,
        page,
        perPage,
      }
    );

    return {
      data:
        data.Page.media.map(mapAnime),

      pagination: {
        current_page:
          data.Page.pageInfo.currentPage,

        last_visible_page:
          data.Page.pageInfo.lastPage,

        has_next_page:
          data.Page.pageInfo.hasNextPage,
      },
    };
  },

  async getAnimeDetails(id: number) {
    const data = await query(
      `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          idMal

          title {
            romaji
            english
            native
          }

          coverImage {
            large
            extraLarge
          }

          bannerImage

          description(asHtml: false)

          format
          episodes
          duration
          status
          season
          seasonYear
          averageScore
          genres
          countryOfOrigin

          studios(isMain: true) {
            nodes {
              name
            }
          }

          nextAiringEpisode {
            episode
            timeUntilAiring
          }

          trailer {
            id
            site
            thumbnail
          }
        }
      }
      `,
      { id }
    );

    return {
      data: mapAnime(data.Media),
    };
  },
  async prefetchAZList() {
  return null;
},
async getGenres() {
  return [];
},
async getAiringSchedule() {
  return [];
},
};
