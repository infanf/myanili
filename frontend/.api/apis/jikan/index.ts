import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core';
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'jikan/4.0.0 (api/5.0.8)');
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

  getAnimeFullById(
    metadata: types.GetAnimeFullByIdMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeFullByIdResponse200>> {
    return this.core.fetch('/anime/{id}/full', 'get', metadata);
  }

  getAnimeById(
    metadata: types.GetAnimeByIdMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeByIdResponse200>> {
    return this.core.fetch('/anime/{id}', 'get', metadata);
  }

  getAnimeCharacters(
    metadata: types.GetAnimeCharactersMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeCharactersResponse200>> {
    return this.core.fetch('/anime/{id}/characters', 'get', metadata);
  }

  getAnimeStaff(
    metadata: types.GetAnimeStaffMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeStaffResponse200>> {
    return this.core.fetch('/anime/{id}/staff', 'get', metadata);
  }

  getAnimeEpisodes(
    metadata: types.GetAnimeEpisodesMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeEpisodesResponse200>> {
    return this.core.fetch('/anime/{id}/episodes', 'get', metadata);
  }

  getAnimeEpisodeById(
    metadata: types.GetAnimeEpisodeByIdMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeEpisodeByIdResponse200>> {
    return this.core.fetch('/anime/{id}/episodes/{episode}', 'get', metadata);
  }

  getAnimeNews(
    metadata: types.GetAnimeNewsMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeNewsResponse200>> {
    return this.core.fetch('/anime/{id}/news', 'get', metadata);
  }

  getAnimeForum(
    metadata: types.GetAnimeForumMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeForumResponse200>> {
    return this.core.fetch('/anime/{id}/forum', 'get', metadata);
  }

  getAnimeVideos(
    metadata: types.GetAnimeVideosMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeVideosResponse200>> {
    return this.core.fetch('/anime/{id}/videos', 'get', metadata);
  }

  getAnimeVideosEpisodes(
    metadata: types.GetAnimeVideosEpisodesMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeVideosEpisodesResponse200>> {
    return this.core.fetch('/anime/{id}/videos/episodes', 'get', metadata);
  }

  getAnimePictures(
    metadata: types.GetAnimePicturesMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimePicturesResponse200>> {
    return this.core.fetch('/anime/{id}/pictures', 'get', metadata);
  }

  getAnimeStatistics(
    metadata: types.GetAnimeStatisticsMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeStatisticsResponse200>> {
    return this.core.fetch('/anime/{id}/statistics', 'get', metadata);
  }

  getAnimeMoreInfo(
    metadata: types.GetAnimeMoreInfoMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeMoreInfoResponse200>> {
    return this.core.fetch('/anime/{id}/moreinfo', 'get', metadata);
  }

  getAnimeRecommendations(
    metadata: types.GetAnimeRecommendationsMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeRecommendationsResponse200>> {
    return this.core.fetch('/anime/{id}/recommendations', 'get', metadata);
  }

  getAnimeUserUpdates(
    metadata: types.GetAnimeUserUpdatesMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeUserUpdatesResponse200>> {
    return this.core.fetch('/anime/{id}/userupdates', 'get', metadata);
  }

  getAnimeReviews(
    metadata: types.GetAnimeReviewsMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeReviewsResponse200>> {
    return this.core.fetch('/anime/{id}/reviews', 'get', metadata);
  }

  getAnimeRelations(
    metadata: types.GetAnimeRelationsMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeRelationsResponse200>> {
    return this.core.fetch('/anime/{id}/relations', 'get', metadata);
  }

  getAnimeThemes(
    metadata: types.GetAnimeThemesMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeThemesResponse200>> {
    return this.core.fetch('/anime/{id}/themes', 'get', metadata);
  }

  getAnimeExternal(
    metadata: types.GetAnimeExternalMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeExternalResponse200>> {
    return this.core.fetch('/anime/{id}/external', 'get', metadata);
  }

  getAnimeStreaming(
    metadata: types.GetAnimeStreamingMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeStreamingResponse200>> {
    return this.core.fetch('/anime/{id}/streaming', 'get', metadata);
  }

  getCharacterFullById(
    metadata: types.GetCharacterFullByIdMetadataParam
  ): Promise<FetchResponse<200, types.GetCharacterFullByIdResponse200>> {
    return this.core.fetch('/characters/{id}/full', 'get', metadata);
  }

  getCharacterById(
    metadata: types.GetCharacterByIdMetadataParam
  ): Promise<FetchResponse<200, types.GetCharacterByIdResponse200>> {
    return this.core.fetch('/characters/{id}', 'get', metadata);
  }

  getCharacterAnime(
    metadata: types.GetCharacterAnimeMetadataParam
  ): Promise<FetchResponse<200, types.GetCharacterAnimeResponse200>> {
    return this.core.fetch('/characters/{id}/anime', 'get', metadata);
  }

  getCharacterManga(
    metadata: types.GetCharacterMangaMetadataParam
  ): Promise<FetchResponse<200, types.GetCharacterMangaResponse200>> {
    return this.core.fetch('/characters/{id}/manga', 'get', metadata);
  }

  getCharacterVoiceActors(
    metadata: types.GetCharacterVoiceActorsMetadataParam
  ): Promise<FetchResponse<200, types.GetCharacterVoiceActorsResponse200>> {
    return this.core.fetch('/characters/{id}/voices', 'get', metadata);
  }

  getCharacterPictures(
    metadata: types.GetCharacterPicturesMetadataParam
  ): Promise<FetchResponse<200, types.GetCharacterPicturesResponse200>> {
    return this.core.fetch('/characters/{id}/pictures', 'get', metadata);
  }

  getClubsById(
    metadata: types.GetClubsByIdMetadataParam
  ): Promise<FetchResponse<200, types.GetClubsByIdResponse200>> {
    return this.core.fetch('/clubs/{id}', 'get', metadata);
  }

  getClubMembers(
    metadata: types.GetClubMembersMetadataParam
  ): Promise<FetchResponse<200, types.GetClubMembersResponse200>> {
    return this.core.fetch('/clubs/{id}/members', 'get', metadata);
  }

  getClubStaff(
    metadata: types.GetClubStaffMetadataParam
  ): Promise<FetchResponse<200, types.GetClubStaffResponse200>> {
    return this.core.fetch('/clubs/{id}/staff', 'get', metadata);
  }

  getClubRelations(
    metadata: types.GetClubRelationsMetadataParam
  ): Promise<FetchResponse<200, types.GetClubRelationsResponse200>> {
    return this.core.fetch('/clubs/{id}/relations', 'get', metadata);
  }

  getAnimeGenres(
    metadata?: types.GetAnimeGenresMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeGenresResponse200>> {
    return this.core.fetch('/genres/anime', 'get', metadata);
  }

  getMangaGenres(
    metadata?: types.GetMangaGenresMetadataParam
  ): Promise<FetchResponse<200, types.GetMangaGenresResponse200>> {
    return this.core.fetch('/genres/manga', 'get', metadata);
  }

  getMagazines(
    metadata?: types.GetMagazinesMetadataParam
  ): Promise<FetchResponse<200, types.GetMagazinesResponse200>> {
    return this.core.fetch('/magazines', 'get', metadata);
  }

  getMangaFullById(
    metadata: types.GetMangaFullByIdMetadataParam
  ): Promise<FetchResponse<200, types.GetMangaFullByIdResponse200>> {
    return this.core.fetch('/manga/{id}/full', 'get', metadata);
  }

  getMangaById(
    metadata: types.GetMangaByIdMetadataParam
  ): Promise<FetchResponse<200, types.GetMangaByIdResponse200>> {
    return this.core.fetch('/manga/{id}', 'get', metadata);
  }

  getMangaCharacters(
    metadata: types.GetMangaCharactersMetadataParam
  ): Promise<FetchResponse<200, types.GetMangaCharactersResponse200>> {
    return this.core.fetch('/manga/{id}/characters', 'get', metadata);
  }

  getMangaNews(
    metadata: types.GetMangaNewsMetadataParam
  ): Promise<FetchResponse<200, types.GetMangaNewsResponse200>> {
    return this.core.fetch('/manga/{id}/news', 'get', metadata);
  }

  getMangaTopics(
    metadata: types.GetMangaTopicsMetadataParam
  ): Promise<FetchResponse<200, types.GetMangaTopicsResponse200>> {
    return this.core.fetch('/manga/{id}/forum', 'get', metadata);
  }

  getMangaPictures(
    metadata: types.GetMangaPicturesMetadataParam
  ): Promise<FetchResponse<200, types.GetMangaPicturesResponse200>> {
    return this.core.fetch('/manga/{id}/pictures', 'get', metadata);
  }

  getMangaStatistics(
    metadata: types.GetMangaStatisticsMetadataParam
  ): Promise<FetchResponse<200, types.GetMangaStatisticsResponse200>> {
    return this.core.fetch('/manga/{id}/statistics', 'get', metadata);
  }

  getMangaMoreInfo(
    metadata: types.GetMangaMoreInfoMetadataParam
  ): Promise<FetchResponse<200, types.GetMangaMoreInfoResponse200>> {
    return this.core.fetch('/manga/{id}/moreinfo', 'get', metadata);
  }

  getMangaRecommendations(
    metadata: types.GetMangaRecommendationsMetadataParam
  ): Promise<FetchResponse<200, types.GetMangaRecommendationsResponse200>> {
    return this.core.fetch('/manga/{id}/recommendations', 'get', metadata);
  }

  getMangaUserUpdates(
    metadata: types.GetMangaUserUpdatesMetadataParam
  ): Promise<FetchResponse<200, types.GetMangaUserUpdatesResponse200>> {
    return this.core.fetch('/manga/{id}/userupdates', 'get', metadata);
  }

  getMangaReviews(
    metadata: types.GetMangaReviewsMetadataParam
  ): Promise<FetchResponse<200, types.GetMangaReviewsResponse200>> {
    return this.core.fetch('/manga/{id}/reviews', 'get', metadata);
  }

  getMangaRelations(
    metadata: types.GetMangaRelationsMetadataParam
  ): Promise<FetchResponse<200, types.GetMangaRelationsResponse200>> {
    return this.core.fetch('/manga/{id}/relations', 'get', metadata);
  }

  getMangaExternal(
    metadata: types.GetMangaExternalMetadataParam
  ): Promise<FetchResponse<200, types.GetMangaExternalResponse200>> {
    return this.core.fetch('/manga/{id}/external', 'get', metadata);
  }

  getPersonFullById(
    metadata: types.GetPersonFullByIdMetadataParam
  ): Promise<FetchResponse<200, types.GetPersonFullByIdResponse200>> {
    return this.core.fetch('/people/{id}/full', 'get', metadata);
  }

  getPersonById(
    metadata: types.GetPersonByIdMetadataParam
  ): Promise<FetchResponse<200, types.GetPersonByIdResponse200>> {
    return this.core.fetch('/people/{id}', 'get', metadata);
  }

  getPersonAnime(
    metadata: types.GetPersonAnimeMetadataParam
  ): Promise<FetchResponse<200, types.GetPersonAnimeResponse200>> {
    return this.core.fetch('/people/{id}/anime', 'get', metadata);
  }

  getPersonVoices(
    metadata: types.GetPersonVoicesMetadataParam
  ): Promise<FetchResponse<200, types.GetPersonVoicesResponse200>> {
    return this.core.fetch('/people/{id}/voices', 'get', metadata);
  }

  getPersonManga(
    metadata: types.GetPersonMangaMetadataParam
  ): Promise<FetchResponse<200, types.GetPersonMangaResponse200>> {
    return this.core.fetch('/people/{id}/manga', 'get', metadata);
  }

  getPersonPictures(
    metadata: types.GetPersonPicturesMetadataParam
  ): Promise<FetchResponse<200, types.GetPersonPicturesResponse200>> {
    return this.core.fetch('/people/{id}/pictures', 'get', metadata);
  }

  getProducerById(
    metadata: types.GetProducerByIdMetadataParam
  ): Promise<FetchResponse<200, types.GetProducerByIdResponse200>> {
    return this.core.fetch('/producers/{id}', 'get', metadata);
  }

  getProducerFullById(
    metadata: types.GetProducerFullByIdMetadataParam
  ): Promise<FetchResponse<200, types.GetProducerFullByIdResponse200>> {
    return this.core.fetch('/producers/{id}/full', 'get', metadata);
  }

  getProducerExternal(
    metadata: types.GetProducerExternalMetadataParam
  ): Promise<FetchResponse<200, types.GetProducerExternalResponse200>> {
    return this.core.fetch('/producers/{id}/external', 'get', metadata);
  }

  getRandomAnime(): Promise<FetchResponse<200, types.GetRandomAnimeResponse200>> {
    return this.core.fetch('/random/anime', 'get');
  }

  getRandomManga(): Promise<FetchResponse<200, types.GetRandomMangaResponse200>> {
    return this.core.fetch('/random/manga', 'get');
  }

  getRandomCharacters(): Promise<FetchResponse<200, types.GetRandomCharactersResponse200>> {
    return this.core.fetch('/random/characters', 'get');
  }

  getRandomPeople(): Promise<FetchResponse<200, types.GetRandomPeopleResponse200>> {
    return this.core.fetch('/random/people', 'get');
  }

  getRandomUsers(): Promise<FetchResponse<200, types.GetRandomUsersResponse200>> {
    return this.core.fetch('/random/users', 'get');
  }

  getRecentAnimeRecommendations(
    metadata?: types.GetRecentAnimeRecommendationsMetadataParam
  ): Promise<FetchResponse<200, types.GetRecentAnimeRecommendationsResponse200>> {
    return this.core.fetch('/recommendations/anime', 'get', metadata);
  }

  getRecentMangaRecommendations(
    metadata?: types.GetRecentMangaRecommendationsMetadataParam
  ): Promise<FetchResponse<200, types.GetRecentMangaRecommendationsResponse200>> {
    return this.core.fetch('/recommendations/manga', 'get', metadata);
  }

  getRecentAnimeReviews(
    metadata?: types.GetRecentAnimeReviewsMetadataParam
  ): Promise<FetchResponse<200, types.GetRecentAnimeReviewsResponse200>> {
    return this.core.fetch('/reviews/anime', 'get', metadata);
  }

  getRecentMangaReviews(
    metadata?: types.GetRecentMangaReviewsMetadataParam
  ): Promise<FetchResponse<200, types.GetRecentMangaReviewsResponse200>> {
    return this.core.fetch('/reviews/manga', 'get', metadata);
  }

  getSchedules(
    metadata?: types.GetSchedulesMetadataParam
  ): Promise<FetchResponse<200, types.GetSchedulesResponse200>> {
    return this.core.fetch('/schedules', 'get', metadata);
  }

  getAnimeSearch(
    metadata?: types.GetAnimeSearchMetadataParam
  ): Promise<FetchResponse<200, types.GetAnimeSearchResponse200>> {
    return this.core.fetch('/anime', 'get', metadata);
  }

  getMangaSearch(
    metadata?: types.GetMangaSearchMetadataParam
  ): Promise<FetchResponse<200, types.GetMangaSearchResponse200>> {
    return this.core.fetch('/manga', 'get', metadata);
  }

  getPeopleSearch(
    metadata?: types.GetPeopleSearchMetadataParam
  ): Promise<FetchResponse<200, types.GetPeopleSearchResponse200>> {
    return this.core.fetch('/people', 'get', metadata);
  }

  getCharactersSearch(
    metadata?: types.GetCharactersSearchMetadataParam
  ): Promise<FetchResponse<200, types.GetCharactersSearchResponse200>> {
    return this.core.fetch('/characters', 'get', metadata);
  }

  getUsersSearch(
    metadata?: types.GetUsersSearchMetadataParam
  ): Promise<FetchResponse<200, types.GetUsersSearchResponse200>> {
    return this.core.fetch('/users', 'get', metadata);
  }

  getUserById(
    metadata: types.GetUserByIdMetadataParam
  ): Promise<FetchResponse<200, types.GetUserByIdResponse200>> {
    return this.core.fetch('/users/userbyid/{id}', 'get', metadata);
  }

  getClubsSearch(
    metadata?: types.GetClubsSearchMetadataParam
  ): Promise<FetchResponse<200, types.GetClubsSearchResponse200>> {
    return this.core.fetch('/clubs', 'get', metadata);
  }

  getProducers(
    metadata?: types.GetProducersMetadataParam
  ): Promise<FetchResponse<200, types.GetProducersResponse200>> {
    return this.core.fetch('/producers', 'get', metadata);
  }

  getSeasonNow(
    metadata?: types.GetSeasonNowMetadataParam
  ): Promise<FetchResponse<200, types.GetSeasonNowResponse200>> {
    return this.core.fetch('/seasons/now', 'get', metadata);
  }

  getSeason(
    metadata: types.GetSeasonMetadataParam
  ): Promise<FetchResponse<200, types.GetSeasonResponse200>> {
    return this.core.fetch('/seasons/{year}/{season}', 'get', metadata);
  }

  getSeasonsList(): Promise<FetchResponse<200, types.GetSeasonsListResponse200>> {
    return this.core.fetch('/seasons', 'get');
  }

  getSeasonUpcoming(
    metadata?: types.GetSeasonUpcomingMetadataParam
  ): Promise<FetchResponse<200, types.GetSeasonUpcomingResponse200>> {
    return this.core.fetch('/seasons/upcoming', 'get', metadata);
  }

  getTopAnime(
    metadata?: types.GetTopAnimeMetadataParam
  ): Promise<FetchResponse<200, types.GetTopAnimeResponse200>> {
    return this.core.fetch('/top/anime', 'get', metadata);
  }

  getTopManga(
    metadata?: types.GetTopMangaMetadataParam
  ): Promise<FetchResponse<200, types.GetTopMangaResponse200>> {
    return this.core.fetch('/top/manga', 'get', metadata);
  }

  getTopPeople(
    metadata?: types.GetTopPeopleMetadataParam
  ): Promise<FetchResponse<200, types.GetTopPeopleResponse200>> {
    return this.core.fetch('/top/people', 'get', metadata);
  }

  getTopCharacters(
    metadata?: types.GetTopCharactersMetadataParam
  ): Promise<FetchResponse<200, types.GetTopCharactersResponse200>> {
    return this.core.fetch('/top/characters', 'get', metadata);
  }

  getTopReviews(
    metadata?: types.GetTopReviewsMetadataParam
  ): Promise<FetchResponse<200, types.GetTopReviewsResponse200>> {
    return this.core.fetch('/top/reviews', 'get', metadata);
  }

  getUserFullProfile(
    metadata: types.GetUserFullProfileMetadataParam
  ): Promise<FetchResponse<200, types.GetUserFullProfileResponse200>> {
    return this.core.fetch('/users/{username}/full', 'get', metadata);
  }

  getUserProfile(
    metadata: types.GetUserProfileMetadataParam
  ): Promise<FetchResponse<200, types.GetUserProfileResponse200>> {
    return this.core.fetch('/users/{username}', 'get', metadata);
  }

  getUserStatistics(
    metadata: types.GetUserStatisticsMetadataParam
  ): Promise<FetchResponse<200, types.GetUserStatisticsResponse200>> {
    return this.core.fetch('/users/{username}/statistics', 'get', metadata);
  }

  getUserFavorites(
    metadata: types.GetUserFavoritesMetadataParam
  ): Promise<FetchResponse<200, types.GetUserFavoritesResponse200>> {
    return this.core.fetch('/users/{username}/favorites', 'get', metadata);
  }

  getUserUpdates(
    metadata: types.GetUserUpdatesMetadataParam
  ): Promise<FetchResponse<200, types.GetUserUpdatesResponse200>> {
    return this.core.fetch('/users/{username}/userupdates', 'get', metadata);
  }

  getUserAbout(
    metadata: types.GetUserAboutMetadataParam
  ): Promise<FetchResponse<200, types.GetUserAboutResponse200>> {
    return this.core.fetch('/users/{username}/about', 'get', metadata);
  }

  getUserHistory(
    metadata: types.GetUserHistoryMetadataParam
  ): Promise<FetchResponse<200, types.GetUserHistoryResponse200>> {
    return this.core.fetch('/users/{username}/history', 'get', metadata);
  }

  getUserFriends(
    metadata: types.GetUserFriendsMetadataParam
  ): Promise<FetchResponse<200, types.GetUserFriendsResponse200>> {
    return this.core.fetch('/users/{username}/friends', 'get', metadata);
  }

  /**
   * User Anime lists have been discontinued since May 1st, 2022. <a
   * href='https://docs.google.com/document/d/1-6H-agSnqa8Mfmw802UYfGQrceIEnAaEh4uCXAPiX5A'>Read
   * more</a>
   *
   */
  getUserAnimelist(
    metadata: types.GetUserAnimelistMetadataParam
  ): Promise<FetchResponse<200, types.GetUserAnimelistResponse200>> {
    return this.core.fetch('/users/{username}/animelist', 'get', metadata);
  }

  /**
   * User Manga lists have been discontinued since May 1st, 2022. <a
   * href='https://docs.google.com/document/d/1-6H-agSnqa8Mfmw802UYfGQrceIEnAaEh4uCXAPiX5A'>Read
   * more</a>
   *
   */
  getUserMangaList(
    metadata: types.GetUserMangaListMetadataParam
  ): Promise<FetchResponse<200, types.GetUserMangaListResponse200>> {
    return this.core.fetch('/users/{username}/mangalist', 'get', metadata);
  }

  getUserReviews(
    metadata: types.GetUserReviewsMetadataParam
  ): Promise<FetchResponse<200, types.GetUserReviewsResponse200>> {
    return this.core.fetch('/users/{username}/reviews', 'get', metadata);
  }

  getUserRecommendations(
    metadata: types.GetUserRecommendationsMetadataParam
  ): Promise<FetchResponse<200, types.GetUserRecommendationsResponse200>> {
    return this.core.fetch('/users/{username}/recommendations', 'get', metadata);
  }

  getUserClubs(
    metadata: types.GetUserClubsMetadataParam
  ): Promise<FetchResponse<200, types.GetUserClubsResponse200>> {
    return this.core.fetch('/users/{username}/clubs', 'get', metadata);
  }

  getUserExternal(
    metadata: types.GetUserExternalMetadataParam
  ): Promise<FetchResponse<200, types.GetUserExternalResponse200>> {
    return this.core.fetch('/users/{username}/external', 'get', metadata);
  }

  getWatchRecentEpisodes(): Promise<FetchResponse<200, types.GetWatchRecentEpisodesResponse200>> {
    return this.core.fetch('/watch/episodes', 'get');
  }

  getWatchPopularEpisodes(): Promise<FetchResponse<200, types.GetWatchPopularEpisodesResponse200>> {
    return this.core.fetch('/watch/episodes/popular', 'get');
  }

  getWatchRecentPromos(
    metadata?: types.GetWatchRecentPromosMetadataParam
  ): Promise<FetchResponse<200, types.GetWatchRecentPromosResponse200>> {
    return this.core.fetch('/watch/promos', 'get', metadata);
  }

  getWatchPopularPromos(): Promise<FetchResponse<200, types.GetWatchPopularPromosResponse200>> {
    return this.core.fetch('/watch/promos/popular', 'get');
  }
}

const createSDK = (() => {
  return new SDK();
})();
export default createSDK;

export type {
  GetAnimeByIdMetadataParam,
  GetAnimeByIdResponse200,
  GetAnimeCharactersMetadataParam,
  GetAnimeCharactersResponse200,
  GetAnimeEpisodeByIdMetadataParam,
  GetAnimeEpisodeByIdResponse200,
  GetAnimeEpisodesMetadataParam,
  GetAnimeEpisodesResponse200,
  GetAnimeExternalMetadataParam,
  GetAnimeExternalResponse200,
  GetAnimeForumMetadataParam,
  GetAnimeForumResponse200,
  GetAnimeFullByIdMetadataParam,
  GetAnimeFullByIdResponse200,
  GetAnimeGenresMetadataParam,
  GetAnimeGenresResponse200,
  GetAnimeMoreInfoMetadataParam,
  GetAnimeMoreInfoResponse200,
  GetAnimeNewsMetadataParam,
  GetAnimeNewsResponse200,
  GetAnimePicturesMetadataParam,
  GetAnimePicturesResponse200,
  GetAnimeRecommendationsMetadataParam,
  GetAnimeRecommendationsResponse200,
  GetAnimeRelationsMetadataParam,
  GetAnimeRelationsResponse200,
  GetAnimeReviewsMetadataParam,
  GetAnimeReviewsResponse200,
  GetAnimeSearchMetadataParam,
  GetAnimeSearchResponse200,
  GetAnimeStaffMetadataParam,
  GetAnimeStaffResponse200,
  GetAnimeStatisticsMetadataParam,
  GetAnimeStatisticsResponse200,
  GetAnimeStreamingMetadataParam,
  GetAnimeStreamingResponse200,
  GetAnimeThemesMetadataParam,
  GetAnimeThemesResponse200,
  GetAnimeUserUpdatesMetadataParam,
  GetAnimeUserUpdatesResponse200,
  GetAnimeVideosEpisodesMetadataParam,
  GetAnimeVideosEpisodesResponse200,
  GetAnimeVideosMetadataParam,
  GetAnimeVideosResponse200,
  GetCharacterAnimeMetadataParam,
  GetCharacterAnimeResponse200,
  GetCharacterByIdMetadataParam,
  GetCharacterByIdResponse200,
  GetCharacterFullByIdMetadataParam,
  GetCharacterFullByIdResponse200,
  GetCharacterMangaMetadataParam,
  GetCharacterMangaResponse200,
  GetCharacterPicturesMetadataParam,
  GetCharacterPicturesResponse200,
  GetCharacterVoiceActorsMetadataParam,
  GetCharacterVoiceActorsResponse200,
  GetCharactersSearchMetadataParam,
  GetCharactersSearchResponse200,
  GetClubMembersMetadataParam,
  GetClubMembersResponse200,
  GetClubRelationsMetadataParam,
  GetClubRelationsResponse200,
  GetClubStaffMetadataParam,
  GetClubStaffResponse200,
  GetClubsByIdMetadataParam,
  GetClubsByIdResponse200,
  GetClubsSearchMetadataParam,
  GetClubsSearchResponse200,
  GetMagazinesMetadataParam,
  GetMagazinesResponse200,
  GetMangaByIdMetadataParam,
  GetMangaByIdResponse200,
  GetMangaCharactersMetadataParam,
  GetMangaCharactersResponse200,
  GetMangaExternalMetadataParam,
  GetMangaExternalResponse200,
  GetMangaFullByIdMetadataParam,
  GetMangaFullByIdResponse200,
  GetMangaGenresMetadataParam,
  GetMangaGenresResponse200,
  GetMangaMoreInfoMetadataParam,
  GetMangaMoreInfoResponse200,
  GetMangaNewsMetadataParam,
  GetMangaNewsResponse200,
  GetMangaPicturesMetadataParam,
  GetMangaPicturesResponse200,
  GetMangaRecommendationsMetadataParam,
  GetMangaRecommendationsResponse200,
  GetMangaRelationsMetadataParam,
  GetMangaRelationsResponse200,
  GetMangaReviewsMetadataParam,
  GetMangaReviewsResponse200,
  GetMangaSearchMetadataParam,
  GetMangaSearchResponse200,
  GetMangaStatisticsMetadataParam,
  GetMangaStatisticsResponse200,
  GetMangaTopicsMetadataParam,
  GetMangaTopicsResponse200,
  GetMangaUserUpdatesMetadataParam,
  GetMangaUserUpdatesResponse200,
  GetPeopleSearchMetadataParam,
  GetPeopleSearchResponse200,
  GetPersonAnimeMetadataParam,
  GetPersonAnimeResponse200,
  GetPersonByIdMetadataParam,
  GetPersonByIdResponse200,
  GetPersonFullByIdMetadataParam,
  GetPersonFullByIdResponse200,
  GetPersonMangaMetadataParam,
  GetPersonMangaResponse200,
  GetPersonPicturesMetadataParam,
  GetPersonPicturesResponse200,
  GetPersonVoicesMetadataParam,
  GetPersonVoicesResponse200,
  GetProducerByIdMetadataParam,
  GetProducerByIdResponse200,
  GetProducerExternalMetadataParam,
  GetProducerExternalResponse200,
  GetProducerFullByIdMetadataParam,
  GetProducerFullByIdResponse200,
  GetProducersMetadataParam,
  GetProducersResponse200,
  GetRandomAnimeResponse200,
  GetRandomCharactersResponse200,
  GetRandomMangaResponse200,
  GetRandomPeopleResponse200,
  GetRandomUsersResponse200,
  GetRecentAnimeRecommendationsMetadataParam,
  GetRecentAnimeRecommendationsResponse200,
  GetRecentAnimeReviewsMetadataParam,
  GetRecentAnimeReviewsResponse200,
  GetRecentMangaRecommendationsMetadataParam,
  GetRecentMangaRecommendationsResponse200,
  GetRecentMangaReviewsMetadataParam,
  GetRecentMangaReviewsResponse200,
  GetSchedulesMetadataParam,
  GetSchedulesResponse200,
  GetSeasonMetadataParam,
  GetSeasonNowMetadataParam,
  GetSeasonNowResponse200,
  GetSeasonResponse200,
  GetSeasonUpcomingMetadataParam,
  GetSeasonUpcomingResponse200,
  GetSeasonsListResponse200,
  GetTopAnimeMetadataParam,
  GetTopAnimeResponse200,
  GetTopCharactersMetadataParam,
  GetTopCharactersResponse200,
  GetTopMangaMetadataParam,
  GetTopMangaResponse200,
  GetTopPeopleMetadataParam,
  GetTopPeopleResponse200,
  GetTopReviewsMetadataParam,
  GetTopReviewsResponse200,
  GetUserAboutMetadataParam,
  GetUserAboutResponse200,
  GetUserAnimelistMetadataParam,
  GetUserAnimelistResponse200,
  GetUserByIdMetadataParam,
  GetUserByIdResponse200,
  GetUserClubsMetadataParam,
  GetUserClubsResponse200,
  GetUserExternalMetadataParam,
  GetUserExternalResponse200,
  GetUserFavoritesMetadataParam,
  GetUserFavoritesResponse200,
  GetUserFriendsMetadataParam,
  GetUserFriendsResponse200,
  GetUserFullProfileMetadataParam,
  GetUserFullProfileResponse200,
  GetUserHistoryMetadataParam,
  GetUserHistoryResponse200,
  GetUserMangaListMetadataParam,
  GetUserMangaListResponse200,
  GetUserProfileMetadataParam,
  GetUserProfileResponse200,
  GetUserRecommendationsMetadataParam,
  GetUserRecommendationsResponse200,
  GetUserReviewsMetadataParam,
  GetUserReviewsResponse200,
  GetUserStatisticsMetadataParam,
  GetUserStatisticsResponse200,
  GetUserUpdatesMetadataParam,
  GetUserUpdatesResponse200,
  GetUsersSearchMetadataParam,
  GetUsersSearchResponse200,
  GetWatchPopularEpisodesResponse200,
  GetWatchPopularPromosResponse200,
  GetWatchRecentEpisodesResponse200,
  GetWatchRecentPromosMetadataParam,
  GetWatchRecentPromosResponse200,
} from './types';
