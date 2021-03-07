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
  startedAt?: Date;
  finishedAt?: Date;
  rating: string;
  ratingTwenty?: number;
}

export type KitsuEntryAttributes = EntryAttributes;

interface User {
  id: string;
  attributes: {
    name: string;
  };
}

export type KitsuUser = User;
