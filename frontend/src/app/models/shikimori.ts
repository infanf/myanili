export interface ShikimoriUser {
  id: number;
  nickname: string;
  avatarUrl: string;
}

export interface ShikimoriRate {
  id: number;
  user_id: number;
  target_id: number;
  target_type: string;
  score: number;
  status: ShikimoriRateStatus;
  rewatches: number;
  episodes: number;
  volumes: number;
  chapters: number;
  text: string;
  text_html: string;
  created_at: Date;
  updated_at: Date;
}

export type ShikimoriRateStatus =
  | 'planned'
  | 'watching'
  | 'rewatching'
  | 'completed'
  | 'on_hold'
  | 'dropped';
