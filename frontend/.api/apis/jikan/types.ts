import type { FromSchema } from 'json-schema-to-ts';
import * as schemas from './schemas';

export type GetAnimeByIdMetadataParam = FromSchema<typeof schemas.GetAnimeById.metadata>;
export type GetAnimeByIdResponse200 = FromSchema<(typeof schemas.GetAnimeById.response)['200']>;
export type GetAnimeCharactersMetadataParam = FromSchema<
  typeof schemas.GetAnimeCharacters.metadata
>;
export type GetAnimeCharactersResponse200 = FromSchema<
  (typeof schemas.GetAnimeCharacters.response)['200']
>;
export type GetAnimeEpisodeByIdMetadataParam = FromSchema<
  typeof schemas.GetAnimeEpisodeById.metadata
>;
export type GetAnimeEpisodeByIdResponse200 = FromSchema<
  (typeof schemas.GetAnimeEpisodeById.response)['200']
>;
export type GetAnimeEpisodesMetadataParam = FromSchema<typeof schemas.GetAnimeEpisodes.metadata>;
export type GetAnimeEpisodesResponse200 = FromSchema<
  (typeof schemas.GetAnimeEpisodes.response)['200']
>;
export type GetAnimeExternalMetadataParam = FromSchema<typeof schemas.GetAnimeExternal.metadata>;
export type GetAnimeExternalResponse200 = FromSchema<
  (typeof schemas.GetAnimeExternal.response)['200']
>;
export type GetAnimeForumMetadataParam = FromSchema<typeof schemas.GetAnimeForum.metadata>;
export type GetAnimeForumResponse200 = FromSchema<(typeof schemas.GetAnimeForum.response)['200']>;
export type GetAnimeFullByIdMetadataParam = FromSchema<typeof schemas.GetAnimeFullById.metadata>;
export type GetAnimeFullByIdResponse200 = FromSchema<
  (typeof schemas.GetAnimeFullById.response)['200']
>;
export type GetAnimeGenresMetadataParam = FromSchema<typeof schemas.GetAnimeGenres.metadata>;
export type GetAnimeGenresResponse200 = FromSchema<(typeof schemas.GetAnimeGenres.response)['200']>;
export type GetAnimeMoreInfoMetadataParam = FromSchema<typeof schemas.GetAnimeMoreInfo.metadata>;
export type GetAnimeMoreInfoResponse200 = FromSchema<
  (typeof schemas.GetAnimeMoreInfo.response)['200']
>;
export type GetAnimeNewsMetadataParam = FromSchema<typeof schemas.GetAnimeNews.metadata>;
export type GetAnimeNewsResponse200 = FromSchema<(typeof schemas.GetAnimeNews.response)['200']>;
export type GetAnimePicturesMetadataParam = FromSchema<typeof schemas.GetAnimePictures.metadata>;
export type GetAnimePicturesResponse200 = FromSchema<
  (typeof schemas.GetAnimePictures.response)['200']
>;
export type GetAnimeRecommendationsMetadataParam = FromSchema<
  typeof schemas.GetAnimeRecommendations.metadata
>;
export type GetAnimeRecommendationsResponse200 = FromSchema<
  (typeof schemas.GetAnimeRecommendations.response)['200']
>;
export type GetAnimeRelationsMetadataParam = FromSchema<typeof schemas.GetAnimeRelations.metadata>;
export type GetAnimeRelationsResponse200 = FromSchema<
  (typeof schemas.GetAnimeRelations.response)['200']
>;
export type GetAnimeReviewsMetadataParam = FromSchema<typeof schemas.GetAnimeReviews.metadata>;
export type GetAnimeReviewsResponse200 = FromSchema<
  (typeof schemas.GetAnimeReviews.response)['200']
