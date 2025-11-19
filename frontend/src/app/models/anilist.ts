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
      large: string;
    };
  };
  text?: string;
  status?: string;
  progress?: string;
  media?: {
    id: number;
    idMal?: number;
    type: 'ANIME' | 'MANGA';
    title: {
      userPreferred: string;
    };
    coverImage: {
      large: string;
    };
  };
  replies?: {
    id: number;
    text: string;
    createdAt: number;
    user: {
      id: number;
      name: string;
      avatar: {
        large: string;
      };
    };
  }[];
  likes?: {
    id: number;
    name: string;
  }[];
  replyCount: number;
  likeCount: number;
  isLiked: boolean;
  siteUrl: string;
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
