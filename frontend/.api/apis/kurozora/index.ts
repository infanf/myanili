import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    // @ts-ignore
    this.core = new APICore(this.spec, 'kurozora/1.4.0 (api/6.1.1)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * This endpoint will retrieve the explore page.
   *
   * @summary (optional authentication) Explore page.
   * @throws FetchError<400, types.GetExploreResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetExploreResponse403> Authentication error JSON response
   */
  getExplore(metadata?: types.GetExploreMetadataParam): Promise<FetchResponse<200, types.GetExploreResponse200>> {
    return this.core.fetch('/explore', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the details to for the explore category.
   *
   * @summary (optional authentication) Explore category details.
   * @throws FetchError<400, types.GetExploreDetailsResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetExploreDetailsResponse403> Authentication error JSON response
   */
  getExploreDetails(metadata: types.GetExploreDetailsMetadataParam): Promise<FetchResponse<200, types.GetExploreDetailsResponse200>> {
    return this.core.fetch('/explore/{exploreCategoryID}', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the details of an Anime item.
   *
   * @summary (optional authentication) Anime details.
   * @throws FetchError<400, types.GetAnimeResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetAnimeResponse403> Authentication error JSON response
   */
  getAnime(metadata: types.GetAnimeMetadataParam): Promise<FetchResponse<200, types.GetAnimeResponse200>> {
    return this.core.fetch('/anime/{animeID}', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the casts of an Anime item.
   *
   * @summary Anime cast information.
   * @throws FetchError<400, types.GetAnimeCastResponse400> Error Kurozora JSON response
   */
  getAnimeCast(metadata: types.GetAnimeCastMetadataParam): Promise<FetchResponse<200, types.GetAnimeCastResponse200>> {
    return this.core.fetch('/anime/{animeID}/cast', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the characters of an Anime item.
   *
   * @summary Anime character information.
   * @throws FetchError<400, types.GetAnimeCharactersResponse400> Error Kurozora JSON response
   */
  getAnimeCharacters(metadata: types.GetAnimeCharactersMetadataParam): Promise<FetchResponse<200, types.GetAnimeCharactersResponse200>> {
    return this.core.fetch('/anime/{animeID}/characters', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the related-shows of an Anime item.
   *
   * @summary Anime related-shows information.
   * @throws FetchError<400, types.GetAnimeRelatedShowsResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetAnimeRelatedShowsResponse403> Authentication error JSON response
   */
  getAnimeRelatedShows(metadata: types.GetAnimeRelatedShowsMetadataParam): Promise<FetchResponse<200, types.GetAnimeRelatedShowsResponse200>> {
    return this.core.fetch('/anime/{animeID}/related-shows', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the related-literatures of an Anime item.
   *
   * @summary Anime related-literatures information.
   * @throws FetchError<400, types.GetAnimeRelatedLiteraturesResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetAnimeRelatedLiteraturesResponse403> Authentication error JSON response
   */
  getAnimeRelatedLiteratures(metadata: types.GetAnimeRelatedLiteraturesMetadataParam): Promise<FetchResponse<200, types.GetAnimeRelatedLiteraturesResponse200>> {
    return this.core.fetch('/anime/{animeID}/related-literatures', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the related-games of an Anime item.
   *
   * @summary Anime related-games information.
   * @throws FetchError<400, types.GetAnimeRelatedGamesResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetAnimeRelatedGamesResponse403> Authentication error JSON response
   */
  getAnimeRelatedGames(metadata: types.GetAnimeRelatedGamesMetadataParam): Promise<FetchResponse<200, types.GetAnimeRelatedGamesResponse200>> {
    return this.core.fetch('/anime/{animeID}/related-games', 'get', metadata);
  }

  /**
   * This endpoint will allow user's to leave a rating for an Anime.
   *
   * @summary Rate an Anime.
   * @throws FetchError<400, types.PostAnimeRateResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostAnimeRateResponse403> Authentication error JSON response
   */
  postAnimeRate(body: types.PostAnimeRateFormDataParam, metadata: types.PostAnimeRateMetadataParam): Promise<FetchResponse<200, types.PostAnimeRateResponse200>> {
    return this.core.fetch('/anime/{animeID}/rate', 'post', body, metadata);
  }

  /**
   * This endpoint will retrieve the seasons of an Anime item.
   *
   * @summary Anime all seasons information.
   * @throws FetchError<400, types.GetSeasonsResponse400> Error Kurozora JSON response
   */
  getSeasons(metadata: types.GetSeasonsMetadataParam): Promise<FetchResponse<200, types.GetSeasonsResponse200>> {
    return this.core.fetch('/anime/{animeID}/seasons', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the staff of an Anime item.
   *
   * @summary Anime staff information.
   * @throws FetchError<400, types.GetAnimeStaffResponse400> Error Kurozora JSON response
   */
  getAnimeStaff(metadata: types.GetAnimeStaffMetadataParam): Promise<FetchResponse<200, types.GetAnimeStaffResponse200>> {
    return this.core.fetch('/anime/{animeID}/staff', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the studios of an Anime item.
   *
   * @summary Anime studio information.
   * @throws FetchError<400, types.GetAnimeStudiosResponse400> Error Kurozora JSON response
   */
  getAnimeStudios(metadata: types.GetAnimeStudiosMetadataParam): Promise<FetchResponse<200, types.GetAnimeStudiosResponse200>> {
    return this.core.fetch('/anime/{animeID}/studios', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the upcoming Anime items.
   *
   * @summary Upcoming anime information.
   * @throws FetchError<400, types.GetAnimeUpcomingResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetAnimeUpcomingResponse403> Authentication error JSON response
   */
  getAnimeUpcoming(metadata?: types.GetAnimeUpcomingMetadataParam): Promise<FetchResponse<200, types.GetAnimeUpcomingResponse200>> {
    return this.core.fetch('/anime/upcoming', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the details of an Game item.
   *
   * @summary (optional authentication) Game details.
   * @throws FetchError<400, types.GetGameResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetGameResponse403> Authentication error JSON response
   */
  getGame(metadata: types.GetGameMetadataParam): Promise<FetchResponse<200, types.GetGameResponse200>> {
    return this.core.fetch('/games/{gameID}', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the casts of an Game item.
   *
   * @summary Game cast information.
   * @throws FetchError<400, types.GetGameCastResponse400> Error Kurozora JSON response
   */
  getGameCast(metadata: types.GetGameCastMetadataParam): Promise<FetchResponse<200, types.GetGameCastResponse200>> {
    return this.core.fetch('/games/{gameID}/cast', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the characters of an Game item.
   *
   * @summary Game character information.
   * @throws FetchError<400, types.GetGameCharactersResponse400> Error Kurozora JSON response
   */
  getGameCharacters(metadata: types.GetGameCharactersMetadataParam): Promise<FetchResponse<200, types.GetGameCharactersResponse200>> {
    return this.core.fetch('/games/{gameID}/characters', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the related-shows of an Game item.
   *
   * @summary Game related-shows information.
   * @throws FetchError<400, types.GetGameRelatedShowsResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetGameRelatedShowsResponse403> Authentication error JSON response
   */
  getGameRelatedShows(metadata: types.GetGameRelatedShowsMetadataParam): Promise<FetchResponse<200, types.GetGameRelatedShowsResponse200>> {
    return this.core.fetch('/games/{gameID}/related-shows', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the related-literatures of an Game item.
   *
   * @summary Game related-literatures information.
   * @throws FetchError<400, types.GetGameRelatedLiteraturesResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetGameRelatedLiteraturesResponse403> Authentication error JSON response
   */
  getGameRelatedLiteratures(metadata: types.GetGameRelatedLiteraturesMetadataParam): Promise<FetchResponse<200, types.GetGameRelatedLiteraturesResponse200>> {
    return this.core.fetch('/games/{gameID}/related-literatures', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the related-games of an Game item.
   *
   * @summary Game related-games information.
   * @throws FetchError<400, types.GetGameRelatedGamesResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetGameRelatedGamesResponse403> Authentication error JSON response
   */
  getGameRelatedGames(metadata: types.GetGameRelatedGamesMetadataParam): Promise<FetchResponse<200, types.GetGameRelatedGamesResponse200>> {
    return this.core.fetch('/games/{gameID}/related-games', 'get', metadata);
  }

  /**
   * This endpoint will allow user's to leave a rating for an Game.
   *
   * @summary Rate an Game.
   * @throws FetchError<400, types.PostGameRateResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostGameRateResponse403> Authentication error JSON response
   */
  postGameRate(body: types.PostGameRateFormDataParam, metadata: types.PostGameRateMetadataParam): Promise<FetchResponse<200, types.PostGameRateResponse200>> {
    return this.core.fetch('/games/{gameID}/rate', 'post', body, metadata);
  }

  /**
   * This endpoint will retrieve the staff of an Game item.
   *
   * @summary Game staff information.
   * @throws FetchError<400, types.GetGameStaffResponse400> Error Kurozora JSON response
   */
  getGameStaff(metadata: types.GetGameStaffMetadataParam): Promise<FetchResponse<200, types.GetGameStaffResponse200>> {
    return this.core.fetch('/games/{gameID}/staff', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the studios of an Game item.
   *
   * @summary Game studio information.
   * @throws FetchError<400, types.GetGameStudiosResponse400> Error Kurozora JSON response
   */
  getGameStudios(metadata: types.GetGameStudiosMetadataParam): Promise<FetchResponse<200, types.GetGameStudiosResponse200>> {
    return this.core.fetch('/games/{gameID}/studios', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the upcoming Game items.
   *
   * @summary Upcoming game information.
   * @throws FetchError<400, types.GetGameUpcomingResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetGameUpcomingResponse403> Authentication error JSON response
   */
  getGameUpcoming(metadata?: types.GetGameUpcomingMetadataParam): Promise<FetchResponse<200, types.GetGameUpcomingResponse200>> {
    return this.core.fetch('/games/upcoming', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the details of an Manga item.
   *
   * @summary (optional authentication) Manga details.
   * @throws FetchError<400, types.GetMangaResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMangaResponse403> Authentication error JSON response
   */
  getManga(metadata: types.GetMangaMetadataParam): Promise<FetchResponse<200, types.GetMangaResponse200>> {
    return this.core.fetch('/manga/{mangaID}', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the casts of an Manga item.
   *
   * @summary Manga cast information.
   * @throws FetchError<400, types.GetMangaCastResponse400> Error Kurozora JSON response
   */
  getMangaCast(metadata: types.GetMangaCastMetadataParam): Promise<FetchResponse<200, types.GetMangaCastResponse200>> {
    return this.core.fetch('/manga/{mangaID}/cast', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the characters of an Manga item.
   *
   * @summary Manga character information.
   * @throws FetchError<400, types.GetMangaCharactersResponse400> Error Kurozora JSON response
   */
  getMangaCharacters(metadata: types.GetMangaCharactersMetadataParam): Promise<FetchResponse<200, types.GetMangaCharactersResponse200>> {
    return this.core.fetch('/manga/{mangaID}/characters', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the related-shows of an Manga item.
   *
   * @summary Manga related-shows information.
   * @throws FetchError<400, types.GetMangaRelatedShowsResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMangaRelatedShowsResponse403> Authentication error JSON response
   */
  getMangaRelatedShows(metadata: types.GetMangaRelatedShowsMetadataParam): Promise<FetchResponse<200, types.GetMangaRelatedShowsResponse200>> {
    return this.core.fetch('/manga/{mangaID}/related-shows', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the related-literatures of an Manga item.
   *
   * @summary Manga related-literatures information.
   * @throws FetchError<400, types.GetMangaRelatedLiteraturesResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMangaRelatedLiteraturesResponse403> Authentication error JSON response
   */
  getMangaRelatedLiteratures(metadata: types.GetMangaRelatedLiteraturesMetadataParam): Promise<FetchResponse<200, types.GetMangaRelatedLiteraturesResponse200>> {
    return this.core.fetch('/manga/{mangaID}/related-literatures', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the related-games of an Manga item.
   *
   * @summary Manga related-games information.
   * @throws FetchError<400, types.GetMangaRelatedGamesResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMangaRelatedGamesResponse403> Authentication error JSON response
   */
  getMangaRelatedGames(metadata: types.GetMangaRelatedGamesMetadataParam): Promise<FetchResponse<200, types.GetMangaRelatedGamesResponse200>> {
    return this.core.fetch('/manga/{mangaID}/related-games', 'get', metadata);
  }

  /**
   * This endpoint will allow user's to leave a rating for an Manga.
   *
   * @summary Rate an Manga.
   * @throws FetchError<400, types.PostMangaRateResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostMangaRateResponse403> Authentication error JSON response
   */
  postMangaRate(body: types.PostMangaRateFormDataParam, metadata: types.PostMangaRateMetadataParam): Promise<FetchResponse<200, types.PostMangaRateResponse200>> {
    return this.core.fetch('/manga/{mangaID}/rate', 'post', body, metadata);
  }

  /**
   * This endpoint will retrieve the staff of an Manga item.
   *
   * @summary Manga staff information.
   * @throws FetchError<400, types.GetMangaStaffResponse400> Error Kurozora JSON response
   */
  getMangaStaff(metadata: types.GetMangaStaffMetadataParam): Promise<FetchResponse<200, types.GetMangaStaffResponse200>> {
    return this.core.fetch('/manga/{mangaID}/staff', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the studios of an Manga item.
   *
   * @summary Manga studio information.
   * @throws FetchError<400, types.GetMangaStudiosResponse400> Error Kurozora JSON response
   */
  getMangaStudios(metadata: types.GetMangaStudiosMetadataParam): Promise<FetchResponse<200, types.GetMangaStudiosResponse200>> {
    return this.core.fetch('/manga/{mangaID}/studios', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the upcoming Manga items.
   *
   * @summary Upcoming manga information.
   * @throws FetchError<400, types.GetMangaUpcomingResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMangaUpcomingResponse403> Authentication error JSON response
   */
  getMangaUpcoming(metadata?: types.GetMangaUpcomingMetadataParam): Promise<FetchResponse<200, types.GetMangaUpcomingResponse200>> {
    return this.core.fetch('/manga/upcoming', 'get', metadata);
  }

  /**
   * This endpoint will return schedule results for the specified query.
   *
   * @summary Get schedule results.
   * @throws FetchError<400, types.GetScheduleResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetScheduleResponse403> Authentication error JSON response
   */
  getSchedule(metadata: types.GetScheduleMetadataParam): Promise<FetchResponse<200, types.GetScheduleResponse200>> {
    return this.core.fetch('/schedule', 'get', metadata);
  }

  /**
   * This endpoint will return search results for the specified query.
   *
   * @summary Get search results.
   * @throws FetchError<400, types.GetSearchResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetSearchResponse403> Authentication error JSON response
   */
  getSearch(metadata: types.GetSearchMetadataParam): Promise<FetchResponse<200, types.GetSearchResponse200>> {
    return this.core.fetch('/search', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the details of a specific season.
   *
   * @summary Get specific season details.
   * @throws FetchError<400, types.GetSeasonsDetailsResponse400> Error Kurozora JSON response
   */
  getSeasonsDetails(metadata: types.GetSeasonsDetailsMetadataParam): Promise<FetchResponse<200, types.GetSeasonsDetailsResponse200>> {
    return this.core.fetch('/seasons/{seasonID}', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the episodes in a certain season.
   *
   * @summary Retrieve season episodes.
   * @throws FetchError<400, types.GetSeasonsEpisodesResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetSeasonsEpisodesResponse403> Authentication error JSON response
   */
  getSeasonsEpisodes(metadata: types.GetSeasonsEpisodesMetadataParam): Promise<FetchResponse<200, types.GetSeasonsEpisodesResponse200>> {
    return this.core.fetch('/seasons/{seasonID}/episodes', 'get', metadata);
  }

  /**
   * This endpoint will updated the watched status for the episodes of a season.
   *
   * @summary Marks the episodes of a season as "watched" or "not watched".
   * @throws FetchError<400, types.PostSeasonsWatchedResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostSeasonsWatchedResponse403> Authentication error JSON response
   */
  postSeasonsWatched(metadata: types.PostSeasonsWatchedMetadataParam): Promise<FetchResponse<200, types.PostSeasonsWatchedResponse200>> {
    return this.core.fetch('/seasons/{seasonID}/watched', 'post', metadata);
  }

  /**
   * This endpoint will retrieve the details of a specific episode.
   *
   * @summary Get specific episode details.
   * @throws FetchError<400, types.GetEpisodesDetailsResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetEpisodesDetailsResponse403> Authentication error JSON response
   */
  getEpisodesDetails(metadata: types.GetEpisodesDetailsMetadataParam): Promise<FetchResponse<200, types.GetEpisodesDetailsResponse200>> {
    return this.core.fetch('/episodes/{episodeID}', 'get', metadata);
  }

  /**
   * This endpoint will updated the watched status for an episode.
   *
   * @summary Marks an episode as "watched" or "not watched".
   * @throws FetchError<400, types.PostEpisodesWatchedResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostEpisodesWatchedResponse403> Authentication error JSON response
   */
  postEpisodesWatched(metadata: types.PostEpisodesWatchedMetadataParam): Promise<FetchResponse<200, types.PostEpisodesWatchedResponse200>> {
    return this.core.fetch('/episodes/{episodeID}/watched', 'post', metadata);
  }

  /**
   * This endpoint will allow user's to leave a rating for an Episode.
   *
   * @summary Rate an Episode.
   * @throws FetchError<400, types.PostEpisodeRateResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostEpisodeRateResponse403> Authentication error JSON response
   */
  postEpisodeRate(body: types.PostEpisodeRateFormDataParam, metadata: types.PostEpisodeRateMetadataParam): Promise<FetchResponse<200, types.PostEpisodeRateResponse200>> {
    return this.core.fetch('/episodes/{episodeID}/rate', 'post', body, metadata);
  }

  /**
   * This endpoint will retrieve the details of a specific character.
   *
   * @summary Get character details.
   * @throws FetchError<400, types.GetCharactersDetailsResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetCharactersDetailsResponse403> Authentication error JSON response
   */
  getCharactersDetails(metadata: types.GetCharactersDetailsMetadataParam): Promise<FetchResponse<200, types.GetCharactersDetailsResponse200>> {
    return this.core.fetch('/characters/{characterID}', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the people of a specific character.
   *
   * @summary Get character people.
   * @throws FetchError<400, types.GetCharactersPeopleResponse400> Error Kurozora JSON response
   */
  getCharactersPeople(metadata: types.GetCharactersPeopleMetadataParam): Promise<FetchResponse<200, types.GetCharactersPeopleResponse200>> {
    return this.core.fetch('/characters/{characterID}/people', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the anime of a specific character.
   *
   * @summary Get character anime.
   * @throws FetchError<400, types.GetCharactersAnimeResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetCharactersAnimeResponse403> Authentication error JSON response
   */
  getCharactersAnime(metadata: types.GetCharactersAnimeMetadataParam): Promise<FetchResponse<200, types.GetCharactersAnimeResponse200>> {
    return this.core.fetch('/characters/{characterID}/anime', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the genres.
   *
   * @summary Genres list.
   * @throws FetchError<400, types.GetGenresResponse400> Error Kurozora JSON response
   */
  getGenres(): Promise<FetchResponse<200, types.GetGenresResponse200>> {
    return this.core.fetch('/genres', 'get');
  }

  /**
   * This endpoint will retrieve the details of a specific genre.
   *
   * @summary Get genre details.
   * @throws FetchError<400, types.GetGenreDetailsResponse400> Error Kurozora JSON response
   */
  getGenreDetails(metadata: types.GetGenreDetailsMetadataParam): Promise<FetchResponse<200, types.GetGenreDetailsResponse200>> {
    return this.core.fetch('/genres/{genreID}', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the details of a cast.
   *
   * @summary Cast details.
   * @throws FetchError<400, types.GetCastResponse400> Error Kurozora JSON response
   */
  getCast(metadata: types.GetCastMetadataParam): Promise<FetchResponse<200, types.GetCastResponse200>> {
    return this.core.fetch('/cast/{castID}', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the details for a person.
   *
   * @summary Get person details.
   * @throws FetchError<400, types.GetPeopleDetailsResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetPeopleDetailsResponse403> Authentication error JSON response
   */
  getPeopleDetails(metadata: types.GetPeopleDetailsMetadataParam): Promise<FetchResponse<200, types.GetPeopleDetailsResponse200>> {
    return this.core.fetch('/people/{personID}', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the anime of a specific person.
   *
   * @summary Get person anime.
   * @throws FetchError<400, types.GetPeopleAnimeResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetPeopleAnimeResponse403> Authentication error JSON response
   */
  getPeopleAnime(metadata: types.GetPeopleAnimeMetadataParam): Promise<FetchResponse<200, types.GetPeopleAnimeResponse200>> {
    return this.core.fetch('/people/{personID}/anime', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the characters of a Person item.
   *
   * @summary Person character information.
   * @throws FetchError<400, types.GetPeopleCharactersResponse400> Error Kurozora JSON response
   */
  getPeopleCharacters(metadata: types.GetPeopleCharactersMetadataParam): Promise<FetchResponse<200, types.GetPeopleCharactersResponse200>> {
    return this.core.fetch('/people/{personID}/characters', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the themes.
   *
   * @summary Themes list.
   * @throws FetchError<400, types.GetThemesResponse400> Error Kurozora JSON response
   */
  getThemes(): Promise<FetchResponse<200, types.GetThemesResponse200>> {
    return this.core.fetch('/themes', 'get');
  }

  /**
   * This endpoint will retrieve the details of a specific theme.
   *
   * @summary Get theme details.
   * @throws FetchError<400, types.GetThemeDetailsResponse400> Error Kurozora JSON response
   */
  getThemeDetails(metadata: types.GetThemeDetailsMetadataParam): Promise<FetchResponse<200, types.GetThemeDetailsResponse200>> {
    return this.core.fetch('/themes/{themeID}', 'get', metadata);
  }

  /**
   * This endpoint will create a new message on the feed.
   *
   * @summary Creates a new message on the feed.
   * @throws FetchError<400, types.PostFeedResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostFeedResponse403> Authentication error JSON response
   */
  postFeed(body: types.PostFeedFormDataParam): Promise<FetchResponse<200, types.PostFeedResponse200>> {
    return this.core.fetch('/feed', 'post', body);
  }

  /**
   * This endpoint will retrieve the an unpersonalised feed.
   *
   * @summary (optional authentication) Explore feed posts.
   * @throws FetchError<400, types.GetFeedExploreResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetFeedExploreResponse403> Authentication error JSON response
   */
  getFeedExplore(metadata?: types.GetFeedExploreMetadataParam): Promise<FetchResponse<200, types.GetFeedExploreResponse200>> {
    return this.core.fetch('/feed/explore', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the authenticated user's personal feed.
   *
   * @summary Get the user's personal feed
   * @throws FetchError<400, types.GetFeedHomeResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetFeedHomeResponse403> Authentication error JSON response
   */
  getFeedHome(metadata?: types.GetFeedHomeMetadataParam): Promise<FetchResponse<200, types.GetFeedHomeResponse200>> {
    return this.core.fetch('/feed/home', 'get', metadata);
  }

  /**
   * This endpoint will retrieve a feed message's details.
   *
   * @summary Get the feed message's details
   * @throws FetchError<400, types.GetFeedMessagesDetailsResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetFeedMessagesDetailsResponse403> Authentication error JSON response
   */
  getFeedMessagesDetails(metadata: types.GetFeedMessagesDetailsMetadataParam): Promise<FetchResponse<200, types.GetFeedMessagesDetailsResponse200>> {
    return this.core.fetch('/feed/messages/{messageID}', 'get', metadata);
  }

  /**
   * This endpoint will update a feed message's details.
   *
   * @summary Update the feed message's details
   * @throws FetchError<400, types.PostFeedMessagesUpdateResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostFeedMessagesUpdateResponse403> Authentication error JSON response
   */
  postFeedMessagesUpdate(body: types.PostFeedMessagesUpdateFormDataParam, metadata: types.PostFeedMessagesUpdateMetadataParam): Promise<FetchResponse<200, types.PostFeedMessagesUpdateResponse200>> {
    return this.core.fetch('/feed/messages/{messageID}/update', 'post', body, metadata);
  }

  /**
   * This endpoint will retrieve a feed message's replies.
   *
   * @summary Get the feed message's replies
   * @throws FetchError<400, types.GetFeedMessagesRepliesResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetFeedMessagesRepliesResponse403> Authentication error JSON response
   */
  getFeedMessagesReplies(metadata: types.GetFeedMessagesRepliesMetadataParam): Promise<FetchResponse<200, types.GetFeedMessagesRepliesResponse200>> {
    return this.core.fetch('/feed/messages/{messageID}/replies', 'get', metadata);
  }

  /**
   * This endpoint will heart or un-heart a feed message.
   *
   * @summary Heart or un-heart a feed message.
   * @throws FetchError<400, types.PostFeedMessagesHeartResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostFeedMessagesHeartResponse403> Authentication error JSON response
   */
  postFeedMessagesHeart(metadata: types.PostFeedMessagesHeartMetadataParam): Promise<FetchResponse<200, types.PostFeedMessagesHeartResponse200>> {
    return this.core.fetch('/feed/messages/{messageID}/heart', 'post', metadata);
  }

  /**
   * This endpoint will delete a feed message.
   *
   * @summary Delete a feed message
   * @throws FetchError<400, types.PostFeedMessagesDeleteResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostFeedMessagesDeleteResponse403> Authentication error JSON response
   */
  postFeedMessagesDelete(metadata: types.PostFeedMessagesDeleteMetadataParam): Promise<FetchResponse<200, types.PostFeedMessagesDeleteResponse200>> {
    return this.core.fetch('/feed/messages/{messageID}/delete', 'post', metadata);
  }

  /**
   * This endpoint will retrieve the details of the authenticated user's profile.
   *
   * @summary Authenticated user profile details.
   * @throws FetchError<400, types.GetMeResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMeResponse403> Authentication error JSON response
   */
  getMe(): Promise<FetchResponse<200, types.GetMeResponse200>> {
    return this.core.fetch('/me', 'get');
  }

  /**
   * This endpoint will update the authenticated user's profile information.
   *
   * @summary Updates profile information.
   * @throws FetchError<400, types.PostMeResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostMeResponse403> Authentication error JSON response
   */
  postMe(body?: types.PostMeBodyParam): Promise<FetchResponse<200, types.PostMeResponse200>> {
    return this.core.fetch('/me', 'post', body);
  }

  /**
   * This endpoint will retrieve a list of access tokens for the authenticated user.
   *
   * @summary Get a list of access tokens.
   * @throws FetchError<400, types.GetMeAccessTokensResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMeAccessTokensResponse403> Authentication error JSON response
   */
  getMeAccessTokens(metadata?: types.GetMeAccessTokensMetadataParam): Promise<FetchResponse<200, types.GetMeAccessTokensResponse200>> {
    return this.core.fetch('/me/access-tokens', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the details of an access token.
   *
   * @summary Fetch session details.
   * @throws FetchError<400, types.GetMeAccessTokensAccessTokenResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMeAccessTokensAccessTokenResponse403> Authentication error JSON response
   */
  getMeAccessTokensAccessToken(metadata: types.GetMeAccessTokensAccessTokenMetadataParam): Promise<FetchResponse<200, types.GetMeAccessTokensAccessTokenResponse200>> {
    return this.core.fetch('/me/access-tokens/{accessToken}', 'get', metadata);
  }

  /**
   * This endpoint will update the information of an authenticated user's access token.
   *
   * @summary Updates access token.
   * @throws FetchError<400, types.PostMeAccessTokenUpdateResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostMeAccessTokenUpdateResponse403> Authentication error JSON response
   */
  postMeAccessTokenUpdate(body: types.PostMeAccessTokenUpdateFormDataParam, metadata: types.PostMeAccessTokenUpdateMetadataParam): Promise<FetchResponse<200, types.PostMeAccessTokenUpdateResponse200>> {
    return this.core.fetch('/me/access-tokens/{accessToken}/update', 'post', body, metadata);
  }

  /**
   * This endpoint will delete an authenticated user's access token.
   *
   * @summary Delete an access token.
   * @throws FetchError<400, types.PostMeAccessTokensDeleteResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostMeAccessTokensDeleteResponse403> Authentication error JSON response
   */
  postMeAccessTokensDelete(metadata: types.PostMeAccessTokensDeleteMetadataParam): Promise<FetchResponse<200, types.PostMeAccessTokensDeleteResponse200>> {
    return this.core.fetch('/me/access-tokens/{accessToken}/delete', 'post', metadata);
  }

  /**
   * This endpoint will retrieve the list of objects in the authenticated user's favorites.
   *
   * @summary Get an overview of the user's favorites.
   * @throws FetchError<400, types.GetMeFavoritesResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMeFavoritesResponse403> Authentication error JSON response
   */
  getMeFavorites(metadata: types.GetMeFavoritesMetadataParam): Promise<FetchResponse<200, types.GetMeFavoritesResponse200>> {
    return this.core.fetch('/me/favorites', 'get', metadata);
  }

  /**
   * This endpoint will add or remove an anime to/from the authenticated user's favorites.
   *
   * @summary Add or remove from favorites.
   * @throws FetchError<400, types.PostMeFavoriteAnimeResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostMeFavoriteAnimeResponse403> Authentication error JSON response
   */
  postMeFavoriteAnime(body: types.PostMeFavoriteAnimeFormDataParam): Promise<FetchResponse<200, types.PostMeFavoriteAnimeResponse200>> {
    return this.core.fetch('/me/favorites', 'post', body);
  }

  /**
   * This endpoint will retrieve the authenticated user's feed messages.
   *
   * @summary Get feed messages.
   * @throws FetchError<400, types.GetMeFeedMessagesResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMeFeedMessagesResponse403> Authentication error JSON response
   */
  getMeFeedMessages(metadata?: types.GetMeFeedMessagesMetadataParam): Promise<FetchResponse<200, types.GetMeFeedMessagesResponse200>> {
    return this.core.fetch('/me/feed-messages', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the authenticated user's followers list.
   *
   * @summary Fetch followers list.
   * @throws FetchError<400, types.GetMeFollowersResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMeFollowersResponse403> Authentication error JSON response
   */
  getMeFollowers(metadata?: types.GetMeFollowersMetadataParam): Promise<FetchResponse<200, types.GetMeFollowersResponse200>> {
    return this.core.fetch('/me/followers', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the authenticated user's following list.
   *
   * @summary Fetch following list.
   * @throws FetchError<400, types.GetMeFollowingResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMeFollowingResponse403> Authentication error JSON response
   */
  getMeFollowing(metadata?: types.GetMeFollowingMetadataParam): Promise<FetchResponse<200, types.GetMeFollowingResponse200>> {
    return this.core.fetch('/me/following', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the list of objects in the authenticated user's library.
   *
   * @summary Get an overview of the library.
   * @throws FetchError<400, types.GetMeLibraryResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMeLibraryResponse403> Authentication error JSON response
   */
  getMeLibrary(metadata: types.GetMeLibraryMetadataParam): Promise<FetchResponse<200, types.GetMeLibraryResponse200>> {
    return this.core.fetch('/me/library', 'get', metadata);
  }

  /**
   * This endpoint will add to the list of anime in the authenticated user's library.
   *
   * @summary Add an anime to the library.
   * @throws FetchError<400, types.PostMeLibraryResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostMeLibraryResponse403> Authentication error JSON response
   */
  postMeLibrary(body: types.PostMeLibraryFormDataParam): Promise<FetchResponse<200, types.PostMeLibraryResponse200>> {
    return this.core.fetch('/me/library', 'post', body);
  }

  /**
   * This endpoint will import a library export file into the authenticated user's library.
   *
   * @summary Import a library export file.
   * @throws FetchError<400, types.PostMeLibraryImportResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostMeLibraryImportResponse403> Authentication error JSON response
   */
  postMeLibraryImport(body: types.PostMeLibraryImportBodyParam): Promise<FetchResponse<200, types.PostMeLibraryImportResponse200>> {
    return this.core.fetch('/me/library/import', 'post', body);
  }

  /**
   * This endpoint will remove an object from the authenticated user's library.
   *
   * @summary Remove an object from library.
   * @throws FetchError<400, types.PostMeLibraryDeleteResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostMeLibraryDeleteResponse403> Authentication error JSON response
   */
  postMeLibraryDelete(body: types.PostMeLibraryDeleteFormDataParam): Promise<FetchResponse<200, types.PostMeLibraryDeleteResponse200>> {
    return this.core.fetch('/me/library/delete', 'post', body);
  }

  /**
   * This endpoint will retrieve the list of the authenticated user's notifications.
   *
   * @summary Authenticated user's list of notifications.
   * @throws FetchError<400, types.GetMeNotificationsResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMeNotificationsResponse403> Authentication error JSON response
   */
  getMeNotifications(): Promise<FetchResponse<200, types.GetMeNotificationsResponse200>> {
    return this.core.fetch('/me/notifications', 'get');
  }

  /**
   * This endpoint will retrieve the details of a notification.
   *
   * @summary Get a notification's details.
   * @throws FetchError<400, types.GetMeNotificationsDetailsResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMeNotificationsDetailsResponse403> Authentication error JSON response
   */
  getMeNotificationsDetails(metadata: types.GetMeNotificationsDetailsMetadataParam): Promise<FetchResponse<200, types.GetMeNotificationsDetailsResponse200>> {
    return this.core.fetch('/me/notifications/{notificationUUID}', 'get', metadata);
  }

  /**
   * This endpoint will delete the authenticated user's notification.
   *
   * @summary Delete a notification.
   * @throws FetchError<400, types.GetMeNotificationsDeleteResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMeNotificationsDeleteResponse403> Authentication error JSON response
   */
  getMeNotificationsDelete(metadata: types.GetMeNotificationsDeleteMetadataParam): Promise<FetchResponse<200, types.GetMeNotificationsDeleteResponse200>> {
    return this.core.fetch('/me/notifications/{notificationUUID}/delete', 'post', metadata);
  }

  /**
   * This endpoint will update the status of a single, multiple or all notifications of the
   * authenticated user.
   *
   * @summary Update a notification's status.
   * @throws FetchError<400, types.PostMeNotificationsUpdateResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostMeNotificationsUpdateResponse403> Authentication error JSON response
   */
  postMeNotificationsUpdate(body: types.PostMeNotificationsUpdateFormDataParam): Promise<FetchResponse<200, types.PostMeNotificationsUpdateResponse200>> {
    return this.core.fetch('/me/notifications/update', 'post', body);
  }

  /**
   * This endpoint will retrieve the list of Re:CAP years available for the authenticated
   * user.
   *
   * @summary Get a list of available Re:CAP years.
   * @throws FetchError<400, types.GetMeRecapResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMeRecapResponse403> Authentication error JSON response
   */
  getMeRecap(): Promise<FetchResponse<200, types.GetMeRecapResponse200>> {
    return this.core.fetch('/me/recap', 'get');
  }

  /**
   * This endpoint will retrieve the authenticated user's Re:CAP details for the specified
   * year.
   *
   * @summary Get Re:CAP for year.
   * @throws FetchError<400, types.GetMeRecapYearResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMeRecapYearResponse403> Authentication error JSON response
   */
  getMeRecapYear(metadata: types.GetMeRecapYearMetadataParam): Promise<FetchResponse<200, types.GetMeRecapYearResponse200>> {
    return this.core.fetch('/me/recap/{year}', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the list of anime in the authenticated user's reminder list.
   *
   * @summary Get an overview reminders.
   * @throws FetchError<400, types.GetMeReminderAnimeResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMeReminderAnimeResponse403> Authentication error JSON response
   */
  getMeReminderAnime(metadata?: types.GetMeReminderAnimeMetadataParam): Promise<FetchResponse<200, types.GetMeReminderAnimeResponse200>> {
    return this.core.fetch('/me/reminder-anime', 'get', metadata);
  }

  /**
   * This endpoint will add or remove to/from the list of anime in an authenticated user's
   * reminders.
   *
   * @summary Add or remove reminders.
   * @throws FetchError<400, types.PostMeReminderAnimeResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostMeReminderAnimeResponse403> Authentication error JSON response
   */
  postMeReminderAnime(body: types.PostMeReminderAnimeFormDataParam): Promise<FetchResponse<200, types.PostMeReminderAnimeResponse200>> {
    return this.core.fetch('/me/reminder-anime', 'post', body);
  }

  /**
   * This endpoint will retrieve the calendar file with anime in the authenticated user's
   * reminder list.
   *
   * @summary Download reminders.
   * @throws FetchError<400, types.GetMeReminderAnimeDownloadResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMeReminderAnimeDownloadResponse403> Authentication error JSON response
   */
  getMeReminderAnimeDownload(): Promise<FetchResponse<200, types.GetMeReminderAnimeDownloadResponse200>> {
    return this.core.fetch('/me/reminder-anime/download', 'get');
  }

  /**
   * This endpoint will retrieve a list of sessions for the authenticated user.
   *
   * @summary Get a list of sessions.
   * @throws FetchError<400, types.GetMeSessionsResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMeSessionsResponse403> Authentication error JSON response
   */
  getMeSessions(metadata?: types.GetMeSessionsMetadataParam): Promise<FetchResponse<200, types.GetMeSessionsResponse200>> {
    return this.core.fetch('/me/sessions', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the details of a session.
   *
   * @summary Fetch session details.
   * @throws FetchError<400, types.GetMeSessionsSessionResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMeSessionsSessionResponse403> Authentication error JSON response
   */
  getMeSessionsSession(metadata: types.GetMeSessionsSessionMetadataParam): Promise<FetchResponse<200, types.GetMeSessionsSessionResponse200>> {
    return this.core.fetch('/me/sessions/{sessionID}', 'get', metadata);
  }

  /**
   * This endpoint will delete an authenticated user's session.
   *
   * @summary Delete a session.
   * @throws FetchError<400, types.PostMeSessionsDeleteResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostMeSessionsDeleteResponse403> Authentication error JSON response
   */
  postMeSessionsDelete(metadata: types.PostMeSessionsDeleteMetadataParam): Promise<FetchResponse<200, types.PostMeSessionsDeleteResponse200>> {
    return this.core.fetch('/me/sessions/{sessionID}/delete', 'post', metadata);
  }

  /**
   * This endpoint will retrieve the details of a specific studio.
   *
   * @summary (Optional authentication) Get studio details.
   * @throws FetchError<400, types.GetStudiosDetailsResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetStudiosDetailsResponse403> Authentication error JSON response
   */
  getStudiosDetails(metadata: types.GetStudiosDetailsMetadataParam): Promise<FetchResponse<200, types.GetStudiosDetailsResponse200>> {
    return this.core.fetch('/studios/{studioID}', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the anime details for a studio.
   *
   * @summary (Optional authentication) Get studio anime details.
   * @throws FetchError<400, types.GetStudiosAnimeResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetStudiosAnimeResponse403> Authentication error JSON response
   */
  getStudiosAnime(metadata: types.GetStudiosAnimeMetadataParam): Promise<FetchResponse<200, types.GetStudiosAnimeResponse200>> {
    return this.core.fetch('/studios/{studioID}/anime', 'get', metadata);
  }

  /**
   * This endpoint will retrieve an overview of theme store items.
   *
   * @summary Retrieve an overview of theme store items.
   * @throws FetchError<400, types.GetThemeStoreResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetThemeStoreResponse403> Authentication error JSON response
   */
  getThemeStore(): Promise<FetchResponse<200, types.GetThemeStoreResponse200>> {
    return this.core.fetch('/theme-store', 'get');
  }

  /**
   * This endpoint will retrieve the details of a specific theme store item.
   *
   * @summary Get specific theme store item details.
   * @throws FetchError<400, types.GetThemeStoreDetailsResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetThemeStoreDetailsResponse403> Authentication error JSON response
   */
  getThemeStoreDetails(metadata: types.GetThemeStoreDetailsMetadataParam): Promise<FetchResponse<200, types.GetThemeStoreDetailsResponse200>> {
    return this.core.fetch('/theme-store/{themeID}', 'get', metadata);
  }

  /**
   * This endpoint will create a new user based on the given details.
   *
   * @summary Register a new user
   * @throws FetchError<400, types.PostUsersResponse400> Error Kurozora JSON response
   */
  postUsers(body: types.PostUsersBodyParam): Promise<FetchResponse<200, types.PostUsersResponse200>> {
    return this.core.fetch('/users', 'post', body);
  }

  /**
   * This endpoint will sign in a user to their account.
   *
   * @summary Sign in to account.
   * @throws FetchError<400, types.PostSignInResponse400> Error Kurozora JSON response
   */
  postSignIn(body: types.PostSignInFormDataParam): Promise<FetchResponse<200, types.PostSignInResponse200>> {
    return this.core.fetch('/users/signin', 'post', body);
  }

  /**
   * This endpoint will sign in or sign up a user using Sign in with Apple.
   *
   * @summary Sign in or sign up a user using Sign in with Apple.
   * @throws FetchError<400, types.PostSiwASignInResponse400> Error Kurozora JSON response
   */
  postSiwASignIn(body: types.PostSiwASignInFormDataParam): Promise<FetchResponse<200, types.PostSiwASignInResponse200>> {
    return this.core.fetch('/users/siwa/signin', 'post', body);
  }

  /**
   * This endpoint will send an email to the user to reset their password.
   *
   * @summary Request a password reset for a user
   * @throws FetchError<400, types.PostResetPasswordResponse400> Error Kurozora JSON response
   */
  postResetPassword(body: types.PostResetPasswordFormDataParam): Promise<FetchResponse<200, types.PostResetPasswordResponse200>> {
    return this.core.fetch('/users/reset-password', 'post', body);
  }

  /**
   * This endpoint will retrieve the list of objects in the user's favorites list.
   *
   * @summary Get an overview of the user's favorites
   * @throws FetchError<400, types.GetUsersFavoritesResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetUsersFavoritesResponse403> Authentication error JSON response
   */
  getUsersFavorites(metadata: types.GetUsersFavoritesMetadataParam): Promise<FetchResponse<200, types.GetUsersFavoritesResponse200>> {
    return this.core.fetch('/users/{userID}/favorites', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the user's feed messages.
   *
   * @summary Get feed messages.
   * @throws FetchError<400, types.GetUsersFeedMessagesResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetUsersFeedMessagesResponse403> Authentication error JSON response
   */
  getUsersFeedMessages(metadata: types.GetUsersFeedMessagesMetadataParam): Promise<FetchResponse<200, types.GetUsersFeedMessagesResponse200>> {
    return this.core.fetch('/users/{userID}/feed-messages', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the details of a user's profile.
   *
   * @summary (optional authentication) User profile details.
   * @throws FetchError<400, types.GetUsersProfileResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetUsersProfileResponse403> Authentication error JSON response
   */
  getUsersProfile(metadata: types.GetUsersProfileMetadataParam): Promise<FetchResponse<200, types.GetUsersProfileResponse200>> {
    return this.core.fetch('/users/{userID}/profile', 'get', metadata);
  }

  /**
   * This endpoint will follow or unfollow another user.
   *
   * @summary Follow or unfollow another user
   * @throws FetchError<400, types.PostUsersFollowResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostUsersFollowResponse403> Authentication error JSON response
   */
  postUsersFollow(metadata: types.PostUsersFollowMetadataParam): Promise<FetchResponse<200, types.PostUsersFollowResponse200>> {
    return this.core.fetch('/users/{userID}/follow', 'post', metadata);
  }

  /**
   * This endpoint will retrieve the user's followers list.
   *
   * @summary Fetch followers list.
   * @throws FetchError<400, types.GetUsersFollowersResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetUsersFollowersResponse403> Authentication error JSON response
   */
  getUsersFollowers(metadata: types.GetUsersFollowersMetadataParam): Promise<FetchResponse<200, types.GetUsersFollowersResponse200>> {
    return this.core.fetch('/users/{userID}/followers', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the user's following list.
   *
   * @summary Fetch following list.
   * @throws FetchError<400, types.GetUsersFollowingResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetUsersFollowingResponse403> Authentication error JSON response
   */
  getUsersFollowing(metadata: types.GetUsersFollowingMetadataParam): Promise<FetchResponse<200, types.GetUsersFollowingResponse200>> {
    return this.core.fetch('/users/{userID}/following', 'get', metadata);
  }

  /**
   * This endpoint will delete a user's account.
   *
   * @summary Delete an account.
   * @throws FetchError<400, types.DeleteUserResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.DeleteUserResponse403> Authentication error JSON response
   */
  deleteUser(body: types.DeleteUserFormDataParam): Promise<FetchResponse<200, types.DeleteUserResponse200>> {
    return this.core.fetch('/users/delete', 'delete', body);
  }

  /**
   * This endpoint will retrieve the available products from the store
   *
   * @summary Fetch store products.
   * @throws FetchError<400, types.GetStoreResponse400> Error Kurozora JSON response
   */
  getStore(metadata?: types.GetStoreMetadataParam): Promise<FetchResponse<200, types.GetStoreResponse200>> {
    return this.core.fetch('/store', 'get', metadata);
  }

  /**
   * This endpoint will verify the receipt for authenticity.
   *
   * @summary Verify receipt
   * @throws FetchError<400, types.PostStoreVerifyResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.PostStoreVerifyResponse403> Authentication error JSON response
   */
  postStoreVerify(body: types.PostStoreVerifyBodyParam): Promise<FetchResponse<200, types.PostStoreVerifyResponse200>> {
    return this.core.fetch('/store/verify', 'post', body);
  }

  /**
   * This endpoint will retrieve the latest Privacy Policy.
   *
   * @summary Retrieve latest Privacy Policy.
   * @throws FetchError<400, types.GetPrivacyPolicyResponse400> Error Kurozora JSON response
   */
  getPrivacyPolicy(): Promise<FetchResponse<200, types.GetPrivacyPolicyResponse200>> {
    return this.core.fetch('/legal/privacy-policy', 'get');
  }

  /**
   * This endpoint will retrieve the latest Terms of Use.
   *
   * @summary Retrieve latest Terms of Use.
   * @throws FetchError<400, types.GetTermsOfUseResponse400> Error Kurozora JSON response
   */
  getTermsOfUse(): Promise<FetchResponse<200, types.GetTermsOfUseResponse200>> {
    return this.core.fetch('/legal/terms-of-use', 'get');
  }

  /**
   * This endpoint will retrieve the details of an Anime item using the MyAnimeList ID.
   *
   * @summary (optional authentication) Anime details.
   * @throws FetchError<400, types.GetMyAnimeListAnimeResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMyAnimeListAnimeResponse403> Authentication error JSON response
   */
  getMyAnimeListAnime(metadata: types.GetMyAnimeListAnimeMetadataParam): Promise<FetchResponse<200, types.GetMyAnimeListAnimeResponse200>> {
    return this.core.fetch('/myanimelist/anime/{malID}', 'get', metadata);
  }

  /**
   * This endpoint will retrieve the details of an Manga item using the MyAnimeList ID.
   *
   * @summary (optional authentication) Manga details.
   * @throws FetchError<400, types.GetMyAnimeListMangaResponse400> Error Kurozora JSON response
   * @throws FetchError<403, types.GetMyAnimeListMangaResponse403> Authentication error JSON response
   */
  getMyAnimeListManga(metadata: types.GetMyAnimeListMangaMetadataParam): Promise<FetchResponse<200, types.GetMyAnimeListMangaResponse200>> {
    return this.core.fetch('/myanimelist/manga/{malID}', 'get', metadata);
  }

  /**
   * Plain API JSON response.
   *
   * @summary API info.
   * @throws FetchError<400, types.GetInfoResponse400> Error Kurozora JSON response
   */
  getInfo(): Promise<FetchResponse<200, types.GetInfoResponse200>> {
    return this.core.fetch('/info', 'get');
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { DeleteUserFormDataParam, DeleteUserResponse200, DeleteUserResponse400, DeleteUserResponse403, GetAnimeCastMetadataParam, GetAnimeCastResponse200, GetAnimeCastResponse400, GetAnimeCharactersMetadataParam, GetAnimeCharactersResponse200, GetAnimeCharactersResponse400, GetAnimeMetadataParam, GetAnimeRelatedGamesMetadataParam, GetAnimeRelatedGamesResponse200, GetAnimeRelatedGamesResponse400, GetAnimeRelatedGamesResponse403, GetAnimeRelatedLiteraturesMetadataParam, GetAnimeRelatedLiteraturesResponse200, GetAnimeRelatedLiteraturesResponse400, GetAnimeRelatedLiteraturesResponse403, GetAnimeRelatedShowsMetadataParam, GetAnimeRelatedShowsResponse200, GetAnimeRelatedShowsResponse400, GetAnimeRelatedShowsResponse403, GetAnimeResponse200, GetAnimeResponse400, GetAnimeResponse403, GetAnimeStaffMetadataParam, GetAnimeStaffResponse200, GetAnimeStaffResponse400, GetAnimeStudiosMetadataParam, GetAnimeStudiosResponse200, GetAnimeStudiosResponse400, GetAnimeUpcomingMetadataParam, GetAnimeUpcomingResponse200, GetAnimeUpcomingResponse400, GetAnimeUpcomingResponse403, GetCastMetadataParam, GetCastResponse200, GetCastResponse400, GetCharactersAnimeMetadataParam, GetCharactersAnimeResponse200, GetCharactersAnimeResponse400, GetCharactersAnimeResponse403, GetCharactersDetailsMetadataParam, GetCharactersDetailsResponse200, GetCharactersDetailsResponse400, GetCharactersDetailsResponse403, GetCharactersPeopleMetadataParam, GetCharactersPeopleResponse200, GetCharactersPeopleResponse400, GetEpisodesDetailsMetadataParam, GetEpisodesDetailsResponse200, GetEpisodesDetailsResponse400, GetEpisodesDetailsResponse403, GetExploreDetailsMetadataParam, GetExploreDetailsResponse200, GetExploreDetailsResponse400, GetExploreDetailsResponse403, GetExploreMetadataParam, GetExploreResponse200, GetExploreResponse400, GetExploreResponse403, GetFeedExploreMetadataParam, GetFeedExploreResponse200, GetFeedExploreResponse400, GetFeedExploreResponse403, GetFeedHomeMetadataParam, GetFeedHomeResponse200, GetFeedHomeResponse400, GetFeedHomeResponse403, GetFeedMessagesDetailsMetadataParam, GetFeedMessagesDetailsResponse200, GetFeedMessagesDetailsResponse400, GetFeedMessagesDetailsResponse403, GetFeedMessagesRepliesMetadataParam, GetFeedMessagesRepliesResponse200, GetFeedMessagesRepliesResponse400, GetFeedMessagesRepliesResponse403, GetGameCastMetadataParam, GetGameCastResponse200, GetGameCastResponse400, GetGameCharactersMetadataParam, GetGameCharactersResponse200, GetGameCharactersResponse400, GetGameMetadataParam, GetGameRelatedGamesMetadataParam, GetGameRelatedGamesResponse200, GetGameRelatedGamesResponse400, GetGameRelatedGamesResponse403, GetGameRelatedLiteraturesMetadataParam, GetGameRelatedLiteraturesResponse200, GetGameRelatedLiteraturesResponse400, GetGameRelatedLiteraturesResponse403, GetGameRelatedShowsMetadataParam, GetGameRelatedShowsResponse200, GetGameRelatedShowsResponse400, GetGameRelatedShowsResponse403, GetGameResponse200, GetGameResponse400, GetGameResponse403, GetGameStaffMetadataParam, GetGameStaffResponse200, GetGameStaffResponse400, GetGameStudiosMetadataParam, GetGameStudiosResponse200, GetGameStudiosResponse400, GetGameUpcomingMetadataParam, GetGameUpcomingResponse200, GetGameUpcomingResponse400, GetGameUpcomingResponse403, GetGenreDetailsMetadataParam, GetGenreDetailsResponse200, GetGenreDetailsResponse400, GetGenresResponse200, GetGenresResponse400, GetInfoResponse200, GetInfoResponse400, GetMangaCastMetadataParam, GetMangaCastResponse200, GetMangaCastResponse400, GetMangaCharactersMetadataParam, GetMangaCharactersResponse200, GetMangaCharactersResponse400, GetMangaMetadataParam, GetMangaRelatedGamesMetadataParam, GetMangaRelatedGamesResponse200, GetMangaRelatedGamesResponse400, GetMangaRelatedGamesResponse403, GetMangaRelatedLiteraturesMetadataParam, GetMangaRelatedLiteraturesResponse200, GetMangaRelatedLiteraturesResponse400, GetMangaRelatedLiteraturesResponse403, GetMangaRelatedShowsMetadataParam, GetMangaRelatedShowsResponse200, GetMangaRelatedShowsResponse400, GetMangaRelatedShowsResponse403, GetMangaResponse200, GetMangaResponse400, GetMangaResponse403, GetMangaStaffMetadataParam, GetMangaStaffResponse200, GetMangaStaffResponse400, GetMangaStudiosMetadataParam, GetMangaStudiosResponse200, GetMangaStudiosResponse400, GetMangaUpcomingMetadataParam, GetMangaUpcomingResponse200, GetMangaUpcomingResponse400, GetMangaUpcomingResponse403, GetMeAccessTokensAccessTokenMetadataParam, GetMeAccessTokensAccessTokenResponse200, GetMeAccessTokensAccessTokenResponse400, GetMeAccessTokensAccessTokenResponse403, GetMeAccessTokensMetadataParam, GetMeAccessTokensResponse200, GetMeAccessTokensResponse400, GetMeAccessTokensResponse403, GetMeFavoritesMetadataParam, GetMeFavoritesResponse200, GetMeFavoritesResponse400, GetMeFavoritesResponse403, GetMeFeedMessagesMetadataParam, GetMeFeedMessagesResponse200, GetMeFeedMessagesResponse400, GetMeFeedMessagesResponse403, GetMeFollowersMetadataParam, GetMeFollowersResponse200, GetMeFollowersResponse400, GetMeFollowersResponse403, GetMeFollowingMetadataParam, GetMeFollowingResponse200, GetMeFollowingResponse400, GetMeFollowingResponse403, GetMeLibraryMetadataParam, GetMeLibraryResponse200, GetMeLibraryResponse400, GetMeLibraryResponse403, GetMeNotificationsDeleteMetadataParam, GetMeNotificationsDeleteResponse200, GetMeNotificationsDeleteResponse400, GetMeNotificationsDeleteResponse403, GetMeNotificationsDetailsMetadataParam, GetMeNotificationsDetailsResponse200, GetMeNotificationsDetailsResponse400, GetMeNotificationsDetailsResponse403, GetMeNotificationsResponse200, GetMeNotificationsResponse400, GetMeNotificationsResponse403, GetMeRecapResponse200, GetMeRecapResponse400, GetMeRecapResponse403, GetMeRecapYearMetadataParam, GetMeRecapYearResponse200, GetMeRecapYearResponse400, GetMeRecapYearResponse403, GetMeReminderAnimeDownloadResponse200, GetMeReminderAnimeDownloadResponse400, GetMeReminderAnimeDownloadResponse403, GetMeReminderAnimeMetadataParam, GetMeReminderAnimeResponse200, GetMeReminderAnimeResponse400, GetMeReminderAnimeResponse403, GetMeResponse200, GetMeResponse400, GetMeResponse403, GetMeSessionsMetadataParam, GetMeSessionsResponse200, GetMeSessionsResponse400, GetMeSessionsResponse403, GetMeSessionsSessionMetadataParam, GetMeSessionsSessionResponse200, GetMeSessionsSessionResponse400, GetMeSessionsSessionResponse403, GetMyAnimeListAnimeMetadataParam, GetMyAnimeListAnimeResponse200, GetMyAnimeListAnimeResponse400, GetMyAnimeListAnimeResponse403, GetMyAnimeListMangaMetadataParam, GetMyAnimeListMangaResponse200, GetMyAnimeListMangaResponse400, GetMyAnimeListMangaResponse403, GetPeopleAnimeMetadataParam, GetPeopleAnimeResponse200, GetPeopleAnimeResponse400, GetPeopleAnimeResponse403, GetPeopleCharactersMetadataParam, GetPeopleCharactersResponse200, GetPeopleCharactersResponse400, GetPeopleDetailsMetadataParam, GetPeopleDetailsResponse200, GetPeopleDetailsResponse400, GetPeopleDetailsResponse403, GetPrivacyPolicyResponse200, GetPrivacyPolicyResponse400, GetScheduleMetadataParam, GetScheduleResponse200, GetScheduleResponse400, GetScheduleResponse403, GetSearchMetadataParam, GetSearchResponse200, GetSearchResponse400, GetSearchResponse403, GetSeasonsDetailsMetadataParam, GetSeasonsDetailsResponse200, GetSeasonsDetailsResponse400, GetSeasonsEpisodesMetadataParam, GetSeasonsEpisodesResponse200, GetSeasonsEpisodesResponse400, GetSeasonsEpisodesResponse403, GetSeasonsMetadataParam, GetSeasonsResponse200, GetSeasonsResponse400, GetStoreMetadataParam, GetStoreResponse200, GetStoreResponse400, GetStudiosAnimeMetadataParam, GetStudiosAnimeResponse200, GetStudiosAnimeResponse400, GetStudiosAnimeResponse403, GetStudiosDetailsMetadataParam, GetStudiosDetailsResponse200, GetStudiosDetailsResponse400, GetStudiosDetailsResponse403, GetTermsOfUseResponse200, GetTermsOfUseResponse400, GetThemeDetailsMetadataParam, GetThemeDetailsResponse200, GetThemeDetailsResponse400, GetThemeStoreDetailsMetadataParam, GetThemeStoreDetailsResponse200, GetThemeStoreDetailsResponse400, GetThemeStoreDetailsResponse403, GetThemeStoreResponse200, GetThemeStoreResponse400, GetThemeStoreResponse403, GetThemesResponse200, GetThemesResponse400, GetUsersFavoritesMetadataParam, GetUsersFavoritesResponse200, GetUsersFavoritesResponse400, GetUsersFavoritesResponse403, GetUsersFeedMessagesMetadataParam, GetUsersFeedMessagesResponse200, GetUsersFeedMessagesResponse400, GetUsersFeedMessagesResponse403, GetUsersFollowersMetadataParam, GetUsersFollowersResponse200, GetUsersFollowersResponse400, GetUsersFollowersResponse403, GetUsersFollowingMetadataParam, GetUsersFollowingResponse200, GetUsersFollowingResponse400, GetUsersFollowingResponse403, GetUsersProfileMetadataParam, GetUsersProfileResponse200, GetUsersProfileResponse400, GetUsersProfileResponse403, PostAnimeRateFormDataParam, PostAnimeRateMetadataParam, PostAnimeRateResponse200, PostAnimeRateResponse400, PostAnimeRateResponse403, PostEpisodeRateFormDataParam, PostEpisodeRateMetadataParam, PostEpisodeRateResponse200, PostEpisodeRateResponse400, PostEpisodeRateResponse403, PostEpisodesWatchedMetadataParam, PostEpisodesWatchedResponse200, PostEpisodesWatchedResponse400, PostEpisodesWatchedResponse403, PostFeedFormDataParam, PostFeedMessagesDeleteMetadataParam, PostFeedMessagesDeleteResponse200, PostFeedMessagesDeleteResponse400, PostFeedMessagesDeleteResponse403, PostFeedMessagesHeartMetadataParam, PostFeedMessagesHeartResponse200, PostFeedMessagesHeartResponse400, PostFeedMessagesHeartResponse403, PostFeedMessagesUpdateFormDataParam, PostFeedMessagesUpdateMetadataParam, PostFeedMessagesUpdateResponse200, PostFeedMessagesUpdateResponse400, PostFeedMessagesUpdateResponse403, PostFeedResponse200, PostFeedResponse400, PostFeedResponse403, PostGameRateFormDataParam, PostGameRateMetadataParam, PostGameRateResponse200, PostGameRateResponse400, PostGameRateResponse403, PostMangaRateFormDataParam, PostMangaRateMetadataParam, PostMangaRateResponse200, PostMangaRateResponse400, PostMangaRateResponse403, PostMeAccessTokenUpdateFormDataParam, PostMeAccessTokenUpdateMetadataParam, PostMeAccessTokenUpdateResponse200, PostMeAccessTokenUpdateResponse400, PostMeAccessTokenUpdateResponse403, PostMeAccessTokensDeleteMetadataParam, PostMeAccessTokensDeleteResponse200, PostMeAccessTokensDeleteResponse400, PostMeAccessTokensDeleteResponse403, PostMeBodyParam, PostMeFavoriteAnimeFormDataParam, PostMeFavoriteAnimeResponse200, PostMeFavoriteAnimeResponse400, PostMeFavoriteAnimeResponse403, PostMeLibraryDeleteFormDataParam, PostMeLibraryDeleteResponse200, PostMeLibraryDeleteResponse400, PostMeLibraryDeleteResponse403, PostMeLibraryFormDataParam, PostMeLibraryImportBodyParam, PostMeLibraryImportResponse200, PostMeLibraryImportResponse400, PostMeLibraryImportResponse403, PostMeLibraryResponse200, PostMeLibraryResponse400, PostMeLibraryResponse403, PostMeNotificationsUpdateFormDataParam, PostMeNotificationsUpdateResponse200, PostMeNotificationsUpdateResponse400, PostMeNotificationsUpdateResponse403, PostMeReminderAnimeFormDataParam, PostMeReminderAnimeResponse200, PostMeReminderAnimeResponse400, PostMeReminderAnimeResponse403, PostMeResponse200, PostMeResponse400, PostMeResponse403, PostMeSessionsDeleteMetadataParam, PostMeSessionsDeleteResponse200, PostMeSessionsDeleteResponse400, PostMeSessionsDeleteResponse403, PostResetPasswordFormDataParam, PostResetPasswordResponse200, PostResetPasswordResponse400, PostSeasonsWatchedMetadataParam, PostSeasonsWatchedResponse200, PostSeasonsWatchedResponse400, PostSeasonsWatchedResponse403, PostSignInFormDataParam, PostSignInResponse200, PostSignInResponse400, PostSiwASignInFormDataParam, PostSiwASignInResponse200, PostSiwASignInResponse400, PostStoreVerifyBodyParam, PostStoreVerifyResponse200, PostStoreVerifyResponse400, PostStoreVerifyResponse403, PostUsersBodyParam, PostUsersFollowMetadataParam, PostUsersFollowResponse200, PostUsersFollowResponse400, PostUsersFollowResponse403, PostUsersResponse200, PostUsersResponse400 } from './types';
