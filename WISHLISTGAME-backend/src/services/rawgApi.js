const RAWG_BASE_URL = "https://api.rawg.io/api";
const RAWG_API_KEY =
  process.env.RAWG_API_KEY || "75cb38f11eca4f4c99be23f77d4d12d7";

const buildUrl = (path, params) => {
  const url = new URL(`${RAWG_BASE_URL}${path}`);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

const rawgFetch = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message || "RAWG request failed");
    error.status = response.status;
    throw error;
  }
  return response.json();
};

export const fetchRawgGames = async ({ page, pageSize, search } = {}) => {
  const url = buildUrl("/games", {
    key: RAWG_API_KEY,
    page,
    page_size: pageSize,
    search,
  });
  return rawgFetch(url);
};

export const fetchRawgGameById = async (id) => {
  const url = buildUrl(`/games/${id}`, { key: RAWG_API_KEY });
  return rawgFetch(url);
};

export const mapRawgGameToSummary = (game) => ({
  id: game.id,
  title: game.name,
  genre: (game.genres || []).map((item) => item.name),
  releaseDate: game.released || null,
  urlPicture: game.background_image || null,
  rating: game.rating ?? null,
});

export const mapRawgGameToDetail = (game) => ({
  ...mapRawgGameToSummary(game),
  description: game.description_raw || null,
  platforms: game.platforms || [],
  esrbRating: game.esrb_rating || null,
  rawg: {
    slug: game.slug,
    tba: game.tba,
    metacritic: game.metacritic,
    playtime: game.playtime,
    updated: game.updated,
  },
});
