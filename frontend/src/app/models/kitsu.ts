interface Response<T> {
  data: T;
  meta: { count: number };
  links: {
    first: string;
    last: string;
  };
}

interface MappingData {
  id: string;
  type: 'mappings';
  links: { self: string };
  attributes: {
    externalSite: string;
    externalId: string;
  };
  relationships: {
    item: {
      links: {
        self: string;
        related: string;
      };
    };
  };
}

export type KitsuMappingData = MappingData;

export type KitsuResponse<T> = Response<T>;

export type KitsuStatus = 'current' | 'planned' | 'completed' | 'on_hold' | 'dropped';

interface Entry {
  id: string;
  type: 'libraryEntries';
  links: { self: string };
  attributes: EntryAttributes;
}

export type KitsuEntry = Entry;

interface EntryAttributes {
  createdAt: Date;
  updatedAt: Date;
  status: KitsuStatus;
  progress: number;
  volumesOwned: number;
  reconsuming: boolean;
  reconsumeCount: number;
  notes?: string;
  private: boolean;
  reactionSkipped: string;
  progressedAt?: Date;
  startedAt?: string;
  finishedAt?: string;
  rating: string;
  ratingTwenty?: number;
}

export type KitsuEntryAttributes = EntryAttributes;

interface Media {
  id: number;
  type: 'anime' | 'manga';
  attributes: {
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    synopsis: string;
    coverImageTopOffset: number;
    titles: {
      en: string;
      en_jp: string;
      ja_jp: string;
    };
    canonicalTitle: string;
    abbreviatedTitles: string[];
    averageRating: number;
    ratingFrequencies: {
      [key: number]: number;
    };
    userCount: number;
    favoritesCount: number;
    startDate: Date;
    endDate: Date;
    popularityRank: number;
    ratingRank: number;
    ageRating: string;
    ageRatingGuide: string;
    subtype: 'TV';
    status: 'finished';
    tba: '';
    posterImage: Image;
    coverImage: Image;
    episodeCount: number;
    episodeLength: number;
    youtubeVideoId: string;
    showType: string;
    nsfw: boolean;
  };
  relationships: {
    genres: Link;
    categories: Link;
    castings: Link;
    installments: Link;
    mappings: Link;
    reviews: Link;
    mediaRelationships: Link;
    episodes: Link;
    streamingLinks: Link;
    animeProductions: Link;
    animeCharacters: Link;
    animeStaff: Link;
  };
}

interface Link {
  links: {
    self: string;
    related: string;
  };
}

interface Image {
  tiny: string;
  small: string;
  medium: string;
  large: string;
  original: string;
  meta: {
    dimensions: {
      tiny: {
        width: null;
        height: null;
      };
      small: {
        width: null;
        height: null;
      };
      medium: {
        width: null;
        height: null;
      };
      large: {
        width: null;
        height: null;
      };
    };
  };
}

export type KitsuMedia = Media;

interface User {
  id: string;
  attributes: {
    name: string;
  };
}

export type KitsuUser = User;
