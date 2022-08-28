export interface BakaSeries {
  series_id: number;
  title: string;
  url: string;
  associated: Array<{ title: string }>;
  description: string;
  image: Image;
  type: string;
  year?: number;
  bayesian_rating?: number;
  rating_votes?: number;
  genres: Array<{ genre: string }>;
  categories: Category[];
  latest_chapter: number;
  forum_id: number;
  status: string;
  licensed: boolean;
  completed: boolean;
  anime?: {
    start: string;
    end: string;
  };
  related_series: Relation[];
  authors: Author[];
  publishers: Publisher[];
  publications: Publication[];
  recommendations: Recommendation[];
  category_recommendations: Recommendation[];
  rank: {
    position: {
      week: number;
      month: number;
      three_months: number;
      six_months: number;
      year: number;
    };
    old_position: {
      week: number;
      month: number;
      three_months: number;
      six_months: number;
      year: number;
    };
    lists: {
      reading: number;
      wish: number;
      complete: number;
      unfinished: number;
      custom: number;
    };
  };
  last_updated: {
    timestamp: number;
    as_rfc3339: Date;
    as_string: string;
  };
}

interface Image {
  url: {
    original: string;
    thumb: string;
  };
  height: number;
  width: number;
}

interface Category {
  series_id: number;
  category: string;
  votes: number;
  votes_plus: number;
  votes_minus: number;
  added_by: number;
}

interface Relation {
  relation_id: number;
  relation_type: string;
  related_series_id: number;
  related_series_name: string;
  triggered_by_relation_id: number;
}

interface Author {
  name: string;
  author_id: number;
  type: string;
}

interface Publisher {
  publisher_name: string;
  publisher_id: number;
  type: string;
  notes: string;
}

interface Publication {
  publication_name: string;
  publisher_name: string;
  publisher_id?: number;
}

interface Recommendation {
  series_name: string;
  series_id: number;
  weight: number;
}

export interface BakaUser {
  url: string;
  username: string;
}