>;
export type GetAnimeSearchMetadataParam = FromSchema<typeof schemas.GetAnimeSearch.metadata>;
export type GetAnimeSearchResponse200 = FromSchema<(typeof schemas.GetAnimeSearch.response)['200']>;
export type GetAnimeStaffMetadataParam = FromSchema<typeof schemas.GetAnimeStaff.metadata>;
export type GetAnimeStaffResponse200 = FromSchema<(typeof schemas.GetAnimeStaff.response)['200']>;
export type GetAnimeStatisticsMetadataParam = FromSchema<
  typeof schemas.GetAnimeStatistics.metadata
>;
export type GetAnimeStatisticsResponse200 = FromSchema<
  (typeof schemas.GetAnimeStatistics.response)['200']
>;
export type GetAnimeStreamingMetadataParam = FromSchema<typeof schemas.GetAnimeStreaming.metadata>;
export type GetAnimeStreamingResponse200 = FromSchema<
  (typeof schemas.GetAnimeStreaming.response)['200']
>;
export type GetAnimeThemesMetadataParam = FromSchema<typeof schemas.GetAnimeThemes.metadata>;
export type GetAnimeThemesResponse200 = FromSchema<(typeof schemas.GetAnimeThemes.response)['200']>;
export type GetAnimeUserUpdatesMetadataParam = FromSchema<
  typeof schemas.GetAnimeUserUpdates.metadata
>;
export type GetAnimeUserUpdatesResponse200 = FromSchema<
  (typeof schemas.GetAnimeUserUpdates.response)['200']
>;
export type GetAnimeVideosEpisodesMetadataParam = FromSchema<
  typeof schemas.GetAnimeVideosEpisodes.metadata
>;
export type GetAnimeVideosEpisodesResponse200 = FromSchema<
  (typeof schemas.GetAnimeVideosEpisodes.response)['200']
>;
export type GetAnimeVideosMetadataParam = FromSchema<typeof schemas.GetAnimeVideos.metadata>;
export type GetAnimeVideosResponse200 = FromSchema<(typeof schemas.GetAnimeVideos.response)['200']>;
export type GetCharacterAnimeMetadataParam = FromSchema<typeof schemas.GetCharacterAnime.metadata>;
export type GetCharacterAnimeResponse200 = FromSchema<
  (typeof schemas.GetCharacterAnime.response)['200']
>;
export type GetCharacterByIdMetadataParam = FromSchema<typeof schemas.GetCharacterById.metadata>;
export type GetCharacterByIdResponse200 = FromSchema<
  (typeof schemas.GetCharacterById.response)['200']
>;
export type GetCharacterFullByIdMetadataParam = FromSchema<
  typeof schemas.GetCharacterFullById.metadata
>;
export type GetCharacterFullByIdResponse200 = FromSchema<
  (typeof schemas.GetCharacterFullById.response)['200']
>;
export type GetCharacterMangaMetadataParam = FromSchema<typeof schemas.GetCharacterManga.metadata>;
export type GetCharacterMangaResponse200 = FromSchema<
  (typeof schemas.GetCharacterManga.response)['200']
>;
export type GetCharacterPicturesMetadataParam = FromSchema<
  typeof schemas.GetCharacterPictures.metadata
>;
export type GetCharacterPicturesResponse200 = FromSchema<
  (typeof schemas.GetCharacterPictures.response)['200']
>;
export type GetCharacterVoiceActorsMetadataParam = FromSchema<
  typeof schemas.GetCharacterVoiceActors.metadata
>;
export type GetCharacterVoiceActorsResponse200 = FromSchema<
  (typeof schemas.GetCharacterVoiceActors.response)['200']
>;
export type GetCharactersSearchMetadataParam = FromSchema<
  typeof schemas.GetCharactersSearch.metadata
>;
export type GetCharactersSearchResponse200 = FromSchema<
  (typeof schemas.GetCharactersSearch.response)['200']
>;
export type GetClubMembersMetadataParam = FromSchema<typeof schemas.GetClubMembers.metadata>;
export type GetClubMembersResponse200 = FromSchema<(typeof schemas.GetClubMembers.response)['200']>;
export type GetClubRelationsMetadataParam = FromSchema<typeof schemas.GetClubRelations.metadata>;
export type GetClubRelationsResponse200 = FromSchema<
  (typeof schemas.GetClubRelations.response)['200']
