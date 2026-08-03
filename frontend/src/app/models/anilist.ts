import { WatchStatus } from './anime';
import { ReadStatus } from './manga';

export interface User {
  id: number;
  name: string;
  avatar: {
    medium: string;
  };
}

export type AnilistUser = User;

interface SaveMedialistEntry {
  id: number;
  mediaId: number;
  status: AnilistMediaListStatus;
  score: number;
  scoreRaw: number;
  progress: number;
  progressVolumes: number;
  repeat: number;
  priority: number;
  private: boolean;
  notes: string;
  hiddenFromStatusLists: boolean;
  customLists: [string];
  advancedScores: [number];
  startedAt: FuzzyDate;
  completedAt: FuzzyDate;
}

interface FuzzyDate {
  year: number;
  month: number;
  day: number;
}

export type AnilistSaveMedialistEntry = SaveMedialistEntry;

export type AnilistMediaListStatus =
  | 'CURRENT'
  | 'PLANNING'
  | 'COMPLETED'
  | 'DROPPED'
  | 'PAUSED'
  | 'REPEATING';

export interface AnilistNotification {
  text: string;
  url: string;
  unread: boolean;
  createdAt: Date;
  media?: {
    id: number;
    idMal?: number;
    type: 'ANIME' | 'MANGA';
  };
}

export type AnilistNotificationType =
  | 'ACTIVITY_MESSAGE'
  | 'ACTIVITY_REPLY'
  | 'FOLLOWING'
  | 'ACTIVITY_MENTION'
  | 'THREAD_COMMENT_MENTION'
  | 'THREAD_SUBSCRIBED'
  | 'THREAD_COMMENT_REPLY'
  | 'AIRING'
  | 'ACTIVITY_LIKE'
  | 'ACTIVITY_REPLY_LIKE'
  | 'THREAD_LIKE'
  | 'THREAD_COMMENT_LIKE'
  | 'ACTIVITY_REPLY_SUBSCRIBED'
  | 'RELATED_MEDIA_ADDITION'
  | 'MEDIA_DATA_CHANGE'
  | 'MEDIA_MERGE'
  | 'MEDIA_DELETION';

export interface AnilistActivity {
  id: number;
  type: string;
  createdAt: number;
  user: {
    id: number;
    name: string;
    avatar: {
      medium: string;
    };
  };
  text?: string;
  status?: string;
  progress?: string;

  // MessageActivity support
  message?: string;
  messenger?: {
    id: number;
    name: string;
    avatar: {
      medium: string;
    };
  };
  recipient?: {
    id: number;
    name: string;
    avatar: {
      medium: string;
    };
  };

  media?: {
    id: number;
    idMal?: number;
    type: 'ANIME' | 'MANGA';
    startDate: {
      year: number;
    };
    format?: string;
    title: {
      userPreferred: string;
    };
    coverImage: {
      large: string;
    };
  };
  replies?: Array<{
    id: number;
    text: string;
    createdAt: number;
    user: {
      id: number;
      name: string;
      avatar: {
        medium: string;
      };
    };
    likeCount: number;
    isLiked: boolean;
    likes?: Array<{
      id: number;
      name: string;
      avatar: {
        medium: string;
      };
    }>;
  }>;
  likes?: Array<{
    id: number;
    name: string;
    avatar: {
      medium: string;
    };
  }>;
  replyCount: number;
  likeCount: number;
  isLiked: boolean;
  siteUrl: string;
}

export interface AnilistName {
  full: string;
  native?: string;
  alternative?: string[];
}

export interface AnilistMediaRef {
  id: number;
  idMal?: number;
  type: 'ANIME' | 'MANGA';
  title: string;
  image?: string;
  format?: string;
  source?: string;
}

export interface AnilistMediaSearchResult {
  id: number;
  idMal?: number;
  title: string;
  year?: number;
  image?: string;
  description?: string;
  genres?: string[];
  format?: string;
}

export interface AnilistCharacterDetail {
  id: number;
  name: AnilistName;
  image?: string;
  description?: string;
  gender?: string;
  age?: string;
  siteUrl?: string;
}

export interface AnilistCharacterMediaRole {
  role: 'MAIN' | 'SUPPORTING' | 'BACKGROUND';
  media: AnilistMediaRef;
}

export interface AnilistCharacterVoiceActor {
  language: string;
  actor: { id: number; name: string; image?: string };
}

export interface AnilistStaffDetail {
  id: number;
  name: AnilistName;
  image?: string;
  description?: string;
  primaryOccupations?: string[];
  dateOfBirth?: { year?: number; month?: number; day?: number };
  siteUrl?: string;
}

export interface AnilistStaffVoiceRole {
  role: 'MAIN' | 'SUPPORTING' | 'BACKGROUND';
  character: { id: number; name: string; image?: string };
  media: AnilistMediaRef;
}

export interface AnilistStaffMediaRole {
  role?: string;
  media: AnilistMediaRef;
}

export interface AnilistStudioDetail {
  id: number;
  name: string;
  siteUrl?: string;
}

export interface AnilistWorkCharacter {
  character: { id: number; name: string; image?: string };
  role: 'MAIN' | 'SUPPORTING' | 'BACKGROUND';
  voiceActors: Array<{ id: number; name: string; image?: string; language?: string }>;
}

export interface AnilistWorkStaff {
  person: { id: number; name: string; image?: string };
  positions: string[];
}

export interface AnilistWorkRelation {
  relationType: string;
  node: { id: number; idMal?: number; type: 'ANIME' | 'MANGA'; title: string };
}

export function localizeAnilistLinks(html: string): string {
  return html
    .replace(/https?:\/\/anilist\.co\/character\/(\d+)(?:\/[^"'\s)]*)?/g, '/character/$1')
    .replace(/https?:\/\/anilist\.co\/staff\/(\d+)(?:\/[^"'\s)]*)?/g, '/person/$1');
}

export function formatRelationType(relationType: string): string {
  return relationType
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

export function statusFromMal(
  malStatus?: WatchStatus | ReadStatus,
  repeating = false,
): AnilistMediaListStatus | undefined {
  switch (malStatus) {
    case 'plan_to_read':
    case 'plan_to_watch':
      return 'PLANNING';
    case 'completed':
      return repeating ? 'REPEATING' : 'COMPLETED';
    case 'dropped':
      return 'DROPPED';
    case 'on_hold':
      return 'PAUSED';
    case 'reading':
    case 'watching':
      return 'CURRENT';
    default:
      return undefined;
  }
}

export function statusToMal(alStatus?: AnilistMediaListStatus, type: 'ANIME' | 'MANGA' = 'ANIME') {
  let status;
  switch (alStatus) {
    case 'PLANNING':
      status = type === 'MANGA' ? 'plan_to_read' : 'plan_to_watch';
      break;
    case 'CURRENT':
      status = type === 'MANGA' ? 'reading' : 'watching';
      break;
    case 'REPEATING':
    case 'COMPLETED':
      status = 'completed';
      break;
    case 'PAUSED':
      status = 'on_hold';
      break;
    case 'DROPPED':
      status = 'dropped';
      break;
    default:
      status = undefined;
  }
  if (!status) return undefined;
  if (type === 'MANGA') return status as ReadStatus;
  return status as WatchStatus;
}