>;
export type GetClubStaffMetadataParam = FromSchema<typeof schemas.GetClubStaff.metadata>;
export type GetClubStaffResponse200 = FromSchema<(typeof schemas.GetClubStaff.response)['200']>;
export type GetClubsByIdMetadataParam = FromSchema<typeof schemas.GetClubsById.metadata>;
export type GetClubsByIdResponse200 = FromSchema<(typeof schemas.GetClubsById.response)['200']>;
export type GetClubsSearchMetadataParam = FromSchema<typeof schemas.GetClubsSearch.metadata>;
export type GetClubsSearchResponse200 = FromSchema<(typeof schemas.GetClubsSearch.response)['200']>;
export type GetMagazinesMetadataParam = FromSchema<typeof schemas.GetMagazines.metadata>;
export type GetMagazinesResponse200 = FromSchema<(typeof schemas.GetMagazines.response)['200']>;
export type GetMangaByIdMetadataParam = FromSchema<typeof schemas.GetMangaById.metadata>;
export type GetMangaByIdResponse200 = FromSchema<(typeof schemas.GetMangaById.response)['200']>;
export type GetMangaCharactersMetadataParam = FromSchema<
  typeof schemas.GetMangaCharacters.metadata
>;
export type GetMangaCharactersResponse200 = FromSchema<
  (typeof schemas.GetMangaCharacters.response)['200']
>;
export type GetMangaExternalMetadataParam = FromSchema<typeof schemas.GetMangaExternal.metadata>;
export type GetMangaExternalResponse200 = FromSchema<
  (typeof schemas.GetMangaExternal.response)['200']
>;
export type GetMangaFullByIdMetadataParam = FromSchema<typeof schemas.GetMangaFullById.metadata>;
export type GetMangaFullByIdResponse200 = FromSchema<
  (typeof schemas.GetMangaFullById.response)['200']
>;
export type GetMangaGenresMetadataParam = FromSchema<typeof schemas.GetMangaGenres.metadata>;
export type GetMangaGenresResponse200 = FromSchema<(typeof schemas.GetMangaGenres.response)['200']>;
export type GetMangaMoreInfoMetadataParam = FromSchema<typeof schemas.GetMangaMoreInfo.metadata>;
export type GetMangaMoreInfoResponse200 = FromSchema<
  (typeof schemas.GetMangaMoreInfo.response)['200']
>;
export type GetMangaNewsMetadataParam = FromSchema<typeof schemas.GetMangaNews.metadata>;
export type GetMangaNewsResponse200 = FromSchema<(typeof schemas.GetMangaNews.response)['200']>;
export type GetMangaPicturesMetadataParam = FromSchema<typeof schemas.GetMangaPictures.metadata>;
export type GetMangaPicturesResponse200 = FromSchema<
  (typeof schemas.GetMangaPictures.response)['200']
>;
export type GetMangaRecommendationsMetadataParam = FromSchema<
  typeof schemas.GetMangaRecommendations.metadata
>;
export type GetMangaRecommendationsResponse200 = FromSchema<
  (typeof schemas.GetMangaRecommendations.response)['200']
>;
export type GetMangaRelationsMetadataParam = FromSchema<typeof schemas.GetMangaRelations.metadata>;
export type GetMangaRelationsResponse200 = FromSchema<
  (typeof schemas.GetMangaRelations.response)['200']
>;
export type GetMangaReviewsMetadataParam = FromSchema<typeof schemas.GetMangaReviews.metadata>;
export type GetMangaReviewsResponse200 = FromSchema<
  (typeof schemas.GetMangaReviews.response)['200']
>;
export type GetMangaSearchMetadataParam = FromSchema<typeof schemas.GetMangaSearch.metadata>;
export type GetMangaSearchResponse200 = FromSchema<(typeof schemas.GetMangaSearch.response)['200']>;
export type GetMangaStatisticsMetadataParam = FromSchema<
  typeof schemas.GetMangaStatistics.metadata
>;
export type GetMangaStatisticsResponse200 = FromSchema<
  (typeof schemas.GetMangaStatistics.response)['200']
>;
export type GetMangaTopicsMetadataParam = FromSchema<typeof schemas.GetMangaTopics.metadata>;
export type GetMangaTopicsResponse200 = FromSchema<(typeof schemas.GetMangaTopics.response)['200']>;
export type GetMangaUserUpdatesMetadataParam = FromSchema<
  typeof schemas.GetMangaUserUpdates.metadata
>;
export type GetMangaUserUpdatesResponse200 = FromSchema<
  (typeof schemas.GetMangaUserUpdates.response)['200']
>;
export type GetPeopleSearchMetadataParam = FromSchema<typeof schemas.GetPeopleSearch.metadata>;
export type GetPeopleSearchResponse200 = FromSchema<
  (typeof schemas.GetPeopleSearch.response)['200']
>;
export type GetPersonAnimeMetadataParam = FromSchema<typeof schemas.GetPersonAnime.metadata>;
export type GetPersonAnimeResponse200 = FromSchema<(typeof schemas.GetPersonAnime.response)['200']>;
export type GetPersonByIdMetadataParam = FromSchema<typeof schemas.GetPersonById.metadata>;
export type GetPersonByIdResponse200 = FromSchema<(typeof schemas.GetPersonById.response)['200']>;
export type GetPersonFullByIdMetadataParam = FromSchema<typeof schemas.GetPersonFullById.metadata>;
export type GetPersonFullByIdResponse200 = FromSchema<
  (typeof schemas.GetPersonFullById.response)['200']
>;
export type GetPersonMangaMetadataParam = FromSchema<typeof schemas.GetPersonManga.metadata>;
export type GetPersonMangaResponse200 = FromSchema<(typeof schemas.GetPersonManga.response)['200']>;
export type GetPersonPicturesMetadataParam = FromSchema<typeof schemas.GetPersonPictures.metadata>;
export type GetPersonPicturesResponse200 = FromSchema<
  (typeof schemas.GetPersonPictures.response)['200']
>;
export type GetPersonVoicesMetadataParam = FromSchema<typeof schemas.GetPersonVoices.metadata>;
export type GetPersonVoicesResponse200 = FromSchema<
  (typeof schemas.GetPersonVoices.response)['200']
>;
export type GetProducerByIdMetadataParam = FromSchema<typeof schemas.GetProducerById.metadata>;
export type GetProducerByIdResponse200 = FromSchema<
  (typeof schemas.GetProducerById.response)['200']
>;
export type GetProducerExternalMetadataParam = FromSchema<
  typeof schemas.GetProducerExternal.metadata
>;
export type GetProducerExternalResponse200 = FromSchema<
  (typeof schemas.GetProducerExternal.response)['200']
>;
export type GetProducerFullByIdMetadataParam = FromSchema<
  typeof schemas.GetProducerFullById.metadata
>;
export type GetProducerFullByIdResponse200 = FromSchema<
  (typeof schemas.GetProducerFullById.response)['200']
>;
export type GetProducersMetadataParam = FromSchema<typeof schemas.GetProducers.metadata>;
export type GetProducersResponse200 = FromSchema<(typeof schemas.GetProducers.response)['200']>;
export type GetRandomAnimeResponse200 = FromSchema<(typeof schemas.GetRandomAnime.response)['200']>;
export type GetRandomCharactersResponse200 = FromSchema<
  (typeof schemas.GetRandomCharacters.response)['200']
>;
export type GetRandomMangaResponse200 = FromSchema<(typeof schemas.GetRandomManga.response)['200']>;
export type GetRandomPeopleResponse200 = FromSchema<
  (typeof schemas.GetRandomPeople.response)['200']
>;
export type GetRandomUsersResponse200 = FromSchema<(typeof schemas.GetRandomUsers.response)['200']>;
export type GetRecentAnimeRecommendationsMetadataParam = FromSchema<
  typeof schemas.GetRecentAnimeRecommendations.metadata
>;
export type GetRecentAnimeRecommendationsResponse200 = FromSchema<
  (typeof schemas.GetRecentAnimeRecommendations.response)['200']
>;
export type GetRecentAnimeReviewsMetadataParam = FromSchema<
  typeof schemas.GetRecentAnimeReviews.metadata
>;
export type GetRecentAnimeReviewsResponse200 = FromSchema<
  (typeof schemas.GetRecentAnimeReviews.response)['200']
>;
export type GetRecentMangaRecommendationsMetadataParam = FromSchema<
  typeof schemas.GetRecentMangaRecommendations.metadata
>;
export type GetRecentMangaRecommendationsResponse200 = FromSchema<
  (typeof schemas.GetRecentMangaRecommendations.response)['200']
>;
export type GetRecentMangaReviewsMetadataParam = FromSchema<
  typeof schemas.GetRecentMangaReviews.metadata
>;
export type GetRecentMangaReviewsResponse200 = FromSchema<
  (typeof schemas.GetRecentMangaReviews.response)['200']
>;
export type GetSchedulesMetadataParam = FromSchema<typeof schemas.GetSchedules.metadata>;
export type GetSchedulesResponse200 = FromSchema<(typeof schemas.GetSchedules.response)['200']>;
export type GetSeasonMetadataParam = FromSchema<typeof schemas.GetSeason.metadata>;
export type GetSeasonNowMetadataParam = FromSchema<typeof schemas.GetSeasonNow.metadata>;
export type GetSeasonNowResponse200 = FromSchema<(typeof schemas.GetSeasonNow.response)['200']>;
export type GetSeasonResponse200 = FromSchema<(typeof schemas.GetSeason.response)['200']>;
export type GetSeasonUpcomingMetadataParam = FromSchema<typeof schemas.GetSeasonUpcoming.metadata>;
export type GetSeasonUpcomingResponse200 = FromSchema<
  (typeof schemas.GetSeasonUpcoming.response)['200']
>;
export type GetSeasonsListResponse200 = FromSchema<(typeof schemas.GetSeasonsList.response)['200']>;
export type GetTopAnimeMetadataParam = FromSchema<typeof schemas.GetTopAnime.metadata>;
export type GetTopAnimeResponse200 = FromSchema<(typeof schemas.GetTopAnime.response)['200']>;
export type GetTopCharactersMetadataParam = FromSchema<typeof schemas.GetTopCharacters.metadata>;
export type GetTopCharactersResponse200 = FromSchema<
  (typeof schemas.GetTopCharacters.response)['200']
>;
export type GetTopMangaMetadataParam = FromSchema<typeof schemas.GetTopManga.metadata>;
export type GetTopMangaResponse200 = FromSchema<(typeof schemas.GetTopManga.response)['200']>;
export type GetTopPeopleMetadataParam = FromSchema<typeof schemas.GetTopPeople.metadata>;
export type GetTopPeopleResponse200 = FromSchema<(typeof schemas.GetTopPeople.response)['200']>;
export type GetTopReviewsMetadataParam = FromSchema<typeof schemas.GetTopReviews.metadata>;
export type GetTopReviewsResponse200 = FromSchema<(typeof schemas.GetTopReviews.response)['200']>;
export type GetUserAboutMetadataParam = FromSchema<typeof schemas.GetUserAbout.metadata>;
export type GetUserAboutResponse200 = FromSchema<(typeof schemas.GetUserAbout.response)['200']>;
export type GetUserAnimelistMetadataParam = FromSchema<typeof schemas.GetUserAnimelist.metadata>;
export type GetUserAnimelistResponse200 = FromSchema<
  (typeof schemas.GetUserAnimelist.response)['200']
>;
export type GetUserByIdMetadataParam = FromSchema<typeof schemas.GetUserById.metadata>;
export type GetUserByIdResponse200 = FromSchema<(typeof schemas.GetUserById.response)['200']>;
export type GetUserClubsMetadataParam = FromSchema<typeof schemas.GetUserClubs.metadata>;
export type GetUserClubsResponse200 = FromSchema<(typeof schemas.GetUserClubs.response)['200']>;
export type GetUserExternalMetadataParam = FromSchema<typeof schemas.GetUserExternal.metadata>;
export type GetUserExternalResponse200 = FromSchema<
  (typeof schemas.GetUserExternal.response)['200']
>;
export type GetUserFavoritesMetadataParam = FromSchema<typeof schemas.GetUserFavorites.metadata>;
export type GetUserFavoritesResponse200 = FromSchema<
  (typeof schemas.GetUserFavorites.response)['200']
>;
export type GetUserFriendsMetadataParam = FromSchema<typeof schemas.GetUserFriends.metadata>;
export type GetUserFriendsResponse200 = FromSchema<(typeof schemas.GetUserFriends.response)['200']>;
export type GetUserFullProfileMetadataParam = FromSchema<
  typeof schemas.GetUserFullProfile.metadata
>;
export type GetUserFullProfileResponse200 = FromSchema<
  (typeof schemas.GetUserFullProfile.response)['200']
>;
export type GetUserHistoryMetadataParam = FromSchema<typeof schemas.GetUserHistory.metadata>;
export type GetUserHistoryResponse200 = FromSchema<(typeof schemas.GetUserHistory.response)['200']>;
export type GetUserMangaListMetadataParam = FromSchema<typeof schemas.GetUserMangaList.metadata>;
export type GetUserMangaListResponse200 = FromSchema<
  (typeof schemas.GetUserMangaList.response)['200']
>;
export type GetUserProfileMetadataParam = FromSchema<typeof schemas.GetUserProfile.metadata>;
export type GetUserProfileResponse200 = FromSchema<(typeof schemas.GetUserProfile.response)['200']>;
export type GetUserRecommendationsMetadataParam = FromSchema<
  typeof schemas.GetUserRecommendations.metadata
>;
export type GetUserRecommendationsResponse200 = FromSchema<
  (typeof schemas.GetUserRecommendations.response)['200']
>;
export type GetUserReviewsMetadataParam = FromSchema<typeof schemas.GetUserReviews.metadata>;
export type GetUserReviewsResponse200 = FromSchema<(typeof schemas.GetUserReviews.response)['200']>;
export type GetUserStatisticsMetadataParam = FromSchema<typeof schemas.GetUserStatistics.metadata>;
export type GetUserStatisticsResponse200 = FromSchema<
  (typeof schemas.GetUserStatistics.response)['200']
>;
export type GetUserUpdatesMetadataParam = FromSchema<typeof schemas.GetUserUpdates.metadata>;
export type GetUserUpdatesResponse200 = FromSchema<(typeof schemas.GetUserUpdates.response)['200']>;
export type GetUsersSearchMetadataParam = FromSchema<typeof schemas.GetUsersSearch.metadata>;
export type GetUsersSearchResponse200 = FromSchema<(typeof schemas.GetUsersSearch.response)['200']>;
export type GetWatchPopularEpisodesResponse200 = FromSchema<
  (typeof schemas.GetWatchPopularEpisodes.response)['200']
>;
export type GetWatchPopularPromosResponse200 = FromSchema<
  (typeof schemas.GetWatchPopularPromos.response)['200']
>;
export type GetWatchRecentEpisodesResponse200 = FromSchema<
  (typeof schemas.GetWatchRecentEpisodes.response)['200']
>;
export type GetWatchRecentPromosMetadataParam = FromSchema<
  typeof schemas.GetWatchRecentPromos.metadata
>;
export type GetWatchRecentPromosResponse200 = FromSchema<
  (typeof schemas.GetWatchRecentPromos.response)['200']
>;
