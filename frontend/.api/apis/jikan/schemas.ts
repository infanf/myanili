const GetAnimeById = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          description: 'Anime Resource',
          properties: {
            mal_id: { description: 'MyAnimeList ID', type: 'integer' },
            url: { description: 'MyAnimeList URL', type: 'string' },
            images: {
              properties: {
                jpg: {
                  description: 'Available images in JPG',
                  properties: {
                    image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    small_image_url: {
                      description: 'Small Image URL JPG',
                      type: ['string', 'null'],
                    },
                    large_image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
                webp: {
                  description: 'Available images in WEBP',
                  properties: {
                    image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                    small_image_url: {
                      description: 'Small Image URL WEBP',
                      type: ['string', 'null'],
                    },
                    large_image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            trailer: {
              description: 'Youtube Details',
              properties: {
                youtube_id: { description: 'YouTube ID', type: ['string', 'null'] },
                url: { description: 'YouTube URL', type: ['string', 'null'] },
                embed_url: { description: 'Parsed Embed URL', type: ['string', 'null'] },
              },
              type: 'object',
            },
            approved: {
              description: 'Whether the entry is pending approval on MAL or not',
              type: 'boolean',
            },
            titles: {
              description: 'All titles',
              type: 'array',
              items: {
                properties: {
                  type: { description: 'Title type', type: 'string' },
                  title: { description: 'Title value', type: 'string' },
                },
                type: 'object',
              },
            },
            title: { description: 'Title', type: 'string', deprecated: true },
            title_english: {
              description: 'English Title',
              type: ['string', 'null'],
              deprecated: true,
            },
            title_japanese: {
              description: 'Japanese Title',
              type: ['string', 'null'],
              deprecated: true,
            },
            title_synonyms: {
              description: 'Other Titles',
              type: 'array',
              items: { type: 'string' },
              deprecated: true,
            },
            type: {
              description: 'Anime Type\n\n`TV` `OVA` `Movie` `Special` `ONA` `Music`',
              type: ['string', 'null'],
              enum: ['TV', 'OVA', 'Movie', 'Special', 'ONA', 'Music'],
            },
            source: {
              description: 'Original Material/Source adapted from',
              type: ['string', 'null'],
            },
            episodes: { description: 'Episode count', type: ['integer', 'null'] },
            status: {
              description: 'Airing status\n\n`Finished Airing` `Currently Airing` `Not yet aired`',
              type: ['string', 'null'],
              enum: ['Finished Airing', 'Currently Airing', 'Not yet aired'],
            },
            airing: { description: 'Airing boolean', type: 'boolean' },
            aired: {
              description: 'Date range',
              properties: {
                from: { description: 'Date ISO8601', type: ['string', 'null'] },
                to: { description: 'Date ISO8601', type: ['string', 'null'] },
                prop: {
                  description: 'Date Prop',
                  properties: {
                    from: {
                      description: 'Date Prop From',
                      properties: {
                        day: { description: 'Day', type: ['integer', 'null'] },
                        month: { description: 'Month', type: ['integer', 'null'] },
                        year: { description: 'Year', type: ['integer', 'null'] },
                      },
                      type: 'object',
                    },
                    to: {
                      description: 'Date Prop To',
                      properties: {
                        day: { description: 'Day', type: ['integer', 'null'] },
                        month: { description: 'Month', type: ['integer', 'null'] },
                        year: { description: 'Year', type: ['integer', 'null'] },
                      },
                      type: 'object',
                    },
                    string: { description: 'Raw parsed string', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            duration: { description: 'Parsed raw duration', type: ['string', 'null'] },
            rating: {
              description:
                'Anime audience rating\n\n`G - All Ages` `PG - Children` `PG-13 - Teens 13 or older` `R - 17+ (violence & profanity)` `R+ - Mild Nudity` `Rx - Hentai`',
              type: ['string', 'null'],
              enum: [
                'G - All Ages',
                'PG - Children',
                'PG-13 - Teens 13 or older',
                'R - 17+ (violence & profanity)',
                'R+ - Mild Nudity',
                'Rx - Hentai',
              ],
            },
            score: {
              description: 'Score',
              type: ['number', 'null'],
              format: 'float',
              minimum: -3.402823669209385e38,
              maximum: 3.402823669209385e38,
            },
            scored_by: { description: 'Number of users', type: ['integer', 'null'] },
            rank: { description: 'Ranking', type: ['integer', 'null'] },
            popularity: { description: 'Popularity', type: ['integer', 'null'] },
            members: {
              description: 'Number of users who have added this entry to their list',
              type: ['integer', 'null'],
            },
            favorites: {
              description: 'Number of users who have favorited this entry',
              type: ['integer', 'null'],
            },
            synopsis: { description: 'Synopsis', type: ['string', 'null'] },
            background: { description: 'Background', type: ['string', 'null'] },
            season: {
              description: 'Season\n\n`summer` `winter` `spring` `fall`',
              type: ['string', 'null'],
              enum: ['summer', 'winter', 'spring', 'fall'],
            },
            year: { description: 'Year', type: ['integer', 'null'] },
            broadcast: {
              description: 'Broadcast Details',
              properties: {
                day: { description: 'Day of the week', type: ['string', 'null'] },
                time: { description: 'Time in 24 hour format', type: ['string', 'null'] },
                timezone: {
                  description:
                    'Timezone (Tz Database format https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)',
                  type: ['string', 'null'],
                },
                string: { description: 'Raw parsed broadcast string', type: ['string', 'null'] },
              },
              type: 'object',
            },
            producers: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            licensors: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            studios: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            genres: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            explicit_genres: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            themes: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            demographics: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeCharacters = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'Anime Characters Resource',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              character: {
                description: 'Character details',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  images: {
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL JPG',
                            type: ['string', 'null'],
                          },
                        },
                        type: 'object',
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL WEBP',
                            type: ['string', 'null'],
                          },
                        },
                        type: 'object',
                      },
                    },
                    type: 'object',
                  },
                  name: { description: 'Character Name', type: 'string' },
                },
                type: 'object',
              },
              role: { description: "Character's Role", type: 'string' },
              voice_actors: {
                type: 'array',
                items: {
                  properties: {
                    person: {
                      properties: {
                        mal_id: { type: 'integer' },
                        url: { type: 'string' },
                        images: {
                          properties: {
                            jpg: {
                              description: 'Available images in JPG',
                              properties: {
                                image_url: {
                                  description: 'Image URL JPG',
                                  type: ['string', 'null'],
                                },
                              },
                              type: 'object',
                            },
                          },
                          type: 'object',
                        },
                        name: { type: 'string' },
                      },
                      type: 'object',
                    },
                    language: { type: 'string' },
                  },
                  type: 'object',
                },
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeEpisodeById = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          episode: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: ['id', 'episode'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          description: 'Anime Episode Resource',
          properties: {
            mal_id: { description: 'MyAnimeList ID', type: 'integer' },
            url: { description: 'MyAnimeList URL', type: 'string' },
            title: { description: 'Title', type: 'string' },
            title_japanese: { description: 'Title Japanese', type: ['string', 'null'] },
            title_romanji: { description: 'title_romanji', type: ['string', 'null'] },
            duration: { description: 'Episode duration in seconds', type: ['integer', 'null'] },
            aired: { description: 'Aired Date ISO8601', type: ['string', 'null'] },
            filler: { description: 'Filler episode', type: 'boolean' },
            recap: { description: 'Recap episode', type: 'boolean' },
            synopsis: { description: 'Episode Synopsis', type: ['string', 'null'] },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeEpisodes = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Anime Episodes Resource',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: {
                description:
                  "MyAnimeList URL. This is the URL of the episode's video. If there is no video url, this will be null.",
                type: ['string', 'null'],
              },
              title: { description: 'Title', type: 'string' },
              title_japanese: { description: 'Title Japanese', type: ['string', 'null'] },
              title_romanji: { description: 'title_romanji', type: ['string', 'null'] },
              duration: { description: 'Episode duration in seconds', type: ['integer', 'null'] },
              aired: { description: 'Aired Date ISO8601', type: ['string', 'null'] },
              filler: { description: 'Filler episode', type: 'boolean' },
              recap: { description: 'Recap episode', type: 'boolean' },
              forum_url: { description: 'Episode discussion forum URL', type: ['string', 'null'] },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeExternal = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'External links',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: { name: { type: 'string' }, url: { type: 'string' } },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeForum = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
      {
        type: 'object',
        properties: {
          filter: {
            type: 'string',
            enum: ['all', 'episode', 'other'],
            $schema: 'http://json-schema.org/draft-04/schema#',
            description: 'Filter topics',
          },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Forum Resource',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              title: { description: 'Title', type: 'string' },
              date: { description: 'Post Date ISO8601', type: 'string' },
              author_username: { description: 'Author MyAnimeList Username', type: 'string' },
              author_url: { description: 'Author Profile URL', type: 'string' },
              comments: { description: 'Comment count', type: 'integer' },
              last_comment: {
                description: 'Last comment details',
                properties: {
                  url: { description: 'Last comment URL', type: 'string' },
                  author_username: { description: 'Author MyAnimeList Username', type: 'string' },
                  author_url: { description: 'Author Profile URL', type: 'string' },
                  date: {
                    description: 'Last comment date posted ISO8601',
                    type: ['string', 'null'],
                  },
                },
                type: 'object',
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeFullById = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          description: 'Full anime Resource',
          properties: {
            mal_id: { description: 'MyAnimeList ID', type: 'integer' },
            url: { description: 'MyAnimeList URL', type: 'string' },
            images: {
              properties: {
                jpg: {
                  description: 'Available images in JPG',
                  properties: {
                    image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    small_image_url: {
                      description: 'Small Image URL JPG',
                      type: ['string', 'null'],
                    },
                    large_image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
                webp: {
                  description: 'Available images in WEBP',
                  properties: {
                    image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                    small_image_url: {
                      description: 'Small Image URL WEBP',
                      type: ['string', 'null'],
                    },
                    large_image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            trailer: {
              description: 'Youtube Details',
              properties: {
                youtube_id: { description: 'YouTube ID', type: ['string', 'null'] },
                url: { description: 'YouTube URL', type: ['string', 'null'] },
                embed_url: { description: 'Parsed Embed URL', type: ['string', 'null'] },
              },
              type: 'object',
            },
            approved: {
              description: 'Whether the entry is pending approval on MAL or not',
              type: 'boolean',
            },
            titles: {
              description: 'All titles',
              type: 'array',
              items: {
                properties: {
                  type: { description: 'Title type', type: 'string' },
                  title: { description: 'Title value', type: 'string' },
                },
                type: 'object',
              },
            },
            title: { description: 'Title', type: 'string', deprecated: true },
            title_english: {
              description: 'English Title',
              type: ['string', 'null'],
              deprecated: true,
            },
            title_japanese: {
              description: 'Japanese Title',
              type: ['string', 'null'],
              deprecated: true,
            },
            title_synonyms: {
              description: 'Other Titles',
              type: 'array',
              items: { type: 'string' },
              deprecated: true,
            },
            type: {
              description: 'Anime Type\n\n`TV` `OVA` `Movie` `Special` `ONA` `Music`',
              type: ['string', 'null'],
              enum: ['TV', 'OVA', 'Movie', 'Special', 'ONA', 'Music'],
            },
            source: {
              description: 'Original Material/Source adapted from',
              type: ['string', 'null'],
            },
            episodes: { description: 'Episode count', type: ['integer', 'null'] },
            status: {
              description: 'Airing status\n\n`Finished Airing` `Currently Airing` `Not yet aired`',
              type: ['string', 'null'],
              enum: ['Finished Airing', 'Currently Airing', 'Not yet aired'],
            },
            airing: { description: 'Airing boolean', type: 'boolean' },
            aired: {
              description: 'Date range',
              properties: {
                from: { description: 'Date ISO8601', type: ['string', 'null'] },
                to: { description: 'Date ISO8601', type: ['string', 'null'] },
                prop: {
                  description: 'Date Prop',
                  properties: {
                    from: {
                      description: 'Date Prop From',
                      properties: {
                        day: { description: 'Day', type: ['integer', 'null'] },
                        month: { description: 'Month', type: ['integer', 'null'] },
                        year: { description: 'Year', type: ['integer', 'null'] },
                      },
                      type: 'object',
                    },
                    to: {
                      description: 'Date Prop To',
                      properties: {
                        day: { description: 'Day', type: ['integer', 'null'] },
                        month: { description: 'Month', type: ['integer', 'null'] },
                        year: { description: 'Year', type: ['integer', 'null'] },
                      },
                      type: 'object',
                    },
                    string: { description: 'Raw parsed string', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            duration: { description: 'Parsed raw duration', type: ['string', 'null'] },
            rating: {
              description:
                'Anime audience rating\n\n`G - All Ages` `PG - Children` `PG-13 - Teens 13 or older` `R - 17+ (violence & profanity)` `R+ - Mild Nudity` `Rx - Hentai`',
              type: ['string', 'null'],
              enum: [
                'G - All Ages',
                'PG - Children',
                'PG-13 - Teens 13 or older',
                'R - 17+ (violence & profanity)',
                'R+ - Mild Nudity',
                'Rx - Hentai',
              ],
            },
            score: {
              description: 'Score',
              type: ['number', 'null'],
              format: 'float',
              minimum: -3.402823669209385e38,
              maximum: 3.402823669209385e38,
            },
            scored_by: { description: 'Number of users', type: ['integer', 'null'] },
            rank: { description: 'Ranking', type: ['integer', 'null'] },
            popularity: { description: 'Popularity', type: ['integer', 'null'] },
            members: {
              description: 'Number of users who have added this entry to their list',
              type: ['integer', 'null'],
            },
            favorites: {
              description: 'Number of users who have favorited this entry',
              type: ['integer', 'null'],
            },
            synopsis: { description: 'Synopsis', type: ['string', 'null'] },
            background: { description: 'Background', type: ['string', 'null'] },
            season: {
              description: 'Season\n\n`summer` `winter` `spring` `fall`',
              type: ['string', 'null'],
              enum: ['summer', 'winter', 'spring', 'fall'],
            },
            year: { description: 'Year', type: ['integer', 'null'] },
            broadcast: {
              description: 'Broadcast Details',
              properties: {
                day: { description: 'Day of the week', type: ['string', 'null'] },
                time: { description: 'Time in 24 hour format', type: ['string', 'null'] },
                timezone: {
                  description:
                    'Timezone (Tz Database format https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)',
                  type: ['string', 'null'],
                },
                string: { description: 'Raw parsed broadcast string', type: ['string', 'null'] },
              },
              type: 'object',
            },
            producers: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            licensors: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            studios: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            genres: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            explicit_genres: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            themes: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            demographics: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            relations: {
              type: 'array',
              items: {
                properties: {
                  relation: { description: 'Relation type', type: 'string' },
                  entry: {
                    type: 'array',
                    items: {
                      description: 'Parsed URL Data',
                      properties: {
                        mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                        type: { description: 'Type of resource', type: 'string' },
                        name: { description: 'Resource Name/Title', type: 'string' },
                        url: { description: 'MyAnimeList URL', type: 'string' },
                      },
                      type: 'object',
                    },
                  },
                },
                type: 'object',
              },
            },
            theme: {
              properties: {
                openings: { type: 'array', items: { type: 'string' } },
                endings: { type: 'array', items: { type: 'string' } },
              },
              type: 'object',
            },
            external: {
              type: 'array',
              items: {
                properties: { name: { type: 'string' }, url: { type: 'string' } },
                type: 'object',
              },
            },
            streaming: {
              type: 'array',
              items: {
                properties: { name: { type: 'string' }, url: { type: 'string' } },
                type: 'object',
              },
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeGenres = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          filter: {
            description: 'Filter genres by type',
            type: 'string',
            enum: ['genres', 'explicit_genres', 'themes', 'demographics'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Genres Collection Resource',
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Genre Resource',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              name: { description: 'Genre Name', type: 'string' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              count: { description: "Genre's entry count", type: 'integer' },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeMoreInfo = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'More Info Resource',
      properties: {
        data: {
          properties: {
            moreinfo: {
              description: 'Additional information on the entry',
              type: ['string', 'null'],
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeNews = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Anime News Resource',
      type: 'object',
      properties: {
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              title: { description: 'Title', type: 'string' },
              date: { description: 'Post Date ISO8601', type: 'string' },
              author_username: { description: 'Author MyAnimeList Username', type: 'string' },
              author_url: { description: 'Author Profile URL', type: 'string' },
              forum_url: { description: 'Forum topic URL', type: 'string' },
              images: {
                type: 'object',
                properties: {
                  jpg: {
                    description: 'Available images in JPG',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    },
                  },
                },
              },
              comments: { description: 'Comment count', type: 'integer' },
              excerpt: { description: 'Excerpt', type: 'string' },
            },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimePictures = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'Pictures Resource',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              images: {
                properties: {
                  jpg: {
                    description: 'Available images in JPG',
                    properties: {
                      image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    },
                    type: 'object',
                  },
                },
                type: 'object',
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeRecommendations = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'Entry Recommendations Resource',
      properties: {
        data: {
          properties: {
            url: { description: 'Recommendation MyAnimeList URL', type: 'string' },
            votes: {
              description: 'Number of users who have recommended this entry',
              type: 'integer',
            },
          },
          type: 'array',
          items: {
            properties: {
              entry: {
                type: 'object',
                oneOf: [
                  {
                    properties: {
                      mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                      url: { description: 'MyAnimeList URL', type: 'string' },
                      images: {
                        properties: {
                          jpg: {
                            description: 'Available images in JPG',
                            properties: {
                              image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                              small_image_url: {
                                description: 'Small Image URL JPG',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL JPG',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                          webp: {
                            description: 'Available images in WEBP',
                            properties: {
                              image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              small_image_url: {
                                description: 'Small Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                        },
                        type: 'object',
                      },
                      title: { description: 'Entry title', type: 'string' },
                    },
                    type: 'object',
                  },
                  {
                    properties: {
                      mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                      url: { description: 'MyAnimeList URL', type: 'string' },
                      images: {
                        properties: {
                          jpg: {
                            description: 'Available images in JPG',
                            properties: {
                              image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                              small_image_url: {
                                description: 'Small Image URL JPG',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL JPG',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                          webp: {
                            description: 'Available images in WEBP',
                            properties: {
                              image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              small_image_url: {
                                description: 'Small Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                        },
                        type: 'object',
                      },
                      title: { description: 'Entry title', type: 'string' },
                    },
                    type: 'object',
                  },
                ],
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeRelations = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Related resources',
            properties: {
              relation: { description: 'Relation type', type: 'string' },
              entry: {
                description: 'Related entries',
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                  type: 'object',
                },
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeReviews = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Anime Reviews Resource',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  username: { description: 'MyAnimeList Username', type: 'string' },
                  url: { description: 'MyAnimeList Profile URL', type: 'string' },
                  images: {
                    type: 'object',
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                        },
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                        },
                      },
                    },
                  },
                },
              },
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: { description: 'MyAnimeList review URL', type: 'string' },
              type: { description: 'Entry type', type: 'string' },
              reactions: {
                description: 'User reaction count on the review',
                type: 'object',
                properties: {
                  overall: { description: 'Overall reaction count', type: 'integer' },
                  nice: { description: 'Nice reaction count', type: 'integer' },
                  love_it: { description: 'Love it reaction count', type: 'integer' },
                  funny: { description: 'Funny reaction count', type: 'integer' },
                  confusing: { description: 'Confusing reaction count', type: 'integer' },
                  informative: { description: 'Informative reaction count', type: 'integer' },
                  well_written: { description: 'Well written reaction count', type: 'integer' },
                  creative: { description: 'Creative reaction count', type: 'integer' },
                },
              },
              date: { description: 'Review created date ISO8601', type: 'string' },
              review: { description: 'Review content', type: 'string' },
              score: { description: 'Number of user votes on the Review', type: 'integer' },
              tags: { description: 'Review tags', type: 'array', items: { type: 'string' } },
              is_spoiler: { description: 'The review contains spoiler', type: 'boolean' },
              is_preliminary: {
                description: 'The review was made before the entry was completed',
                type: 'boolean',
              },
              episodes_watched: { description: 'Number of episodes watched', type: 'integer' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeSearch = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          sfw: {
            type: 'boolean',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              "'Safe For Work'. This is a flag. When supplied it will filter out entries according to the SFW Policy. You do not need to pass a value to it. e.g usage: `?sfw`",
          },
          unapproved: {
            type: 'boolean',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              'This is a flag. When supplied it will include entries which are unapproved. Unapproved entries on MyAnimeList are those that are user submitted and have not yet been approved by MAL to show up on other pages. They will have their own specifc pages and are often removed resulting in a 404 error. You do not need to pass a value to it. e.g usage: `?unapproved`',
          },
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          limit: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          q: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
          type: {
            description: 'Available Anime types',
            type: 'string',
            enum: ['tv', 'movie', 'ova', 'special', 'ona', 'music'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          score: { type: 'number', $schema: 'http://json-schema.org/draft-04/schema#' },
          min_score: {
            type: 'number',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description: 'Set a minimum score for results.',
          },
          max_score: {
            type: 'number',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description: 'Set a maximum score for results',
          },
          status: {
            description: 'Available Anime statuses',
            type: 'string',
            enum: ['airing', 'complete', 'upcoming'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          rating: {
            description:
              'Available Anime audience ratings<br><br><b>Ratings</b><br><ul><li>G - All Ages</li><li>PG - Children</li><li>PG-13 - Teens 13 or older</li><li>R - 17+ (violence & profanity)</li><li>R+ - Mild Nudity</li><li>Rx - Hentai</li></ul>',
            type: 'string',
            enum: ['g', 'pg', 'pg13', 'r17', 'r', 'rx'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          genres: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              'Filter by genre(s) IDs. Can pass multiple with a comma as a delimiter. e.g 1,2,3',
          },
          genres_exclude: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              'Exclude genre(s) IDs. Can pass multiple with a comma as a delimiter. e.g 1,2,3',
          },
          order_by: {
            description: 'Available Anime order_by properties',
            type: 'string',
            enum: [
              'mal_id',
              'title',
              'type',
              'rating',
              'start_date',
              'end_date',
              'episodes',
              'score',
              'scored_by',
              'rank',
              'popularity',
              'members',
              'favorites',
            ],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          sort: {
            description: 'Search query sort direction',
            type: 'string',
            enum: ['desc', 'asc'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          letter: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description: 'Return entries starting with the given letter',
          },
          producers: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              'Filter by producer(s) IDs. Can pass multiple with a comma as a delimiter. e.g 1,2,3',
          },
          start_date: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              'Filter by starting date. Format: YYYY-MM-DD. e.g `2022`, `2005-05`, `2005-01-01`',
          },
          end_date: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              'Filter by ending date. Format: YYYY-MM-DD. e.g `2022`, `2005-05`, `2005-01-01`',
          },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Anime Collection Resource',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Anime Resource',
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              images: {
                type: 'object',
                properties: {
                  jpg: {
                    description: 'Available images in JPG',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL JPG',
                        type: ['string', 'null'],
                      },
                      large_image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    },
                  },
                  webp: {
                    description: 'Available images in WEBP',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL WEBP',
                        type: ['string', 'null'],
                      },
                      large_image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                    },
                  },
                },
              },
              trailer: {
                description: 'Youtube Details',
                type: 'object',
                properties: {
                  youtube_id: { description: 'YouTube ID', type: ['string', 'null'] },
                  url: { description: 'YouTube URL', type: ['string', 'null'] },
                  embed_url: { description: 'Parsed Embed URL', type: ['string', 'null'] },
                },
              },
              approved: {
                description: 'Whether the entry is pending approval on MAL or not',
                type: 'boolean',
              },
              titles: {
                description: 'All titles',
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { description: 'Title type', type: 'string' },
                    title: { description: 'Title value', type: 'string' },
                  },
                },
              },
              title: { description: 'Title', type: 'string', deprecated: true },
              title_english: {
                description: 'English Title',
                type: ['string', 'null'],
                deprecated: true,
              },
              title_japanese: {
                description: 'Japanese Title',
                type: ['string', 'null'],
                deprecated: true,
              },
              title_synonyms: {
                description: 'Other Titles',
                type: 'array',
                deprecated: true,
                items: { type: 'string' },
              },
              type: {
                description: 'Anime Type\n\n`TV` `OVA` `Movie` `Special` `ONA` `Music`',
                type: ['string', 'null'],
                enum: ['TV', 'OVA', 'Movie', 'Special', 'ONA', 'Music'],
              },
              source: {
                description: 'Original Material/Source adapted from',
                type: ['string', 'null'],
              },
              episodes: { description: 'Episode count', type: ['integer', 'null'] },
              status: {
                description:
                  'Airing status\n\n`Finished Airing` `Currently Airing` `Not yet aired`',
                type: ['string', 'null'],
                enum: ['Finished Airing', 'Currently Airing', 'Not yet aired'],
              },
              airing: { description: 'Airing boolean', type: 'boolean' },
              aired: {
                description: 'Date range',
                type: 'object',
                properties: {
                  from: { description: 'Date ISO8601', type: ['string', 'null'] },
                  to: { description: 'Date ISO8601', type: ['string', 'null'] },
                  prop: {
                    description: 'Date Prop',
                    type: 'object',
                    properties: {
                      from: {
                        description: 'Date Prop From',
                        type: 'object',
                        properties: {
                          day: { description: 'Day', type: ['integer', 'null'] },
                          month: { description: 'Month', type: ['integer', 'null'] },
                          year: { description: 'Year', type: ['integer', 'null'] },
                        },
                      },
                      to: {
                        description: 'Date Prop To',
                        type: 'object',
                        properties: {
                          day: { description: 'Day', type: ['integer', 'null'] },
                          month: { description: 'Month', type: ['integer', 'null'] },
                          year: { description: 'Year', type: ['integer', 'null'] },
                        },
                      },
                      string: { description: 'Raw parsed string', type: ['string', 'null'] },
                    },
                  },
                },
              },
              duration: { description: 'Parsed raw duration', type: ['string', 'null'] },
              rating: {
                description:
                  'Anime audience rating\n\n`G - All Ages` `PG - Children` `PG-13 - Teens 13 or older` `R - 17+ (violence & profanity)` `R+ - Mild Nudity` `Rx - Hentai`',
                type: ['string', 'null'],
                enum: [
                  'G - All Ages',
                  'PG - Children',
                  'PG-13 - Teens 13 or older',
                  'R - 17+ (violence & profanity)',
                  'R+ - Mild Nudity',
                  'Rx - Hentai',
                ],
              },
              score: {
                description: 'Score',
                type: ['number', 'null'],
                format: 'float',
                minimum: -3.402823669209385e38,
                maximum: 3.402823669209385e38,
              },
              scored_by: { description: 'Number of users', type: ['integer', 'null'] },
              rank: { description: 'Ranking', type: ['integer', 'null'] },
              popularity: { description: 'Popularity', type: ['integer', 'null'] },
              members: {
                description: 'Number of users who have added this entry to their list',
                type: ['integer', 'null'],
              },
              favorites: {
                description: 'Number of users who have favorited this entry',
                type: ['integer', 'null'],
              },
              synopsis: { description: 'Synopsis', type: ['string', 'null'] },
              background: { description: 'Background', type: ['string', 'null'] },
              season: {
                description: 'Season\n\n`summer` `winter` `spring` `fall`',
                type: ['string', 'null'],
                enum: ['summer', 'winter', 'spring', 'fall'],
              },
              year: { description: 'Year', type: ['integer', 'null'] },
              broadcast: {
                description: 'Broadcast Details',
                type: 'object',
                properties: {
                  day: { description: 'Day of the week', type: ['string', 'null'] },
                  time: { description: 'Time in 24 hour format', type: ['string', 'null'] },
                  timezone: {
                    description:
                      'Timezone (Tz Database format https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)',
                    type: ['string', 'null'],
                  },
                  string: { description: 'Raw parsed broadcast string', type: ['string', 'null'] },
                },
              },
              producers: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              licensors: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              studios: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              genres: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              explicit_genres: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              themes: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              demographics: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
            items: {
              type: 'object',
              properties: {
                count: { type: 'integer' },
                total: { type: 'integer' },
                per_page: { type: 'integer' },
              },
            },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeStaff = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'Anime Staff Resource',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              person: {
                description: 'Person details',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  images: {
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                        },
                        type: 'object',
                      },
                    },
                    type: 'object',
                  },
                  name: { description: 'Name', type: 'string' },
                },
                type: 'object',
              },
              positions: {
                description: 'Staff Positions',
                type: 'array',
                items: { type: 'string' },
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeStatistics = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'Anime Statistics Resource',
      properties: {
        data: {
          properties: {
            watching: { description: 'Number of users watching the resource', type: 'integer' },
            completed: {
              description: 'Number of users who have completed the resource',
              type: 'integer',
            },
            on_hold: {
              description: 'Number of users who have put the resource on hold',
              type: 'integer',
            },
            dropped: {
              description: 'Number of users who have dropped the resource',
              type: 'integer',
            },
            plan_to_watch: {
              description: 'Number of users who have planned to watch the resource',
              type: 'integer',
            },
            total: {
              description: 'Total number of users who have the resource added to their lists',
              type: 'integer',
            },
            scores: {
              type: 'array',
              items: {
                properties: {
                  score: { description: 'Scoring value', type: 'integer' },
                  votes: { description: 'Number of votes for this score', type: 'integer' },
                  percentage: {
                    description: 'Percentage of votes for this score',
                    type: 'number',
                    format: 'float',
                    minimum: -3.402823669209385e38,
                    maximum: 3.402823669209385e38,
                  },
                },
                type: 'object',
              },
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeStreaming = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'External links',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: { name: { type: 'string' }, url: { type: 'string' } },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeThemes = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'Anime Opening and Ending Themes',
      properties: {
        data: {
          properties: {
            openings: { type: 'array', items: { type: 'string' } },
            endings: { type: 'array', items: { type: 'string' } },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeUserUpdates = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Anime User Updates Resource',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  username: { description: 'MyAnimeList Username', type: 'string' },
                  url: { description: 'MyAnimeList Profile URL', type: 'string' },
                  images: {
                    type: 'object',
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                        },
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                        },
                      },
                    },
                  },
                },
              },
              score: { description: 'User Score', type: ['integer', 'null'] },
              status: { description: 'User list status', type: 'string' },
              episodes_seen: { description: 'Number of episodes seen', type: ['integer', 'null'] },
              episodes_total: {
                description: 'Total number of episodes',
                type: ['integer', 'null'],
              },
              date: { description: 'Last updated date ISO8601', type: 'string' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeVideos = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'Anime Videos Resource',
      properties: {
        data: {
          properties: {
            promo: {
              type: 'array',
              items: {
                properties: {
                  title: { description: 'Title', type: 'string' },
                  trailer: {
                    description: 'Youtube Images',
                    type: 'object',
                    properties: {
                      youtube_id: { description: 'YouTube ID', type: ['string', 'null'] },
                      url: { description: 'YouTube URL', type: ['string', 'null'] },
                      embed_url: { description: 'Parsed Embed URL', type: ['string', 'null'] },
                      images: {
                        type: 'object',
                        properties: {
                          image_url: {
                            description: 'Default Image Size URL (120x90)',
                            type: ['string', 'null'],
                          },
                          small_image_url: {
                            description: 'Small Image Size URL (640x480)',
                            type: ['string', 'null'],
                          },
                          medium_image_url: {
                            description: 'Medium Image Size URL (320x180)',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Large Image Size URL (480x360)',
                            type: ['string', 'null'],
                          },
                          maximum_image_url: {
                            description: 'Maximum Image Size URL (1280x720)',
                            type: ['string', 'null'],
                          },
                        },
                      },
                    },
                  },
                },
                type: 'object',
              },
            },
            episodes: {
              type: 'array',
              items: {
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  title: { description: 'Title', type: 'string' },
                  episode: { description: 'Episode', type: 'string' },
                  images: {
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                        },
                        type: 'object',
                      },
                    },
                    type: 'object',
                  },
                },
                type: 'object',
              },
            },
            music_videos: {
              type: 'array',
              items: {
                properties: {
                  title: { description: 'Title', type: 'string' },
                  video: {
                    description: 'Youtube Images',
                    type: 'object',
                    properties: {
                      youtube_id: { description: 'YouTube ID', type: ['string', 'null'] },
                      url: { description: 'YouTube URL', type: ['string', 'null'] },
                      embed_url: { description: 'Parsed Embed URL', type: ['string', 'null'] },
                      images: {
                        type: 'object',
                        properties: {
                          image_url: {
                            description: 'Default Image Size URL (120x90)',
                            type: ['string', 'null'],
                          },
                          small_image_url: {
                            description: 'Small Image Size URL (640x480)',
                            type: ['string', 'null'],
                          },
                          medium_image_url: {
                            description: 'Medium Image Size URL (320x180)',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Large Image Size URL (480x360)',
                            type: ['string', 'null'],
                          },
                          maximum_image_url: {
                            description: 'Maximum Image Size URL (1280x720)',
                            type: ['string', 'null'],
                          },
                        },
                      },
                    },
                  },
                  meta: {
                    properties: {
                      title: { type: ['string', 'null'] },
                      author: { type: ['string', 'null'] },
                    },
                    type: 'object',
                  },
                },
                type: 'object',
              },
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetAnimeVideosEpisodes = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Anime Videos Episodes Resource',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID or Episode Number', type: 'integer' },
              title: { description: 'Episode Title', type: 'string' },
              episode: { description: 'Episode Subtitle', type: 'string' },
              url: { description: 'Episode Page URL', type: 'string' },
              images: {
                type: 'object',
                properties: {
                  jpg: {
                    description: 'Available images in JPG',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    },
                  },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetCharacterAnime = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'Character casted in anime',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              role: { description: "Character's Role", type: 'string' },
              anime: {
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  images: {
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL JPG',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL JPG',
                            type: ['string', 'null'],
                          },
                        },
                        type: 'object',
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL WEBP',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL WEBP',
                            type: ['string', 'null'],
                          },
                        },
                        type: 'object',
                      },
                    },
                    type: 'object',
                  },
                  title: { description: 'Entry title', type: 'string' },
                },
                type: 'object',
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetCharacterById = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          description: 'Character Resource',
          properties: {
            mal_id: { description: 'MyAnimeList ID', type: 'integer' },
            url: { description: 'MyAnimeList URL', type: 'string' },
            images: {
              properties: {
                jpg: {
                  description: 'Available images in JPG',
                  properties: {
                    image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    small_image_url: {
                      description: 'Small Image URL JPG',
                      type: ['string', 'null'],
                    },
                  },
                  type: 'object',
                },
                webp: {
                  description: 'Available images in WEBP',
                  properties: {
                    image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                    small_image_url: {
                      description: 'Small Image URL WEBP',
                      type: ['string', 'null'],
                    },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            name: { description: 'Name', type: 'string' },
            name_kanji: { description: 'Name', type: ['string', 'null'] },
            nicknames: { description: 'Other Names', type: 'array', items: { type: 'string' } },
            favorites: {
              description: 'Number of users who have favorited this entry',
              type: 'integer',
            },
            about: { description: 'Biography', type: ['string', 'null'] },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetCharacterFullById = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          description: 'Character Resource',
          properties: {
            mal_id: { description: 'MyAnimeList ID', type: 'integer' },
            url: { description: 'MyAnimeList URL', type: 'string' },
            images: {
              properties: {
                jpg: {
                  description: 'Available images in JPG',
                  properties: {
                    image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    small_image_url: {
                      description: 'Small Image URL JPG',
                      type: ['string', 'null'],
                    },
                  },
                  type: 'object',
                },
                webp: {
                  description: 'Available images in WEBP',
                  properties: {
                    image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                    small_image_url: {
                      description: 'Small Image URL WEBP',
                      type: ['string', 'null'],
                    },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            name: { description: 'Name', type: 'string' },
            name_kanji: { description: 'Name', type: ['string', 'null'] },
            nicknames: { description: 'Other Names', type: 'array', items: { type: 'string' } },
            favorites: {
              description: 'Number of users who have favorited this entry',
              type: 'integer',
            },
            about: { description: 'Biography', type: ['string', 'null'] },
            anime: {
              type: 'array',
              items: {
                properties: {
                  role: { description: "Character's Role", type: 'string' },
                  anime: {
                    properties: {
                      mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                      url: { description: 'MyAnimeList URL', type: 'string' },
                      images: {
                        properties: {
                          jpg: {
                            description: 'Available images in JPG',
                            properties: {
                              image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                              small_image_url: {
                                description: 'Small Image URL JPG',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL JPG',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                          webp: {
                            description: 'Available images in WEBP',
                            properties: {
                              image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              small_image_url: {
                                description: 'Small Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                        },
                        type: 'object',
                      },
                      title: { description: 'Entry title', type: 'string' },
                    },
                    type: 'object',
                  },
                },
                type: 'object',
              },
            },
            manga: {
              type: 'array',
              items: {
                properties: {
                  role: { description: "Character's Role", type: 'string' },
                  manga: {
                    properties: {
                      mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                      url: { description: 'MyAnimeList URL', type: 'string' },
                      images: {
                        properties: {
                          jpg: {
                            description: 'Available images in JPG',
                            properties: {
                              image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                              small_image_url: {
                                description: 'Small Image URL JPG',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL JPG',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                          webp: {
                            description: 'Available images in WEBP',
                            properties: {
                              image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              small_image_url: {
                                description: 'Small Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                        },
                        type: 'object',
                      },
                      title: { description: 'Entry title', type: 'string' },
                    },
                    type: 'object',
                  },
                },
                type: 'object',
              },
            },
            voices: {
              type: 'array',
              items: {
                properties: {
                  language: { description: "Character's Role", type: 'string' },
                  person: {
                    properties: {
                      mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                      url: { description: 'MyAnimeList URL', type: 'string' },
                      images: {
                        properties: {
                          jpg: {
                            description: 'Available images in JPG',
                            properties: {
                              image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                            },
                            type: 'object',
                          },
                        },
                        type: 'object',
                      },
                      name: { description: 'Entry name', type: 'string' },
                    },
                    type: 'object',
                  },
                },
                type: 'object',
              },
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetCharacterManga = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'Character casted in manga',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              role: { description: "Character's Role", type: 'string' },
              manga: {
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  images: {
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL JPG',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL JPG',
                            type: ['string', 'null'],
                          },
                        },
                        type: 'object',
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL WEBP',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL WEBP',
                            type: ['string', 'null'],
                          },
                        },
                        type: 'object',
                      },
                    },
                    type: 'object',
                  },
                  title: { description: 'Entry title', type: 'string' },
                },
                type: 'object',
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetCharacterPictures = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'Character Pictures',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              image_url: { description: 'Default JPG Image Size URL', type: ['string', 'null'] },
              large_image_url: {
                description: 'Large JPG Image Size URL',
                type: ['string', 'null'],
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetCharacterVoiceActors = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'Character voice actors',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              language: { description: "Character's Role", type: 'string' },
              person: {
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  images: {
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                        },
                        type: 'object',
                      },
                    },
                    type: 'object',
                  },
                  name: { description: 'Entry name', type: 'string' },
                },
                type: 'object',
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetCharactersSearch = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          limit: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          q: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
          order_by: {
            description: 'Available Character order_by properties',
            type: 'string',
            enum: ['mal_id', 'name', 'favorites'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          sort: {
            description: 'Search query sort direction',
            type: 'string',
            enum: ['desc', 'asc'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          letter: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description: 'Return entries starting with the given letter',
          },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Characters Search Resource',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Character Resource',
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              images: {
                type: 'object',
                properties: {
                  jpg: {
                    description: 'Available images in JPG',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL JPG',
                        type: ['string', 'null'],
                      },
                    },
                  },
                  webp: {
                    description: 'Available images in WEBP',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL WEBP',
                        type: ['string', 'null'],
                      },
                    },
                  },
                },
              },
              name: { description: 'Name', type: 'string' },
              name_kanji: { description: 'Name', type: ['string', 'null'] },
              nicknames: { description: 'Other Names', type: 'array', items: { type: 'string' } },
              favorites: {
                description: 'Number of users who have favorited this entry',
                type: 'integer',
              },
              about: { description: 'Biography', type: ['string', 'null'] },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
            items: {
              type: 'object',
              properties: {
                count: { type: 'integer' },
                total: { type: 'integer' },
                per_page: { type: 'integer' },
              },
            },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetClubMembers = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      type: 'object',
      description: 'Club Member',
      properties: {
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              jpg: {
                description: 'Available images in JPG',
                type: 'object',
                properties: {
                  image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                },
              },
              webp: {
                description: 'Available images in WEBP',
                type: 'object',
                properties: {
                  image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                },
              },
            },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetClubRelations = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'Club Relations',
      properties: {
        data: {
          properties: {
            anime: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            manga: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            characters: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetClubStaff = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'Club Staff Resource',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              url: { description: 'User URL', type: 'string' },
              username: { description: "User's username", type: 'string' },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetClubsById = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          description: 'Club Resource',
          properties: {
            mal_id: { description: 'MyAnimeList ID', type: 'integer' },
            name: { description: 'Club name', type: 'string' },
            url: { description: 'Club URL', type: 'string' },
            images: {
              properties: {
                jpg: {
                  description: 'Available images in JPG',
                  properties: {
                    image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            members: { description: 'Number of club members', type: 'integer' },
            category: {
              description:
                'Club Category\n\n`actors & artists` `anime` `characters` `cities & neighborhoods` `companies` `conventions` `games` `japan` `manga` `music` `others` `schools`',
              type: 'string',
              enum: [
                'actors & artists',
                'anime',
                'characters',
                'cities & neighborhoods',
                'companies',
                'conventions',
                'games',
                'japan',
                'manga',
                'music',
                'others',
                'schools',
              ],
            },
            created: { description: 'Date Created ISO8601', type: 'string' },
            access: {
              description: 'Club access\n\n`public` `private` `secret`',
              type: 'string',
              enum: ['public', 'private', 'secret'],
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetClubsSearch = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          limit: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          q: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
          type: {
            description: 'Club Search Query Type',
            type: 'string',
            enum: ['public', 'private', 'secret'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          category: {
            description: 'Club Search Query Category',
            type: 'string',
            enum: [
              'anime',
              'manga',
              'actors_and_artists',
              'characters',
              'cities_and_neighborhoods',
              'companies',
              'conventions',
              'games',
              'japan',
              'music',
              'other',
              'schools',
            ],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          order_by: {
            description: 'Club Search Query OrderBy',
            type: 'string',
            enum: ['mal_id', 'name', 'members_count', 'created'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          sort: {
            description: 'Search query sort direction',
            type: 'string',
            enum: ['desc', 'asc'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          letter: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description: 'Return entries starting with the given letter',
          },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Clubs Search Resource',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Club Resource',
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              name: { description: 'Club name', type: 'string' },
              url: { description: 'Club URL', type: 'string' },
              images: {
                type: 'object',
                properties: {
                  jpg: {
                    description: 'Available images in JPG',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    },
                  },
                },
              },
              members: { description: 'Number of club members', type: 'integer' },
              category: {
                description:
                  'Club Category\n\n`actors & artists` `anime` `characters` `cities & neighborhoods` `companies` `conventions` `games` `japan` `manga` `music` `others` `schools`',
                type: 'string',
                enum: [
                  'actors & artists',
                  'anime',
                  'characters',
                  'cities & neighborhoods',
                  'companies',
                  'conventions',
                  'games',
                  'japan',
                  'manga',
                  'music',
                  'others',
                  'schools',
                ],
              },
              created: { description: 'Date Created ISO8601', type: 'string' },
              access: {
                description: 'Club access\n\n`public` `private` `secret`',
                type: 'string',
                enum: ['public', 'private', 'secret'],
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetMagazines = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          limit: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          q: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
          order_by: {
            description: 'Order by magazine data',
            type: 'string',
            enum: ['mal_id', 'name', 'count'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          sort: {
            description: 'Search query sort direction',
            type: 'string',
            enum: ['desc', 'asc'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          letter: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description: 'Return entries starting with the given letter',
          },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Magazine Collection Resource',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Magazine Resource',
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              name: { description: 'Magazine Name', type: 'string' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              count: { description: "Magazine's manga count", type: 'integer' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetMangaById = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          description: 'Manga Resource',
          properties: {
            mal_id: { description: 'MyAnimeList ID', type: 'integer' },
            url: { description: 'MyAnimeList URL', type: 'string' },
            images: {
              properties: {
                jpg: {
                  description: 'Available images in JPG',
                  properties: {
                    image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    small_image_url: {
                      description: 'Small Image URL JPG',
                      type: ['string', 'null'],
                    },
                    large_image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
                webp: {
                  description: 'Available images in WEBP',
                  properties: {
                    image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                    small_image_url: {
                      description: 'Small Image URL WEBP',
                      type: ['string', 'null'],
                    },
                    large_image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            approved: {
              description: 'Whether the entry is pending approval on MAL or not',
              type: 'boolean',
            },
            titles: {
              description: 'All Titles',
              type: 'array',
              items: {
                properties: {
                  type: { description: 'Title type', type: 'string' },
                  title: { description: 'Title value', type: 'string' },
                },
                type: 'object',
              },
            },
            title: { description: 'Title', type: 'string', deprecated: true },
            title_english: {
              description: 'English Title',
              type: ['string', 'null'],
              deprecated: true,
            },
            title_japanese: {
              description: 'Japanese Title',
              type: ['string', 'null'],
              deprecated: true,
            },
            type: {
              description:
                'Manga Type\n\n`Manga` `Novel` `Light Novel` `One-shot` `Doujinshi` `Manhua` `Manhwa` `OEL`',
              type: ['string', 'null'],
              enum: [
                'Manga',
                'Novel',
                'Light Novel',
                'One-shot',
                'Doujinshi',
                'Manhua',
                'Manhwa',
                'OEL',
              ],
            },
            chapters: { description: 'Chapter count', type: ['integer', 'null'] },
            volumes: { description: 'Volume count', type: ['integer', 'null'] },
            status: {
              description:
                'Publishing status\n\n`Finished` `Publishing` `On Hiatus` `Discontinued` `Not yet published`',
              type: 'string',
              enum: ['Finished', 'Publishing', 'On Hiatus', 'Discontinued', 'Not yet published'],
            },
            publishing: { description: 'Publishing boolean', type: 'boolean' },
            published: {
              description: 'Date range',
              properties: {
                from: { description: 'Date ISO8601', type: ['string', 'null'] },
                to: { description: 'Date ISO8601', type: ['string', 'null'] },
                prop: {
                  description: 'Date Prop',
                  properties: {
                    from: {
                      description: 'Date Prop From',
                      properties: {
                        day: { description: 'Day', type: ['integer', 'null'] },
                        month: { description: 'Month', type: ['integer', 'null'] },
                        year: { description: 'Year', type: ['integer', 'null'] },
                      },
                      type: 'object',
                    },
                    to: {
                      description: 'Date Prop To',
                      properties: {
                        day: { description: 'Day', type: ['integer', 'null'] },
                        month: { description: 'Month', type: ['integer', 'null'] },
                        year: { description: 'Year', type: ['integer', 'null'] },
                      },
                      type: 'object',
                    },
                    string: { description: 'Raw parsed string', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            score: {
              description: 'Score',
              type: ['number', 'null'],
              format: 'float',
              minimum: -3.402823669209385e38,
              maximum: 3.402823669209385e38,
            },
            scored_by: { description: 'Number of users', type: ['integer', 'null'] },
            rank: { description: 'Ranking', type: ['integer', 'null'] },
            popularity: { description: 'Popularity', type: ['integer', 'null'] },
            members: {
              description: 'Number of users who have added this entry to their list',
              type: ['integer', 'null'],
            },
            favorites: {
              description: 'Number of users who have favorited this entry',
              type: ['integer', 'null'],
            },
            synopsis: { description: 'Synopsis', type: ['string', 'null'] },
            background: { description: 'Background', type: ['string', 'null'] },
            authors: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            serializations: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            genres: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            explicit_genres: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            themes: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            demographics: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetMangaCharacters = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'Manga Characters Resource',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              character: {
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  images: {
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL JPG',
                            type: ['string', 'null'],
                          },
                        },
                        type: 'object',
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL WEBP',
                            type: ['string', 'null'],
                          },
                        },
                        type: 'object',
                      },
                    },
                    type: 'object',
                  },
                  name: { description: 'Entry name', type: 'string' },
                },
                type: 'object',
              },
              role: { description: "Character's Role", type: 'string' },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetMangaExternal = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'External links',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: { name: { type: 'string' }, url: { type: 'string' } },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetMangaFullById = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          description: 'Manga Resource',
          properties: {
            mal_id: { description: 'MyAnimeList ID', type: 'integer' },
            url: { description: 'MyAnimeList URL', type: 'string' },
            images: {
              properties: {
                jpg: {
                  description: 'Available images in JPG',
                  properties: {
                    image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    small_image_url: {
                      description: 'Small Image URL JPG',
                      type: ['string', 'null'],
                    },
                    large_image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
                webp: {
                  description: 'Available images in WEBP',
                  properties: {
                    image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                    small_image_url: {
                      description: 'Small Image URL WEBP',
                      type: ['string', 'null'],
                    },
                    large_image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            approved: {
              description: 'Whether the entry is pending approval on MAL or not',
              type: 'boolean',
            },
            titles: {
              description: 'All Titles',
              type: 'array',
              items: {
                properties: {
                  type: { description: 'Title type', type: 'string' },
                  title: { description: 'Title value', type: 'string' },
                },
                type: 'object',
              },
            },
            title: { description: 'Title', type: 'string', deprecated: true },
            title_english: {
              description: 'English Title',
              type: ['string', 'null'],
              deprecated: true,
            },
            title_japanese: {
              description: 'Japanese Title',
              type: ['string', 'null'],
              deprecated: true,
            },
            title_synonyms: {
              description: 'Other Titles',
              type: 'array',
              items: { type: 'string' },
              deprecated: true,
            },
            type: {
              description:
                'Manga Type\n\n`Manga` `Novel` `Light Novel` `One-shot` `Doujinshi` `Manhua` `Manhwa` `OEL`',
              type: ['string', 'null'],
              enum: [
                'Manga',
                'Novel',
                'Light Novel',
                'One-shot',
                'Doujinshi',
                'Manhua',
                'Manhwa',
                'OEL',
              ],
            },
            chapters: { description: 'Chapter count', type: ['integer', 'null'] },
            volumes: { description: 'Volume count', type: ['integer', 'null'] },
            status: {
              description:
                'Publishing status\n\n`Finished` `Publishing` `On Hiatus` `Discontinued` `Not yet published`',
              type: 'string',
              enum: ['Finished', 'Publishing', 'On Hiatus', 'Discontinued', 'Not yet published'],
            },
            publishing: { description: 'Publishing boolean', type: 'boolean' },
            published: {
              description: 'Date range',
              properties: {
                from: { description: 'Date ISO8601', type: ['string', 'null'] },
                to: { description: 'Date ISO8601', type: ['string', 'null'] },
                prop: {
                  description: 'Date Prop',
                  properties: {
                    from: {
                      description: 'Date Prop From',
                      properties: {
                        day: { description: 'Day', type: ['integer', 'null'] },
                        month: { description: 'Month', type: ['integer', 'null'] },
                        year: { description: 'Year', type: ['integer', 'null'] },
                      },
                      type: 'object',
                    },
                    to: {
                      description: 'Date Prop To',
                      properties: {
                        day: { description: 'Day', type: ['integer', 'null'] },
                        month: { description: 'Month', type: ['integer', 'null'] },
                        year: { description: 'Year', type: ['integer', 'null'] },
                      },
                      type: 'object',
                    },
                    string: { description: 'Raw parsed string', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            score: {
              description: 'Score',
              type: ['number', 'null'],
              format: 'float',
              minimum: -3.402823669209385e38,
              maximum: 3.402823669209385e38,
            },
            scored_by: { description: 'Number of users', type: ['integer', 'null'] },
            rank: { description: 'Ranking', type: ['integer', 'null'] },
            popularity: { description: 'Popularity', type: ['integer', 'null'] },
            members: {
              description: 'Number of users who have added this entry to their list',
              type: ['integer', 'null'],
            },
            favorites: {
              description: 'Number of users who have favorited this entry',
              type: ['integer', 'null'],
            },
            synopsis: { description: 'Synopsis', type: ['string', 'null'] },
            background: { description: 'Background', type: ['string', 'null'] },
            authors: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            serializations: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            genres: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            explicit_genres: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            themes: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            demographics: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            relations: {
              type: 'array',
              items: {
                properties: {
                  relation: { description: 'Relation type', type: 'string' },
                  entry: {
                    type: 'array',
                    items: {
                      description: 'Parsed URL Data',
                      properties: {
                        mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                        type: { description: 'Type of resource', type: 'string' },
                        name: { description: 'Resource Name/Title', type: 'string' },
                        url: { description: 'MyAnimeList URL', type: 'string' },
                      },
                      type: 'object',
                    },
                  },
                },
                type: 'object',
              },
            },
            external: {
              type: 'array',
              items: {
                properties: { name: { type: 'string' }, url: { type: 'string' } },
                type: 'object',
              },
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetMangaGenres = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          filter: {
            description: 'Filter genres by type',
            type: 'string',
            enum: ['genres', 'explicit_genres', 'themes', 'demographics'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Genres Collection Resource',
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Genre Resource',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              name: { description: 'Genre Name', type: 'string' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              count: { description: "Genre's entry count", type: 'integer' },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetMangaMoreInfo = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'More Info Resource',
      properties: {
        data: {
          properties: {
            moreinfo: {
              description: 'Additional information on the entry',
              type: ['string', 'null'],
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetMangaNews = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Manga News Resource',
      type: 'object',
      properties: {
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              title: { description: 'Title', type: 'string' },
              date: { description: 'Post Date ISO8601', type: 'string' },
              author_username: { description: 'Author MyAnimeList Username', type: 'string' },
              author_url: { description: 'Author Profile URL', type: 'string' },
              forum_url: { description: 'Forum topic URL', type: 'string' },
              images: {
                type: 'object',
                properties: {
                  jpg: {
                    description: 'Available images in JPG',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    },
                  },
                },
              },
              comments: { description: 'Comment count', type: 'integer' },
              excerpt: { description: 'Excerpt', type: 'string' },
            },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetMangaPictures = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'Manga Pictures',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              jpg: {
                description: 'Available images in JPG',
                properties: {
                  image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                  small_image_url: { description: 'Small Image URL JPG', type: ['string', 'null'] },
                  large_image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                },
                type: 'object',
              },
              webp: {
                description: 'Available images in WEBP',
                properties: {
                  image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                  small_image_url: {
                    description: 'Small Image URL WEBP',
                    type: ['string', 'null'],
                  },
                  large_image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                },
                type: 'object',
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetMangaRecommendations = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'Entry Recommendations Resource',
      properties: {
        data: {
          properties: {
            url: { description: 'Recommendation MyAnimeList URL', type: 'string' },
            votes: {
              description: 'Number of users who have recommended this entry',
              type: 'integer',
            },
          },
          type: 'array',
          items: {
            properties: {
              entry: {
                type: 'object',
                oneOf: [
                  {
                    properties: {
                      mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                      url: { description: 'MyAnimeList URL', type: 'string' },
                      images: {
                        properties: {
                          jpg: {
                            description: 'Available images in JPG',
                            properties: {
                              image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                              small_image_url: {
                                description: 'Small Image URL JPG',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL JPG',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                          webp: {
                            description: 'Available images in WEBP',
                            properties: {
                              image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              small_image_url: {
                                description: 'Small Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                        },
                        type: 'object',
                      },
                      title: { description: 'Entry title', type: 'string' },
                    },
                    type: 'object',
                  },
                  {
                    properties: {
                      mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                      url: { description: 'MyAnimeList URL', type: 'string' },
                      images: {
                        properties: {
                          jpg: {
                            description: 'Available images in JPG',
                            properties: {
                              image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                              small_image_url: {
                                description: 'Small Image URL JPG',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL JPG',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                          webp: {
                            description: 'Available images in WEBP',
                            properties: {
                              image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              small_image_url: {
                                description: 'Small Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                        },
                        type: 'object',
                      },
                      title: { description: 'Entry title', type: 'string' },
                    },
                    type: 'object',
                  },
                ],
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetMangaRelations = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Related resources',
            properties: {
              relation: { description: 'Relation type', type: 'string' },
              entry: {
                description: 'Related entries',
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                  type: 'object',
                },
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetMangaReviews = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Manga Reviews Resource',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  username: { description: 'MyAnimeList Username', type: 'string' },
                  url: { description: 'MyAnimeList Profile URL', type: 'string' },
                  images: {
                    type: 'object',
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                        },
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                        },
                      },
                    },
                  },
                },
              },
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: { description: 'MyAnimeList review URL', type: 'string' },
              type: { description: 'Entry type', type: 'string' },
              reactions: {
                description: 'User reaction count on the review',
                type: 'object',
                properties: {
                  overall: { description: 'Overall reaction count', type: 'integer' },
                  nice: { description: 'Nice reaction count', type: 'integer' },
                  love_it: { description: 'Love it reaction count', type: 'integer' },
                  funny: { description: 'Funny reaction count', type: 'integer' },
                  confusing: { description: 'Confusing reaction count', type: 'integer' },
                  informative: { description: 'Informative reaction count', type: 'integer' },
                  well_written: { description: 'Well written reaction count', type: 'integer' },
                  creative: { description: 'Creative reaction count', type: 'integer' },
                },
              },
              date: { description: 'Review created date ISO8601', type: 'string' },
              review: { description: 'Review content', type: 'string' },
              score: { description: 'Number of user votes on the Review', type: 'integer' },
              tags: { description: 'Review tags', type: 'array', items: { type: 'string' } },
              is_spoiler: { description: 'The review contains spoiler', type: 'boolean' },
              is_preliminary: {
                description: 'The review was made before the entry was completed',
                type: 'boolean',
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetMangaSearch = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          sfw: {
            type: 'boolean',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              "'Safe For Work'. This is a flag. When supplied it will filter out entries according to the SFW Policy. You do not need to pass a value to it. e.g usage: `?sfw`",
          },
          unapproved: {
            type: 'boolean',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              'This is a flag. When supplied it will include entries which are unapproved. Unapproved entries on MyAnimeList are those that are user submitted and have not yet been approved by MAL to show up on other pages. They will have their own specifc pages and are often removed resulting in a 404 error. You do not need to pass a value to it. e.g usage: `?unapproved`',
          },
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          limit: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          q: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
          type: {
            description: 'Available Manga types',
            type: 'string',
            enum: ['manga', 'novel', 'lightnovel', 'oneshot', 'doujin', 'manhwa', 'manhua'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          score: { type: 'number', $schema: 'http://json-schema.org/draft-04/schema#' },
          min_score: {
            type: 'number',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description: 'Set a minimum score for results.',
          },
          max_score: {
            type: 'number',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description: 'Set a maximum score for results',
          },
          status: {
            description: 'Available Manga statuses',
            type: 'string',
            enum: ['publishing', 'complete', 'hiatus', 'discontinued', 'upcoming'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          genres: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              'Filter by genre(s) IDs. Can pass multiple with a comma as a delimiter. e.g 1,2,3',
          },
          genres_exclude: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              'Exclude genre(s) IDs. Can pass multiple with a comma as a delimiter. e.g 1,2,3',
          },
          order_by: {
            description: 'Available Manga order_by properties',
            type: 'string',
            enum: [
              'mal_id',
              'title',
              'start_date',
              'end_date',
              'chapters',
              'volumes',
              'score',
              'scored_by',
              'rank',
              'popularity',
              'members',
              'favorites',
            ],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          sort: {
            description: 'Search query sort direction',
            type: 'string',
            enum: ['desc', 'asc'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          letter: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description: 'Return entries starting with the given letter',
          },
          magazines: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              'Filter by magazine(s) IDs. Can pass multiple with a comma as a delimiter. e.g 1,2,3',
          },
          start_date: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              'Filter by starting date. Format: YYYY-MM-DD. e.g `2022`, `2005-05`, `2005-01-01`',
          },
          end_date: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              'Filter by ending date. Format: YYYY-MM-DD. e.g `2022`, `2005-05`, `2005-01-01`',
          },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Manga Search Resource',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Manga Resource',
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              images: {
                type: 'object',
                properties: {
                  jpg: {
                    description: 'Available images in JPG',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL JPG',
                        type: ['string', 'null'],
                      },
                      large_image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    },
                  },
                  webp: {
                    description: 'Available images in WEBP',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL WEBP',
                        type: ['string', 'null'],
                      },
                      large_image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                    },
                  },
                },
              },
              approved: {
                description: 'Whether the entry is pending approval on MAL or not',
                type: 'boolean',
              },
              titles: {
                description: 'All Titles',
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { description: 'Title type', type: 'string' },
                    title: { description: 'Title value', type: 'string' },
                  },
                },
              },
              title: { description: 'Title', type: 'string', deprecated: true },
              title_english: {
                description: 'English Title',
                type: ['string', 'null'],
                deprecated: true,
              },
              title_japanese: {
                description: 'Japanese Title',
                type: ['string', 'null'],
                deprecated: true,
              },
              type: {
                description:
                  'Manga Type\n\n`Manga` `Novel` `Light Novel` `One-shot` `Doujinshi` `Manhua` `Manhwa` `OEL`',
                type: ['string', 'null'],
                enum: [
                  'Manga',
                  'Novel',
                  'Light Novel',
                  'One-shot',
                  'Doujinshi',
                  'Manhua',
                  'Manhwa',
                  'OEL',
                ],
              },
              chapters: { description: 'Chapter count', type: ['integer', 'null'] },
              volumes: { description: 'Volume count', type: ['integer', 'null'] },
              status: {
                description:
                  'Publishing status\n\n`Finished` `Publishing` `On Hiatus` `Discontinued` `Not yet published`',
                type: 'string',
                enum: ['Finished', 'Publishing', 'On Hiatus', 'Discontinued', 'Not yet published'],
              },
              publishing: { description: 'Publishing boolean', type: 'boolean' },
              published: {
                description: 'Date range',
                type: 'object',
                properties: {
                  from: { description: 'Date ISO8601', type: ['string', 'null'] },
                  to: { description: 'Date ISO8601', type: ['string', 'null'] },
                  prop: {
                    description: 'Date Prop',
                    type: 'object',
                    properties: {
                      from: {
                        description: 'Date Prop From',
                        type: 'object',
                        properties: {
                          day: { description: 'Day', type: ['integer', 'null'] },
                          month: { description: 'Month', type: ['integer', 'null'] },
                          year: { description: 'Year', type: ['integer', 'null'] },
                        },
                      },
                      to: {
                        description: 'Date Prop To',
                        type: 'object',
                        properties: {
                          day: { description: 'Day', type: ['integer', 'null'] },
                          month: { description: 'Month', type: ['integer', 'null'] },
                          year: { description: 'Year', type: ['integer', 'null'] },
                        },
                      },
                      string: { description: 'Raw parsed string', type: ['string', 'null'] },
                    },
                  },
                },
              },
              score: {
                description: 'Score',
                type: ['number', 'null'],
                format: 'float',
                minimum: -3.402823669209385e38,
                maximum: 3.402823669209385e38,
              },
              scored_by: { description: 'Number of users', type: ['integer', 'null'] },
              rank: { description: 'Ranking', type: ['integer', 'null'] },
              popularity: { description: 'Popularity', type: ['integer', 'null'] },
              members: {
                description: 'Number of users who have added this entry to their list',
                type: ['integer', 'null'],
              },
              favorites: {
                description: 'Number of users who have favorited this entry',
                type: ['integer', 'null'],
              },
              synopsis: { description: 'Synopsis', type: ['string', 'null'] },
              background: { description: 'Background', type: ['string', 'null'] },
              authors: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              serializations: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              genres: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              explicit_genres: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              themes: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              demographics: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
            items: {
              type: 'object',
              properties: {
                count: { type: 'integer' },
                total: { type: 'integer' },
                per_page: { type: 'integer' },
              },
            },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetMangaStatistics = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'Manga Statistics Resource',
      properties: {
        data: {
          properties: {
            reading: { description: 'Number of users reading the resource', type: 'integer' },
            completed: {
              description: 'Number of users who have completed the resource',
              type: 'integer',
            },
            on_hold: {
              description: 'Number of users who have put the resource on hold',
              type: 'integer',
            },
            dropped: {
              description: 'Number of users who have dropped the resource',
              type: 'integer',
            },
            plan_to_read: {
              description: 'Number of users who have planned to read the resource',
              type: 'integer',
            },
            total: {
              description: 'Total number of users who have the resource added to their lists',
              type: 'integer',
            },
            scores: {
              type: 'array',
              items: {
                properties: {
                  score: { description: 'Scoring value', type: 'integer' },
                  votes: { description: 'Number of votes for this score', type: 'integer' },
                  percentage: {
                    description: 'Percentage of votes for this score',
                    type: 'number',
                    format: 'float',
                    minimum: -3.402823669209385e38,
                    maximum: 3.402823669209385e38,
                  },
                },
                type: 'object',
              },
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetMangaTopics = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
      {
        type: 'object',
        properties: {
          filter: {
            type: 'string',
            enum: ['all', 'episode', 'other'],
            $schema: 'http://json-schema.org/draft-04/schema#',
            description: 'Filter topics',
          },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Forum Resource',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              title: { description: 'Title', type: 'string' },
              date: { description: 'Post Date ISO8601', type: 'string' },
              author_username: { description: 'Author MyAnimeList Username', type: 'string' },
              author_url: { description: 'Author Profile URL', type: 'string' },
              comments: { description: 'Comment count', type: 'integer' },
              last_comment: {
                description: 'Last comment details',
                properties: {
                  url: { description: 'Last comment URL', type: 'string' },
                  author_username: { description: 'Author MyAnimeList Username', type: 'string' },
                  author_url: { description: 'Author Profile URL', type: 'string' },
                  date: {
                    description: 'Last comment date posted ISO8601',
                    type: ['string', 'null'],
                  },
                },
                type: 'object',
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetMangaUserUpdates = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Manga User Updates Resource',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  username: { description: 'MyAnimeList Username', type: 'string' },
                  url: { description: 'MyAnimeList Profile URL', type: 'string' },
                  images: {
                    type: 'object',
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                        },
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                        },
                      },
                    },
                  },
                },
              },
              score: { description: 'User Score', type: ['integer', 'null'] },
              status: { description: 'User list status', type: 'string' },
              volumes_read: { description: 'Number of volumes read', type: 'integer' },
              volumes_total: { description: 'Total number of volumes', type: 'integer' },
              chapters_read: { description: 'Number of chapters read', type: 'integer' },
              chapters_total: { description: 'Total number of chapters', type: 'integer' },
              date: { description: 'Last updated date ISO8601', type: 'string' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetPeopleSearch = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          limit: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          q: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
          order_by: {
            description: 'Available People order_by properties',
            type: 'string',
            enum: ['mal_id', 'name', 'birthday', 'favorites'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          sort: {
            description: 'Search query sort direction',
            type: 'string',
            enum: ['desc', 'asc'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          letter: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description: 'Return entries starting with the given letter',
          },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'People Search',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Person Resource',
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              website_url: { description: "Person's website URL", type: ['string', 'null'] },
              images: {
                type: 'object',
                properties: {
                  jpg: {
                    description: 'Available images in JPG',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    },
                  },
                },
              },
              name: { description: 'Name', type: 'string' },
              given_name: { description: 'Given Name', type: ['string', 'null'] },
              family_name: { description: 'Family Name', type: ['string', 'null'] },
              alternate_names: {
                description: 'Other Names',
                type: 'array',
                items: { type: 'string' },
              },
              birthday: { description: 'Birthday Date ISO8601', type: ['string', 'null'] },
              favorites: {
                description: 'Number of users who have favorited this entry',
                type: 'integer',
              },
              about: { description: 'Biography', type: ['string', 'null'] },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
            items: {
              type: 'object',
              properties: {
                count: { type: 'integer' },
                total: { type: 'integer' },
                per_page: { type: 'integer' },
              },
            },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetPersonAnime = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'Person anime staff positions',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              position: { description: "Person's position", type: 'string' },
              anime: {
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  images: {
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL JPG',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL JPG',
                            type: ['string', 'null'],
                          },
                        },
                        type: 'object',
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL WEBP',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL WEBP',
                            type: ['string', 'null'],
                          },
                        },
                        type: 'object',
                      },
                    },
                    type: 'object',
                  },
                  title: { description: 'Entry title', type: 'string' },
                },
                type: 'object',
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetPersonById = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          description: 'Person Resource',
          properties: {
            mal_id: { description: 'MyAnimeList ID', type: 'integer' },
            url: { description: 'MyAnimeList URL', type: 'string' },
            website_url: { description: "Person's website URL", type: ['string', 'null'] },
            images: {
              properties: {
                jpg: {
                  description: 'Available images in JPG',
                  properties: {
                    image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            name: { description: 'Name', type: 'string' },
            given_name: { description: 'Given Name', type: ['string', 'null'] },
            family_name: { description: 'Family Name', type: ['string', 'null'] },
            alternate_names: {
              description: 'Other Names',
              type: 'array',
              items: { type: 'string' },
            },
            birthday: { description: 'Birthday Date ISO8601', type: ['string', 'null'] },
            favorites: {
              description: 'Number of users who have favorited this entry',
              type: 'integer',
            },
            about: { description: 'Biography', type: ['string', 'null'] },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetPersonFullById = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          description: 'Person Resource',
          properties: {
            mal_id: { description: 'MyAnimeList ID', type: 'integer' },
            url: { description: 'MyAnimeList URL', type: 'string' },
            website_url: { description: "Person's website URL", type: ['string', 'null'] },
            images: {
              properties: {
                jpg: {
                  description: 'Available images in JPG',
                  properties: {
                    image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            name: { description: 'Name', type: 'string' },
            given_name: { description: 'Given Name', type: ['string', 'null'] },
            family_name: { description: 'Family Name', type: ['string', 'null'] },
            alternate_names: {
              description: 'Other Names',
              type: 'array',
              items: { type: 'string' },
            },
            birthday: { description: 'Birthday Date ISO8601', type: ['string', 'null'] },
            favorites: {
              description: 'Number of users who have favorited this entry',
              type: 'integer',
            },
            about: { description: 'Biography', type: ['string', 'null'] },
            anime: {
              type: 'array',
              items: {
                properties: {
                  position: { description: "Person's position", type: 'string' },
                  anime: {
                    properties: {
                      mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                      url: { description: 'MyAnimeList URL', type: 'string' },
                      images: {
                        properties: {
                          jpg: {
                            description: 'Available images in JPG',
                            properties: {
                              image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                              small_image_url: {
                                description: 'Small Image URL JPG',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL JPG',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                          webp: {
                            description: 'Available images in WEBP',
                            properties: {
                              image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              small_image_url: {
                                description: 'Small Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                        },
                        type: 'object',
                      },
                      title: { description: 'Entry title', type: 'string' },
                    },
                    type: 'object',
                  },
                },
                type: 'object',
              },
            },
            manga: {
              type: 'array',
              items: {
                properties: {
                  position: { description: "Person's position", type: 'string' },
                  manga: {
                    properties: {
                      mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                      url: { description: 'MyAnimeList URL', type: 'string' },
                      images: {
                        properties: {
                          jpg: {
                            description: 'Available images in JPG',
                            properties: {
                              image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                              small_image_url: {
                                description: 'Small Image URL JPG',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL JPG',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                          webp: {
                            description: 'Available images in WEBP',
                            properties: {
                              image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              small_image_url: {
                                description: 'Small Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                        },
                        type: 'object',
                      },
                      title: { description: 'Entry title', type: 'string' },
                    },
                    type: 'object',
                  },
                },
                type: 'object',
              },
            },
            voices: {
              type: 'array',
              items: {
                properties: {
                  role: { description: "Person's Character's role in the anime", type: 'string' },
                  anime: {
                    properties: {
                      mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                      url: { description: 'MyAnimeList URL', type: 'string' },
                      images: {
                        properties: {
                          jpg: {
                            description: 'Available images in JPG',
                            properties: {
                              image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                              small_image_url: {
                                description: 'Small Image URL JPG',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL JPG',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                          webp: {
                            description: 'Available images in WEBP',
                            properties: {
                              image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              small_image_url: {
                                description: 'Small Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                        },
                        type: 'object',
                      },
                      title: { description: 'Entry title', type: 'string' },
                    },
                    type: 'object',
                  },
                  character: {
                    properties: {
                      mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                      url: { description: 'MyAnimeList URL', type: 'string' },
                      images: {
                        properties: {
                          jpg: {
                            description: 'Available images in JPG',
                            properties: {
                              image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                              small_image_url: {
                                description: 'Small Image URL JPG',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                          webp: {
                            description: 'Available images in WEBP',
                            properties: {
                              image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              small_image_url: {
                                description: 'Small Image URL WEBP',
                                type: ['string', 'null'],
                              },
                            },
                            type: 'object',
                          },
                        },
                        type: 'object',
                      },
                      name: { description: 'Entry name', type: 'string' },
                    },
                    type: 'object',
                  },
                },
                type: 'object',
              },
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetPersonManga = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: "Person's mangaography",
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              position: { description: "Person's position", type: 'string' },
              manga: {
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  images: {
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL JPG',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL JPG',
                            type: ['string', 'null'],
                          },
                        },
                        type: 'object',
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL WEBP',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL WEBP',
                            type: ['string', 'null'],
                          },
                        },
                        type: 'object',
                      },
                    },
                    type: 'object',
                  },
                  title: { description: 'Entry title', type: 'string' },
                },
                type: 'object',
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetPersonPictures = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'Character Pictures',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              jpg: {
                description: 'Available images in JPG',
                properties: {
                  image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                },
                type: 'object',
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetPersonVoices = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: "Person's voice acting roles",
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              role: { description: "Person's Character's role in the anime", type: 'string' },
              anime: {
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  images: {
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL JPG',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL JPG',
                            type: ['string', 'null'],
                          },
                        },
                        type: 'object',
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL WEBP',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL WEBP',
                            type: ['string', 'null'],
                          },
                        },
                        type: 'object',
                      },
                    },
                    type: 'object',
                  },
                  title: { description: 'Entry title', type: 'string' },
                },
                type: 'object',
              },
              character: {
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  images: {
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL JPG',
                            type: ['string', 'null'],
                          },
                        },
                        type: 'object',
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL WEBP',
                            type: ['string', 'null'],
                          },
                        },
                        type: 'object',
                      },
                    },
                    type: 'object',
                  },
                  name: { description: 'Entry name', type: 'string' },
                },
                type: 'object',
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetProducerById = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          description: 'Producers Resource',
          properties: {
            mal_id: { description: 'MyAnimeList ID', type: 'integer' },
            url: { description: 'MyAnimeList URL', type: 'string' },
            titles: {
              description: 'All titles',
              type: 'array',
              items: {
                properties: {
                  type: { description: 'Title type', type: 'string' },
                  title: { description: 'Title value', type: 'string' },
                },
                type: 'object',
              },
            },
            images: {
              properties: {
                jpg: {
                  description: 'Available images in JPG',
                  properties: {
                    image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            favorites: { description: "Producers's member favorites count", type: 'integer' },
            count: { description: "Producers's anime count", type: 'integer' },
            established: { description: 'Established Date ISO8601', type: ['string', 'null'] },
            about: { description: 'About the Producer', type: ['string', 'null'] },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetProducerExternal = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      description: 'External links',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: { name: { type: 'string' }, url: { type: 'string' } },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetProducerFullById = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          description: 'Producers Resource',
          properties: {
            mal_id: { description: 'MyAnimeList ID', type: 'integer' },
            url: { description: 'MyAnimeList URL', type: 'string' },
            titles: {
              description: 'All titles',
              type: 'array',
              items: {
                properties: {
                  type: { description: 'Title type', type: 'string' },
                  title: { description: 'Title value', type: 'string' },
                },
                type: 'object',
              },
            },
            images: {
              properties: {
                jpg: {
                  description: 'Available images in JPG',
                  properties: {
                    image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            favorites: { description: "Producers's member favorites count", type: 'integer' },
            count: { description: "Producers's anime count", type: 'integer' },
            established: { description: 'Established Date ISO8601', type: ['string', 'null'] },
            about: { description: 'About the Producer', type: ['string', 'null'] },
            external: {
              type: 'array',
              items: {
                properties: { name: { type: 'string' }, url: { type: 'string' } },
                type: 'object',
              },
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetProducers = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          limit: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          q: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
          order_by: {
            description: 'Producers Search Query Order By',
            type: 'string',
            enum: ['mal_id', 'count', 'favorites', 'established'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          sort: {
            description: 'Search query sort direction',
            type: 'string',
            enum: ['desc', 'asc'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          letter: {
            type: 'string',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description: 'Return entries starting with the given letter',
          },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Producers Collection Resource',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Producers Resource',
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              titles: {
                description: 'All titles',
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { description: 'Title type', type: 'string' },
                    title: { description: 'Title value', type: 'string' },
                  },
                },
              },
              images: {
                type: 'object',
                properties: {
                  jpg: {
                    description: 'Available images in JPG',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    },
                  },
                },
              },
              favorites: { description: "Producers's member favorites count", type: 'integer' },
              count: { description: "Producers's anime count", type: 'integer' },
              established: { description: 'Established Date ISO8601', type: ['string', 'null'] },
              about: { description: 'About the Producer', type: ['string', 'null'] },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetRandomAnime = {
  response: {
    '200': {
      properties: {
        data: {
          description: 'Anime Resource',
          properties: {
            mal_id: { description: 'MyAnimeList ID', type: 'integer' },
            url: { description: 'MyAnimeList URL', type: 'string' },
            images: {
              properties: {
                jpg: {
                  description: 'Available images in JPG',
                  properties: {
                    image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    small_image_url: {
                      description: 'Small Image URL JPG',
                      type: ['string', 'null'],
                    },
                    large_image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
                webp: {
                  description: 'Available images in WEBP',
                  properties: {
                    image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                    small_image_url: {
                      description: 'Small Image URL WEBP',
                      type: ['string', 'null'],
                    },
                    large_image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            trailer: {
              description: 'Youtube Details',
              properties: {
                youtube_id: { description: 'YouTube ID', type: ['string', 'null'] },
                url: { description: 'YouTube URL', type: ['string', 'null'] },
                embed_url: { description: 'Parsed Embed URL', type: ['string', 'null'] },
              },
              type: 'object',
            },
            approved: {
              description: 'Whether the entry is pending approval on MAL or not',
              type: 'boolean',
            },
            titles: {
              description: 'All titles',
              type: 'array',
              items: {
                properties: {
                  type: { description: 'Title type', type: 'string' },
                  title: { description: 'Title value', type: 'string' },
                },
                type: 'object',
              },
            },
            title: { description: 'Title', type: 'string', deprecated: true },
            title_english: {
              description: 'English Title',
              type: ['string', 'null'],
              deprecated: true,
            },
            title_japanese: {
              description: 'Japanese Title',
              type: ['string', 'null'],
              deprecated: true,
            },
            title_synonyms: {
              description: 'Other Titles',
              type: 'array',
              items: { type: 'string' },
              deprecated: true,
            },
            type: {
              description: 'Anime Type\n\n`TV` `OVA` `Movie` `Special` `ONA` `Music`',
              type: ['string', 'null'],
              enum: ['TV', 'OVA', 'Movie', 'Special', 'ONA', 'Music'],
            },
            source: {
              description: 'Original Material/Source adapted from',
              type: ['string', 'null'],
            },
            episodes: { description: 'Episode count', type: ['integer', 'null'] },
            status: {
              description: 'Airing status\n\n`Finished Airing` `Currently Airing` `Not yet aired`',
              type: ['string', 'null'],
              enum: ['Finished Airing', 'Currently Airing', 'Not yet aired'],
            },
            airing: { description: 'Airing boolean', type: 'boolean' },
            aired: {
              description: 'Date range',
              properties: {
                from: { description: 'Date ISO8601', type: ['string', 'null'] },
                to: { description: 'Date ISO8601', type: ['string', 'null'] },
                prop: {
                  description: 'Date Prop',
                  properties: {
                    from: {
                      description: 'Date Prop From',
                      properties: {
                        day: { description: 'Day', type: ['integer', 'null'] },
                        month: { description: 'Month', type: ['integer', 'null'] },
                        year: { description: 'Year', type: ['integer', 'null'] },
                      },
                      type: 'object',
                    },
                    to: {
                      description: 'Date Prop To',
                      properties: {
                        day: { description: 'Day', type: ['integer', 'null'] },
                        month: { description: 'Month', type: ['integer', 'null'] },
                        year: { description: 'Year', type: ['integer', 'null'] },
                      },
                      type: 'object',
                    },
                    string: { description: 'Raw parsed string', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            duration: { description: 'Parsed raw duration', type: ['string', 'null'] },
            rating: {
              description:
                'Anime audience rating\n\n`G - All Ages` `PG - Children` `PG-13 - Teens 13 or older` `R - 17+ (violence & profanity)` `R+ - Mild Nudity` `Rx - Hentai`',
              type: ['string', 'null'],
              enum: [
                'G - All Ages',
                'PG - Children',
                'PG-13 - Teens 13 or older',
                'R - 17+ (violence & profanity)',
                'R+ - Mild Nudity',
                'Rx - Hentai',
              ],
            },
            score: {
              description: 'Score',
              type: ['number', 'null'],
              format: 'float',
              minimum: -3.402823669209385e38,
              maximum: 3.402823669209385e38,
            },
            scored_by: { description: 'Number of users', type: ['integer', 'null'] },
            rank: { description: 'Ranking', type: ['integer', 'null'] },
            popularity: { description: 'Popularity', type: ['integer', 'null'] },
            members: {
              description: 'Number of users who have added this entry to their list',
              type: ['integer', 'null'],
            },
            favorites: {
              description: 'Number of users who have favorited this entry',
              type: ['integer', 'null'],
            },
            synopsis: { description: 'Synopsis', type: ['string', 'null'] },
            background: { description: 'Background', type: ['string', 'null'] },
            season: {
              description: 'Season\n\n`summer` `winter` `spring` `fall`',
              type: ['string', 'null'],
              enum: ['summer', 'winter', 'spring', 'fall'],
            },
            year: { description: 'Year', type: ['integer', 'null'] },
            broadcast: {
              description: 'Broadcast Details',
              properties: {
                day: { description: 'Day of the week', type: ['string', 'null'] },
                time: { description: 'Time in 24 hour format', type: ['string', 'null'] },
                timezone: {
                  description:
                    'Timezone (Tz Database format https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)',
                  type: ['string', 'null'],
                },
                string: { description: 'Raw parsed broadcast string', type: ['string', 'null'] },
              },
              type: 'object',
            },
            producers: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            licensors: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            studios: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            genres: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            explicit_genres: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            themes: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            demographics: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetRandomCharacters = {
  response: {
    '200': {
      properties: {
        data: {
          description: 'Character Resource',
          properties: {
            mal_id: { description: 'MyAnimeList ID', type: 'integer' },
            url: { description: 'MyAnimeList URL', type: 'string' },
            images: {
              properties: {
                jpg: {
                  description: 'Available images in JPG',
                  properties: {
                    image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    small_image_url: {
                      description: 'Small Image URL JPG',
                      type: ['string', 'null'],
                    },
                  },
                  type: 'object',
                },
                webp: {
                  description: 'Available images in WEBP',
                  properties: {
                    image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                    small_image_url: {
                      description: 'Small Image URL WEBP',
                      type: ['string', 'null'],
                    },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            name: { description: 'Name', type: 'string' },
            name_kanji: { description: 'Name', type: ['string', 'null'] },
            nicknames: { description: 'Other Names', type: 'array', items: { type: 'string' } },
            favorites: {
              description: 'Number of users who have favorited this entry',
              type: 'integer',
            },
            about: { description: 'Biography', type: ['string', 'null'] },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetRandomManga = {
  response: {
    '200': {
      properties: {
        data: {
          description: 'Manga Resource',
          properties: {
            mal_id: { description: 'MyAnimeList ID', type: 'integer' },
            url: { description: 'MyAnimeList URL', type: 'string' },
            images: {
              properties: {
                jpg: {
                  description: 'Available images in JPG',
                  properties: {
                    image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    small_image_url: {
                      description: 'Small Image URL JPG',
                      type: ['string', 'null'],
                    },
                    large_image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
                webp: {
                  description: 'Available images in WEBP',
                  properties: {
                    image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                    small_image_url: {
                      description: 'Small Image URL WEBP',
                      type: ['string', 'null'],
                    },
                    large_image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            approved: {
              description: 'Whether the entry is pending approval on MAL or not',
              type: 'boolean',
            },
            titles: {
              description: 'All Titles',
              type: 'array',
              items: {
                properties: {
                  type: { description: 'Title type', type: 'string' },
                  title: { description: 'Title value', type: 'string' },
                },
                type: 'object',
              },
            },
            title: { description: 'Title', type: 'string', deprecated: true },
            title_english: {
              description: 'English Title',
              type: ['string', 'null'],
              deprecated: true,
            },
            title_japanese: {
              description: 'Japanese Title',
              type: ['string', 'null'],
              deprecated: true,
            },
            type: {
              description:
                'Manga Type\n\n`Manga` `Novel` `Light Novel` `One-shot` `Doujinshi` `Manhua` `Manhwa` `OEL`',
              type: ['string', 'null'],
              enum: [
                'Manga',
                'Novel',
                'Light Novel',
                'One-shot',
                'Doujinshi',
                'Manhua',
                'Manhwa',
                'OEL',
              ],
            },
            chapters: { description: 'Chapter count', type: ['integer', 'null'] },
            volumes: { description: 'Volume count', type: ['integer', 'null'] },
            status: {
              description:
                'Publishing status\n\n`Finished` `Publishing` `On Hiatus` `Discontinued` `Not yet published`',
              type: 'string',
              enum: ['Finished', 'Publishing', 'On Hiatus', 'Discontinued', 'Not yet published'],
            },
            publishing: { description: 'Publishing boolean', type: 'boolean' },
            published: {
              description: 'Date range',
              properties: {
                from: { description: 'Date ISO8601', type: ['string', 'null'] },
                to: { description: 'Date ISO8601', type: ['string', 'null'] },
                prop: {
                  description: 'Date Prop',
                  properties: {
                    from: {
                      description: 'Date Prop From',
                      properties: {
                        day: { description: 'Day', type: ['integer', 'null'] },
                        month: { description: 'Month', type: ['integer', 'null'] },
                        year: { description: 'Year', type: ['integer', 'null'] },
                      },
                      type: 'object',
                    },
                    to: {
                      description: 'Date Prop To',
                      properties: {
                        day: { description: 'Day', type: ['integer', 'null'] },
                        month: { description: 'Month', type: ['integer', 'null'] },
                        year: { description: 'Year', type: ['integer', 'null'] },
                      },
                      type: 'object',
                    },
                    string: { description: 'Raw parsed string', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            score: {
              description: 'Score',
              type: ['number', 'null'],
              format: 'float',
              minimum: -3.402823669209385e38,
              maximum: 3.402823669209385e38,
            },
            scored_by: { description: 'Number of users', type: ['integer', 'null'] },
            rank: { description: 'Ranking', type: ['integer', 'null'] },
            popularity: { description: 'Popularity', type: ['integer', 'null'] },
            members: {
              description: 'Number of users who have added this entry to their list',
              type: ['integer', 'null'],
            },
            favorites: {
              description: 'Number of users who have favorited this entry',
              type: ['integer', 'null'],
            },
            synopsis: { description: 'Synopsis', type: ['string', 'null'] },
            background: { description: 'Background', type: ['string', 'null'] },
            authors: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            serializations: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            genres: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            explicit_genres: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            themes: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
            demographics: {
              type: 'array',
              items: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetRandomPeople = {
  response: {
    '200': {
      properties: {
        data: {
          description: 'Person Resource',
          properties: {
            mal_id: { description: 'MyAnimeList ID', type: 'integer' },
            url: { description: 'MyAnimeList URL', type: 'string' },
            website_url: { description: "Person's website URL", type: ['string', 'null'] },
            images: {
              properties: {
                jpg: {
                  description: 'Available images in JPG',
                  properties: {
                    image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            name: { description: 'Name', type: 'string' },
            given_name: { description: 'Given Name', type: ['string', 'null'] },
            family_name: { description: 'Family Name', type: ['string', 'null'] },
            alternate_names: {
              description: 'Other Names',
              type: 'array',
              items: { type: 'string' },
            },
            birthday: { description: 'Birthday Date ISO8601', type: ['string', 'null'] },
            favorites: {
              description: 'Number of users who have favorited this entry',
              type: 'integer',
            },
            about: { description: 'Biography', type: ['string', 'null'] },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetRandomUsers = {
  response: {
    '200': {
      properties: {
        data: {
          properties: {
            mal_id: { description: 'MyAnimeList ID', type: ['integer', 'null'] },
            username: { description: 'MyAnimeList Username', type: 'string' },
            url: { description: 'MyAnimeList URL', type: 'string' },
            images: {
              properties: {
                jpg: {
                  description: 'Available images in JPG',
                  properties: {
                    image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
                webp: {
                  description: 'Available images in WEBP',
                  properties: {
                    image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            last_online: { description: 'Last Online Date ISO8601', type: ['string', 'null'] },
            gender: { description: 'User Gender', type: ['string', 'null'] },
            birthday: { description: 'Birthday Date ISO8601', type: ['string', 'null'] },
            location: { description: 'Location', type: ['string', 'null'] },
            joined: { description: 'Joined Date ISO8601', type: ['string', 'null'] },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetRecentAnimeRecommendations = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Recommendations',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              mal_id: {
                description:
                  "MAL IDs of recommendations is both of the MAL ID's with a `-` delimiter",
                type: 'string',
              },
              entry: {
                description: 'Array of 2 entries that are being recommended to each other',
                type: 'array',
                items: {
                  type: 'object',
                  anyOf: [
                    {
                      properties: {
                        mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                        url: { description: 'MyAnimeList URL', type: 'string' },
                        images: {
                          type: 'object',
                          properties: {
                            jpg: {
                              description: 'Available images in JPG',
                              type: 'object',
                              properties: {
                                image_url: {
                                  description: 'Image URL JPG',
                                  type: ['string', 'null'],
                                },
                                small_image_url: {
                                  description: 'Small Image URL JPG',
                                  type: ['string', 'null'],
                                },
                                large_image_url: {
                                  description: 'Image URL JPG',
                                  type: ['string', 'null'],
                                },
                              },
                            },
                            webp: {
                              description: 'Available images in WEBP',
                              type: 'object',
                              properties: {
                                image_url: {
                                  description: 'Image URL WEBP',
                                  type: ['string', 'null'],
                                },
                                small_image_url: {
                                  description: 'Small Image URL WEBP',
                                  type: ['string', 'null'],
                                },
                                large_image_url: {
                                  description: 'Image URL WEBP',
                                  type: ['string', 'null'],
                                },
                              },
                            },
                          },
                        },
                        title: { description: 'Entry title', type: 'string' },
                      },
                      type: 'object',
                    },
                    {
                      properties: {
                        mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                        url: { description: 'MyAnimeList URL', type: 'string' },
                        images: {
                          type: 'object',
                          properties: {
                            jpg: {
                              description: 'Available images in JPG',
                              type: 'object',
                              properties: {
                                image_url: {
                                  description: 'Image URL JPG',
                                  type: ['string', 'null'],
                                },
                                small_image_url: {
                                  description: 'Small Image URL JPG',
                                  type: ['string', 'null'],
                                },
                                large_image_url: {
                                  description: 'Image URL JPG',
                                  type: ['string', 'null'],
                                },
                              },
                            },
                            webp: {
                              description: 'Available images in WEBP',
                              type: 'object',
                              properties: {
                                image_url: {
                                  description: 'Image URL WEBP',
                                  type: ['string', 'null'],
                                },
                                small_image_url: {
                                  description: 'Small Image URL WEBP',
                                  type: ['string', 'null'],
                                },
                                large_image_url: {
                                  description: 'Image URL WEBP',
                                  type: ['string', 'null'],
                                },
                              },
                            },
                          },
                        },
                        title: { description: 'Entry title', type: 'string' },
                      },
                      type: 'object',
                    },
                  ],
                },
              },
              content: {
                description: 'Recommendation context provided by the user',
                type: 'string',
              },
              user: {
                description: 'User Meta By ID',
                type: 'object',
                properties: {
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  username: { description: 'MyAnimeList Username', type: 'string' },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetRecentAnimeReviews = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: { '200': { $schema: 'http://json-schema.org/draft-04/schema#' } },
} as const;
const GetRecentMangaRecommendations = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Recommendations',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              mal_id: {
                description:
                  "MAL IDs of recommendations is both of the MAL ID's with a `-` delimiter",
                type: 'string',
              },
              entry: {
                description: 'Array of 2 entries that are being recommended to each other',
                type: 'array',
                items: {
                  type: 'object',
                  anyOf: [
                    {
                      properties: {
                        mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                        url: { description: 'MyAnimeList URL', type: 'string' },
                        images: {
                          type: 'object',
                          properties: {
                            jpg: {
                              description: 'Available images in JPG',
                              type: 'object',
                              properties: {
                                image_url: {
                                  description: 'Image URL JPG',
                                  type: ['string', 'null'],
                                },
                                small_image_url: {
                                  description: 'Small Image URL JPG',
                                  type: ['string', 'null'],
                                },
                                large_image_url: {
                                  description: 'Image URL JPG',
                                  type: ['string', 'null'],
                                },
                              },
                            },
                            webp: {
                              description: 'Available images in WEBP',
                              type: 'object',
                              properties: {
                                image_url: {
                                  description: 'Image URL WEBP',
                                  type: ['string', 'null'],
                                },
                                small_image_url: {
                                  description: 'Small Image URL WEBP',
                                  type: ['string', 'null'],
                                },
                                large_image_url: {
                                  description: 'Image URL WEBP',
                                  type: ['string', 'null'],
                                },
                              },
                            },
                          },
                        },
                        title: { description: 'Entry title', type: 'string' },
                      },
                      type: 'object',
                    },
                    {
                      properties: {
                        mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                        url: { description: 'MyAnimeList URL', type: 'string' },
                        images: {
                          type: 'object',
                          properties: {
                            jpg: {
                              description: 'Available images in JPG',
                              type: 'object',
                              properties: {
                                image_url: {
                                  description: 'Image URL JPG',
                                  type: ['string', 'null'],
                                },
                                small_image_url: {
                                  description: 'Small Image URL JPG',
                                  type: ['string', 'null'],
                                },
                                large_image_url: {
                                  description: 'Image URL JPG',
                                  type: ['string', 'null'],
                                },
                              },
                            },
                            webp: {
                              description: 'Available images in WEBP',
                              type: 'object',
                              properties: {
                                image_url: {
                                  description: 'Image URL WEBP',
                                  type: ['string', 'null'],
                                },
                                small_image_url: {
                                  description: 'Small Image URL WEBP',
                                  type: ['string', 'null'],
                                },
                                large_image_url: {
                                  description: 'Image URL WEBP',
                                  type: ['string', 'null'],
                                },
                              },
                            },
                          },
                        },
                        title: { description: 'Entry title', type: 'string' },
                      },
                      type: 'object',
                    },
                  ],
                },
              },
              content: {
                description: 'Recommendation context provided by the user',
                type: 'string',
              },
              user: {
                description: 'User Meta By ID',
                type: 'object',
                properties: {
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  username: { description: 'MyAnimeList Username', type: 'string' },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetRecentMangaReviews = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: { '200': { $schema: 'http://json-schema.org/draft-04/schema#' } },
} as const;
const GetSchedules = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          filter: {
            type: 'string',
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'unknown', 'other'],
            $schema: 'http://json-schema.org/draft-04/schema#',
            description: 'Filter by day',
          },
          kids: {
            type: 'string',
            enum: ['true', 'false'],
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              'When supplied, it will filter entries with the `Kids` Genre Demographic. When supplied as `kids=true`, it will return only Kid entries and when supplied as `kids=false`, it will filter out any Kid entries. Defaults to `false`.',
          },
          sfw: {
            type: 'boolean',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              "'Safe For Work'. This is a flag. When supplied it will filter out entries according to the SFW Policy. You do not need to pass a value to it. e.g usage: `?sfw`",
          },
          unapproved: {
            type: 'boolean',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              'This is a flag. When supplied it will include entries which are unapproved. Unapproved entries on MyAnimeList are those that are user submitted and have not yet been approved by MAL to show up on other pages. They will have their own specifc pages and are often removed resulting in a 404 error. You do not need to pass a value to it. e.g usage: `?unapproved`',
          },
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          limit: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Anime resources currently airing',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Anime Resource',
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              images: {
                type: 'object',
                properties: {
                  jpg: {
                    description: 'Available images in JPG',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL JPG',
                        type: ['string', 'null'],
                      },
                      large_image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    },
                  },
                  webp: {
                    description: 'Available images in WEBP',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL WEBP',
                        type: ['string', 'null'],
                      },
                      large_image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                    },
                  },
                },
              },
              trailer: {
                description: 'Youtube Details',
                type: 'object',
                properties: {
                  youtube_id: { description: 'YouTube ID', type: ['string', 'null'] },
                  url: { description: 'YouTube URL', type: ['string', 'null'] },
                  embed_url: { description: 'Parsed Embed URL', type: ['string', 'null'] },
                },
              },
              approved: {
                description: 'Whether the entry is pending approval on MAL or not',
                type: 'boolean',
              },
              titles: {
                description: 'All titles',
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { description: 'Title type', type: 'string' },
                    title: { description: 'Title value', type: 'string' },
                  },
                },
              },
              title: { description: 'Title', type: 'string', deprecated: true },
              title_english: {
                description: 'English Title',
                type: ['string', 'null'],
                deprecated: true,
              },
              title_japanese: {
                description: 'Japanese Title',
                type: ['string', 'null'],
                deprecated: true,
              },
              title_synonyms: {
                description: 'Other Titles',
                type: 'array',
                deprecated: true,
                items: { type: 'string' },
              },
              type: {
                description: 'Anime Type\n\n`TV` `OVA` `Movie` `Special` `ONA` `Music`',
                type: ['string', 'null'],
                enum: ['TV', 'OVA', 'Movie', 'Special', 'ONA', 'Music'],
              },
              source: {
                description: 'Original Material/Source adapted from',
                type: ['string', 'null'],
              },
              episodes: { description: 'Episode count', type: ['integer', 'null'] },
              status: {
                description:
                  'Airing status\n\n`Finished Airing` `Currently Airing` `Not yet aired`',
                type: ['string', 'null'],
                enum: ['Finished Airing', 'Currently Airing', 'Not yet aired'],
              },
              airing: { description: 'Airing boolean', type: 'boolean' },
              aired: {
                description: 'Date range',
                type: 'object',
                properties: {
                  from: { description: 'Date ISO8601', type: ['string', 'null'] },
                  to: { description: 'Date ISO8601', type: ['string', 'null'] },
                  prop: {
                    description: 'Date Prop',
                    type: 'object',
                    properties: {
                      from: {
                        description: 'Date Prop From',
                        type: 'object',
                        properties: {
                          day: { description: 'Day', type: ['integer', 'null'] },
                          month: { description: 'Month', type: ['integer', 'null'] },
                          year: { description: 'Year', type: ['integer', 'null'] },
                        },
                      },
                      to: {
                        description: 'Date Prop To',
                        type: 'object',
                        properties: {
                          day: { description: 'Day', type: ['integer', 'null'] },
                          month: { description: 'Month', type: ['integer', 'null'] },
                          year: { description: 'Year', type: ['integer', 'null'] },
                        },
                      },
                      string: { description: 'Raw parsed string', type: ['string', 'null'] },
                    },
                  },
                },
              },
              duration: { description: 'Parsed raw duration', type: ['string', 'null'] },
              rating: {
                description:
                  'Anime audience rating\n\n`G - All Ages` `PG - Children` `PG-13 - Teens 13 or older` `R - 17+ (violence & profanity)` `R+ - Mild Nudity` `Rx - Hentai`',
                type: ['string', 'null'],
                enum: [
                  'G - All Ages',
                  'PG - Children',
                  'PG-13 - Teens 13 or older',
                  'R - 17+ (violence & profanity)',
                  'R+ - Mild Nudity',
                  'Rx - Hentai',
                ],
              },
              score: {
                description: 'Score',
                type: ['number', 'null'],
                format: 'float',
                minimum: -3.402823669209385e38,
                maximum: 3.402823669209385e38,
              },
              scored_by: { description: 'Number of users', type: ['integer', 'null'] },
              rank: { description: 'Ranking', type: ['integer', 'null'] },
              popularity: { description: 'Popularity', type: ['integer', 'null'] },
              members: {
                description: 'Number of users who have added this entry to their list',
                type: ['integer', 'null'],
              },
              favorites: {
                description: 'Number of users who have favorited this entry',
                type: ['integer', 'null'],
              },
              synopsis: { description: 'Synopsis', type: ['string', 'null'] },
              background: { description: 'Background', type: ['string', 'null'] },
              season: {
                description: 'Season\n\n`summer` `winter` `spring` `fall`',
                type: ['string', 'null'],
                enum: ['summer', 'winter', 'spring', 'fall'],
              },
              year: { description: 'Year', type: ['integer', 'null'] },
              broadcast: {
                description: 'Broadcast Details',
                type: 'object',
                properties: {
                  day: { description: 'Day of the week', type: ['string', 'null'] },
                  time: { description: 'Time in 24 hour format', type: ['string', 'null'] },
                  timezone: {
                    description:
                      'Timezone (Tz Database format https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)',
                    type: ['string', 'null'],
                  },
                  string: { description: 'Raw parsed broadcast string', type: ['string', 'null'] },
                },
              },
              producers: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              licensors: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              studios: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              genres: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              explicit_genres: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              themes: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              demographics: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
            items: {
              type: 'object',
              properties: {
                count: { type: 'integer' },
                total: { type: 'integer' },
                per_page: { type: 'integer' },
              },
            },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetSeason = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          year: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          season: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: ['year', 'season'],
      },
      {
        type: 'object',
        properties: {
          filter: {
            type: 'string',
            enum: ['tv', 'movie', 'ova', 'special', 'ona', 'music'],
            $schema: 'http://json-schema.org/draft-04/schema#',
            description: 'Entry types',
          },
          sfw: {
            type: 'boolean',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              "'Safe For Work'. This is a flag. When supplied it will filter out entries according to the SFW Policy. You do not need to pass a value to it. e.g usage: `?sfw`",
          },
          unapproved: {
            type: 'boolean',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              'This is a flag. When supplied it will include entries which are unapproved. Unapproved entries on MyAnimeList are those that are user submitted and have not yet been approved by MAL to show up on other pages. They will have their own specifc pages and are often removed resulting in a 404 error. You do not need to pass a value to it. e.g usage: `?unapproved`',
          },
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          limit: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Anime Collection Resource',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Anime Resource',
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              images: {
                type: 'object',
                properties: {
                  jpg: {
                    description: 'Available images in JPG',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL JPG',
                        type: ['string', 'null'],
                      },
                      large_image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    },
                  },
                  webp: {
                    description: 'Available images in WEBP',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL WEBP',
                        type: ['string', 'null'],
                      },
                      large_image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                    },
                  },
                },
              },
              trailer: {
                description: 'Youtube Details',
                type: 'object',
                properties: {
                  youtube_id: { description: 'YouTube ID', type: ['string', 'null'] },
                  url: { description: 'YouTube URL', type: ['string', 'null'] },
                  embed_url: { description: 'Parsed Embed URL', type: ['string', 'null'] },
                },
              },
              approved: {
                description: 'Whether the entry is pending approval on MAL or not',
                type: 'boolean',
              },
              titles: {
                description: 'All titles',
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { description: 'Title type', type: 'string' },
                    title: { description: 'Title value', type: 'string' },
                  },
                },
              },
              title: { description: 'Title', type: 'string', deprecated: true },
              title_english: {
                description: 'English Title',
                type: ['string', 'null'],
                deprecated: true,
              },
              title_japanese: {
                description: 'Japanese Title',
                type: ['string', 'null'],
                deprecated: true,
              },
              title_synonyms: {
                description: 'Other Titles',
                type: 'array',
                deprecated: true,
                items: { type: 'string' },
              },
              type: {
                description: 'Anime Type\n\n`TV` `OVA` `Movie` `Special` `ONA` `Music`',
                type: ['string', 'null'],
                enum: ['TV', 'OVA', 'Movie', 'Special', 'ONA', 'Music'],
              },
              source: {
                description: 'Original Material/Source adapted from',
                type: ['string', 'null'],
              },
              episodes: { description: 'Episode count', type: ['integer', 'null'] },
              status: {
                description:
                  'Airing status\n\n`Finished Airing` `Currently Airing` `Not yet aired`',
                type: ['string', 'null'],
                enum: ['Finished Airing', 'Currently Airing', 'Not yet aired'],
              },
              airing: { description: 'Airing boolean', type: 'boolean' },
              aired: {
                description: 'Date range',
                type: 'object',
                properties: {
                  from: { description: 'Date ISO8601', type: ['string', 'null'] },
                  to: { description: 'Date ISO8601', type: ['string', 'null'] },
                  prop: {
                    description: 'Date Prop',
                    type: 'object',
                    properties: {
                      from: {
                        description: 'Date Prop From',
                        type: 'object',
                        properties: {
                          day: { description: 'Day', type: ['integer', 'null'] },
                          month: { description: 'Month', type: ['integer', 'null'] },
                          year: { description: 'Year', type: ['integer', 'null'] },
                        },
                      },
                      to: {
                        description: 'Date Prop To',
                        type: 'object',
                        properties: {
                          day: { description: 'Day', type: ['integer', 'null'] },
                          month: { description: 'Month', type: ['integer', 'null'] },
                          year: { description: 'Year', type: ['integer', 'null'] },
                        },
                      },
                      string: { description: 'Raw parsed string', type: ['string', 'null'] },
                    },
                  },
                },
              },
              duration: { description: 'Parsed raw duration', type: ['string', 'null'] },
              rating: {
                description:
                  'Anime audience rating\n\n`G - All Ages` `PG - Children` `PG-13 - Teens 13 or older` `R - 17+ (violence & profanity)` `R+ - Mild Nudity` `Rx - Hentai`',
                type: ['string', 'null'],
                enum: [
                  'G - All Ages',
                  'PG - Children',
                  'PG-13 - Teens 13 or older',
                  'R - 17+ (violence & profanity)',
                  'R+ - Mild Nudity',
                  'Rx - Hentai',
                ],
              },
              score: {
                description: 'Score',
                type: ['number', 'null'],
                format: 'float',
                minimum: -3.402823669209385e38,
                maximum: 3.402823669209385e38,
              },
              scored_by: { description: 'Number of users', type: ['integer', 'null'] },
              rank: { description: 'Ranking', type: ['integer', 'null'] },
              popularity: { description: 'Popularity', type: ['integer', 'null'] },
              members: {
                description: 'Number of users who have added this entry to their list',
                type: ['integer', 'null'],
              },
              favorites: {
                description: 'Number of users who have favorited this entry',
                type: ['integer', 'null'],
              },
              synopsis: { description: 'Synopsis', type: ['string', 'null'] },
              background: { description: 'Background', type: ['string', 'null'] },
              season: {
                description: 'Season\n\n`summer` `winter` `spring` `fall`',
                type: ['string', 'null'],
                enum: ['summer', 'winter', 'spring', 'fall'],
              },
              year: { description: 'Year', type: ['integer', 'null'] },
              broadcast: {
                description: 'Broadcast Details',
                type: 'object',
                properties: {
                  day: { description: 'Day of the week', type: ['string', 'null'] },
                  time: { description: 'Time in 24 hour format', type: ['string', 'null'] },
                  timezone: {
                    description:
                      'Timezone (Tz Database format https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)',
                    type: ['string', 'null'],
                  },
                  string: { description: 'Raw parsed broadcast string', type: ['string', 'null'] },
                },
              },
              producers: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              licensors: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              studios: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              genres: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              explicit_genres: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              themes: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              demographics: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
            items: {
              type: 'object',
              properties: {
                count: { type: 'integer' },
                total: { type: 'integer' },
                per_page: { type: 'integer' },
              },
            },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetSeasonNow = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          filter: {
            type: 'string',
            enum: ['tv', 'movie', 'ova', 'special', 'ona', 'music'],
            $schema: 'http://json-schema.org/draft-04/schema#',
            description: 'Entry types',
          },
          sfw: {
            type: 'boolean',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              "'Safe For Work'. This is a flag. When supplied it will filter out entries according to the SFW Policy. You do not need to pass a value to it. e.g usage: `?sfw`",
          },
          unapproved: {
            type: 'boolean',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              'This is a flag. When supplied it will include entries which are unapproved. Unapproved entries on MyAnimeList are those that are user submitted and have not yet been approved by MAL to show up on other pages. They will have their own specifc pages and are often removed resulting in a 404 error. You do not need to pass a value to it. e.g usage: `?unapproved`',
          },
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          limit: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Anime Collection Resource',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Anime Resource',
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              images: {
                type: 'object',
                properties: {
                  jpg: {
                    description: 'Available images in JPG',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL JPG',
                        type: ['string', 'null'],
                      },
                      large_image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    },
                  },
                  webp: {
                    description: 'Available images in WEBP',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL WEBP',
                        type: ['string', 'null'],
                      },
                      large_image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                    },
                  },
                },
              },
              trailer: {
                description: 'Youtube Details',
                type: 'object',
                properties: {
                  youtube_id: { description: 'YouTube ID', type: ['string', 'null'] },
                  url: { description: 'YouTube URL', type: ['string', 'null'] },
                  embed_url: { description: 'Parsed Embed URL', type: ['string', 'null'] },
                },
              },
              approved: {
                description: 'Whether the entry is pending approval on MAL or not',
                type: 'boolean',
              },
              titles: {
                description: 'All titles',
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { description: 'Title type', type: 'string' },
                    title: { description: 'Title value', type: 'string' },
                  },
                },
              },
              title: { description: 'Title', type: 'string', deprecated: true },
              title_english: {
                description: 'English Title',
                type: ['string', 'null'],
                deprecated: true,
              },
              title_japanese: {
                description: 'Japanese Title',
                type: ['string', 'null'],
                deprecated: true,
              },
              title_synonyms: {
                description: 'Other Titles',
                type: 'array',
                deprecated: true,
                items: { type: 'string' },
              },
              type: {
                description: 'Anime Type\n\n`TV` `OVA` `Movie` `Special` `ONA` `Music`',
                type: ['string', 'null'],
                enum: ['TV', 'OVA', 'Movie', 'Special', 'ONA', 'Music'],
              },
              source: {
                description: 'Original Material/Source adapted from',
                type: ['string', 'null'],
              },
              episodes: { description: 'Episode count', type: ['integer', 'null'] },
              status: {
                description:
                  'Airing status\n\n`Finished Airing` `Currently Airing` `Not yet aired`',
                type: ['string', 'null'],
                enum: ['Finished Airing', 'Currently Airing', 'Not yet aired'],
              },
              airing: { description: 'Airing boolean', type: 'boolean' },
              aired: {
                description: 'Date range',
                type: 'object',
                properties: {
                  from: { description: 'Date ISO8601', type: ['string', 'null'] },
                  to: { description: 'Date ISO8601', type: ['string', 'null'] },
                  prop: {
                    description: 'Date Prop',
                    type: 'object',
                    properties: {
                      from: {
                        description: 'Date Prop From',
                        type: 'object',
                        properties: {
                          day: { description: 'Day', type: ['integer', 'null'] },
                          month: { description: 'Month', type: ['integer', 'null'] },
                          year: { description: 'Year', type: ['integer', 'null'] },
                        },
                      },
                      to: {
                        description: 'Date Prop To',
                        type: 'object',
                        properties: {
                          day: { description: 'Day', type: ['integer', 'null'] },
                          month: { description: 'Month', type: ['integer', 'null'] },
                          year: { description: 'Year', type: ['integer', 'null'] },
                        },
                      },
                      string: { description: 'Raw parsed string', type: ['string', 'null'] },
                    },
                  },
                },
              },
              duration: { description: 'Parsed raw duration', type: ['string', 'null'] },
              rating: {
                description:
                  'Anime audience rating\n\n`G - All Ages` `PG - Children` `PG-13 - Teens 13 or older` `R - 17+ (violence & profanity)` `R+ - Mild Nudity` `Rx - Hentai`',
                type: ['string', 'null'],
                enum: [
                  'G - All Ages',
                  'PG - Children',
                  'PG-13 - Teens 13 or older',
                  'R - 17+ (violence & profanity)',
                  'R+ - Mild Nudity',
                  'Rx - Hentai',
                ],
              },
              score: {
                description: 'Score',
                type: ['number', 'null'],
                format: 'float',
                minimum: -3.402823669209385e38,
                maximum: 3.402823669209385e38,
              },
              scored_by: { description: 'Number of users', type: ['integer', 'null'] },
              rank: { description: 'Ranking', type: ['integer', 'null'] },
              popularity: { description: 'Popularity', type: ['integer', 'null'] },
              members: {
                description: 'Number of users who have added this entry to their list',
                type: ['integer', 'null'],
              },
              favorites: {
                description: 'Number of users who have favorited this entry',
                type: ['integer', 'null'],
              },
              synopsis: { description: 'Synopsis', type: ['string', 'null'] },
              background: { description: 'Background', type: ['string', 'null'] },
              season: {
                description: 'Season\n\n`summer` `winter` `spring` `fall`',
                type: ['string', 'null'],
                enum: ['summer', 'winter', 'spring', 'fall'],
              },
              year: { description: 'Year', type: ['integer', 'null'] },
              broadcast: {
                description: 'Broadcast Details',
                type: 'object',
                properties: {
                  day: { description: 'Day of the week', type: ['string', 'null'] },
                  time: { description: 'Time in 24 hour format', type: ['string', 'null'] },
                  timezone: {
                    description:
                      'Timezone (Tz Database format https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)',
                    type: ['string', 'null'],
                  },
                  string: { description: 'Raw parsed broadcast string', type: ['string', 'null'] },
                },
              },
              producers: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              licensors: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              studios: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              genres: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              explicit_genres: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              themes: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              demographics: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
            items: {
              type: 'object',
              properties: {
                count: { type: 'integer' },
                total: { type: 'integer' },
                per_page: { type: 'integer' },
              },
            },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetSeasonUpcoming = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          filter: {
            type: 'string',
            enum: ['tv', 'movie', 'ova', 'special', 'ona', 'music'],
            $schema: 'http://json-schema.org/draft-04/schema#',
            description: 'Entry types',
          },
          sfw: {
            type: 'boolean',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              "'Safe For Work'. This is a flag. When supplied it will filter out entries according to the SFW Policy. You do not need to pass a value to it. e.g usage: `?sfw`",
          },
          unapproved: {
            type: 'boolean',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              'This is a flag. When supplied it will include entries which are unapproved. Unapproved entries on MyAnimeList are those that are user submitted and have not yet been approved by MAL to show up on other pages. They will have their own specifc pages and are often removed resulting in a 404 error. You do not need to pass a value to it. e.g usage: `?unapproved`',
          },
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          limit: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Anime Collection Resource',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Anime Resource',
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              images: {
                type: 'object',
                properties: {
                  jpg: {
                    description: 'Available images in JPG',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL JPG',
                        type: ['string', 'null'],
                      },
                      large_image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    },
                  },
                  webp: {
                    description: 'Available images in WEBP',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL WEBP',
                        type: ['string', 'null'],
                      },
                      large_image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                    },
                  },
                },
              },
              trailer: {
                description: 'Youtube Details',
                type: 'object',
                properties: {
                  youtube_id: { description: 'YouTube ID', type: ['string', 'null'] },
                  url: { description: 'YouTube URL', type: ['string', 'null'] },
                  embed_url: { description: 'Parsed Embed URL', type: ['string', 'null'] },
                },
              },
              approved: {
                description: 'Whether the entry is pending approval on MAL or not',
                type: 'boolean',
              },
              titles: {
                description: 'All titles',
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { description: 'Title type', type: 'string' },
                    title: { description: 'Title value', type: 'string' },
                  },
                },
              },
              title: { description: 'Title', type: 'string', deprecated: true },
              title_english: {
                description: 'English Title',
                type: ['string', 'null'],
                deprecated: true,
              },
              title_japanese: {
                description: 'Japanese Title',
                type: ['string', 'null'],
                deprecated: true,
              },
              title_synonyms: {
                description: 'Other Titles',
                type: 'array',
                deprecated: true,
                items: { type: 'string' },
              },
              type: {
                description: 'Anime Type\n\n`TV` `OVA` `Movie` `Special` `ONA` `Music`',
                type: ['string', 'null'],
                enum: ['TV', 'OVA', 'Movie', 'Special', 'ONA', 'Music'],
              },
              source: {
                description: 'Original Material/Source adapted from',
                type: ['string', 'null'],
              },
              episodes: { description: 'Episode count', type: ['integer', 'null'] },
              status: {
                description:
                  'Airing status\n\n`Finished Airing` `Currently Airing` `Not yet aired`',
                type: ['string', 'null'],
                enum: ['Finished Airing', 'Currently Airing', 'Not yet aired'],
              },
              airing: { description: 'Airing boolean', type: 'boolean' },
              aired: {
                description: 'Date range',
                type: 'object',
                properties: {
                  from: { description: 'Date ISO8601', type: ['string', 'null'] },
                  to: { description: 'Date ISO8601', type: ['string', 'null'] },
                  prop: {
                    description: 'Date Prop',
                    type: 'object',
                    properties: {
                      from: {
                        description: 'Date Prop From',
                        type: 'object',
                        properties: {
                          day: { description: 'Day', type: ['integer', 'null'] },
                          month: { description: 'Month', type: ['integer', 'null'] },
                          year: { description: 'Year', type: ['integer', 'null'] },
                        },
                      },
                      to: {
                        description: 'Date Prop To',
                        type: 'object',
                        properties: {
                          day: { description: 'Day', type: ['integer', 'null'] },
                          month: { description: 'Month', type: ['integer', 'null'] },
                          year: { description: 'Year', type: ['integer', 'null'] },
                        },
                      },
                      string: { description: 'Raw parsed string', type: ['string', 'null'] },
                    },
                  },
                },
              },
              duration: { description: 'Parsed raw duration', type: ['string', 'null'] },
              rating: {
                description:
                  'Anime audience rating\n\n`G - All Ages` `PG - Children` `PG-13 - Teens 13 or older` `R - 17+ (violence & profanity)` `R+ - Mild Nudity` `Rx - Hentai`',
                type: ['string', 'null'],
                enum: [
                  'G - All Ages',
                  'PG - Children',
                  'PG-13 - Teens 13 or older',
                  'R - 17+ (violence & profanity)',
                  'R+ - Mild Nudity',
                  'Rx - Hentai',
                ],
              },
              score: {
                description: 'Score',
                type: ['number', 'null'],
                format: 'float',
                minimum: -3.402823669209385e38,
                maximum: 3.402823669209385e38,
              },
              scored_by: { description: 'Number of users', type: ['integer', 'null'] },
              rank: { description: 'Ranking', type: ['integer', 'null'] },
              popularity: { description: 'Popularity', type: ['integer', 'null'] },
              members: {
                description: 'Number of users who have added this entry to their list',
                type: ['integer', 'null'],
              },
              favorites: {
                description: 'Number of users who have favorited this entry',
                type: ['integer', 'null'],
              },
              synopsis: { description: 'Synopsis', type: ['string', 'null'] },
              background: { description: 'Background', type: ['string', 'null'] },
              season: {
                description: 'Season\n\n`summer` `winter` `spring` `fall`',
                type: ['string', 'null'],
                enum: ['summer', 'winter', 'spring', 'fall'],
              },
              year: { description: 'Year', type: ['integer', 'null'] },
              broadcast: {
                description: 'Broadcast Details',
                type: 'object',
                properties: {
                  day: { description: 'Day of the week', type: ['string', 'null'] },
                  time: { description: 'Time in 24 hour format', type: ['string', 'null'] },
                  timezone: {
                    description:
                      'Timezone (Tz Database format https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)',
                    type: ['string', 'null'],
                  },
                  string: { description: 'Raw parsed broadcast string', type: ['string', 'null'] },
                },
              },
              producers: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              licensors: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              studios: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              genres: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              explicit_genres: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              themes: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              demographics: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
            items: {
              type: 'object',
              properties: {
                count: { type: 'integer' },
                total: { type: 'integer' },
                per_page: { type: 'integer' },
              },
            },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetSeasonsList = {
  response: {
    '200': {
      description: 'List of available seasons',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              year: { description: 'Year', type: 'integer' },
              seasons: {
                description: 'List of available seasons',
                type: 'array',
                items: { type: 'string' },
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetTopAnime = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          type: {
            description: 'Available Anime types',
            type: 'string',
            enum: ['tv', 'movie', 'ova', 'special', 'ona', 'music'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          filter: {
            description: 'Top items filter types',
            type: 'string',
            enum: ['airing', 'upcoming', 'bypopularity', 'favorite'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          rating: {
            description:
              'Available Anime audience ratings<br><br><b>Ratings</b><br><ul><li>G - All Ages</li><li>PG - Children</li><li>PG-13 - Teens 13 or older</li><li>R - 17+ (violence & profanity)</li><li>R+ - Mild Nudity</li><li>Rx - Hentai</li></ul>',
            type: 'string',
            enum: ['g', 'pg', 'pg13', 'r17', 'r', 'rx'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          sfw: {
            type: 'boolean',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description: 'Filter out Adult entries',
          },
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          limit: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Anime Collection Resource',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Anime Resource',
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              images: {
                type: 'object',
                properties: {
                  jpg: {
                    description: 'Available images in JPG',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL JPG',
                        type: ['string', 'null'],
                      },
                      large_image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    },
                  },
                  webp: {
                    description: 'Available images in WEBP',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL WEBP',
                        type: ['string', 'null'],
                      },
                      large_image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                    },
                  },
                },
              },
              trailer: {
                description: 'Youtube Details',
                type: 'object',
                properties: {
                  youtube_id: { description: 'YouTube ID', type: ['string', 'null'] },
                  url: { description: 'YouTube URL', type: ['string', 'null'] },
                  embed_url: { description: 'Parsed Embed URL', type: ['string', 'null'] },
                },
              },
              approved: {
                description: 'Whether the entry is pending approval on MAL or not',
                type: 'boolean',
              },
              titles: {
                description: 'All titles',
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { description: 'Title type', type: 'string' },
                    title: { description: 'Title value', type: 'string' },
                  },
                },
              },
              title: { description: 'Title', type: 'string', deprecated: true },
              title_english: {
                description: 'English Title',
                type: ['string', 'null'],
                deprecated: true,
              },
              title_japanese: {
                description: 'Japanese Title',
                type: ['string', 'null'],
                deprecated: true,
              },
              title_synonyms: {
                description: 'Other Titles',
                type: 'array',
                deprecated: true,
                items: { type: 'string' },
              },
              type: {
                description: 'Anime Type\n\n`TV` `OVA` `Movie` `Special` `ONA` `Music`',
                type: ['string', 'null'],
                enum: ['TV', 'OVA', 'Movie', 'Special', 'ONA', 'Music'],
              },
              source: {
                description: 'Original Material/Source adapted from',
                type: ['string', 'null'],
              },
              episodes: { description: 'Episode count', type: ['integer', 'null'] },
              status: {
                description:
                  'Airing status\n\n`Finished Airing` `Currently Airing` `Not yet aired`',
                type: ['string', 'null'],
                enum: ['Finished Airing', 'Currently Airing', 'Not yet aired'],
              },
              airing: { description: 'Airing boolean', type: 'boolean' },
              aired: {
                description: 'Date range',
                type: 'object',
                properties: {
                  from: { description: 'Date ISO8601', type: ['string', 'null'] },
                  to: { description: 'Date ISO8601', type: ['string', 'null'] },
                  prop: {
                    description: 'Date Prop',
                    type: 'object',
                    properties: {
                      from: {
                        description: 'Date Prop From',
                        type: 'object',
                        properties: {
                          day: { description: 'Day', type: ['integer', 'null'] },
                          month: { description: 'Month', type: ['integer', 'null'] },
                          year: { description: 'Year', type: ['integer', 'null'] },
                        },
                      },
                      to: {
                        description: 'Date Prop To',
                        type: 'object',
                        properties: {
                          day: { description: 'Day', type: ['integer', 'null'] },
                          month: { description: 'Month', type: ['integer', 'null'] },
                          year: { description: 'Year', type: ['integer', 'null'] },
                        },
                      },
                      string: { description: 'Raw parsed string', type: ['string', 'null'] },
                    },
                  },
                },
              },
              duration: { description: 'Parsed raw duration', type: ['string', 'null'] },
              rating: {
                description:
                  'Anime audience rating\n\n`G - All Ages` `PG - Children` `PG-13 - Teens 13 or older` `R - 17+ (violence & profanity)` `R+ - Mild Nudity` `Rx - Hentai`',
                type: ['string', 'null'],
                enum: [
                  'G - All Ages',
                  'PG - Children',
                  'PG-13 - Teens 13 or older',
                  'R - 17+ (violence & profanity)',
                  'R+ - Mild Nudity',
                  'Rx - Hentai',
                ],
              },
              score: {
                description: 'Score',
                type: ['number', 'null'],
                format: 'float',
                minimum: -3.402823669209385e38,
                maximum: 3.402823669209385e38,
              },
              scored_by: { description: 'Number of users', type: ['integer', 'null'] },
              rank: { description: 'Ranking', type: ['integer', 'null'] },
              popularity: { description: 'Popularity', type: ['integer', 'null'] },
              members: {
                description: 'Number of users who have added this entry to their list',
                type: ['integer', 'null'],
              },
              favorites: {
                description: 'Number of users who have favorited this entry',
                type: ['integer', 'null'],
              },
              synopsis: { description: 'Synopsis', type: ['string', 'null'] },
              background: { description: 'Background', type: ['string', 'null'] },
              season: {
                description: 'Season\n\n`summer` `winter` `spring` `fall`',
                type: ['string', 'null'],
                enum: ['summer', 'winter', 'spring', 'fall'],
              },
              year: { description: 'Year', type: ['integer', 'null'] },
              broadcast: {
                description: 'Broadcast Details',
                type: 'object',
                properties: {
                  day: { description: 'Day of the week', type: ['string', 'null'] },
                  time: { description: 'Time in 24 hour format', type: ['string', 'null'] },
                  timezone: {
                    description:
                      'Timezone (Tz Database format https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)',
                    type: ['string', 'null'],
                  },
                  string: { description: 'Raw parsed broadcast string', type: ['string', 'null'] },
                },
              },
              producers: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              licensors: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              studios: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              genres: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              explicit_genres: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              themes: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              demographics: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
            items: {
              type: 'object',
              properties: {
                count: { type: 'integer' },
                total: { type: 'integer' },
                per_page: { type: 'integer' },
              },
            },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetTopCharacters = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          limit: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Characters Search Resource',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Character Resource',
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              images: {
                type: 'object',
                properties: {
                  jpg: {
                    description: 'Available images in JPG',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL JPG',
                        type: ['string', 'null'],
                      },
                    },
                  },
                  webp: {
                    description: 'Available images in WEBP',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL WEBP',
                        type: ['string', 'null'],
                      },
                    },
                  },
                },
              },
              name: { description: 'Name', type: 'string' },
              name_kanji: { description: 'Name', type: ['string', 'null'] },
              nicknames: { description: 'Other Names', type: 'array', items: { type: 'string' } },
              favorites: {
                description: 'Number of users who have favorited this entry',
                type: 'integer',
              },
              about: { description: 'Biography', type: ['string', 'null'] },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
            items: {
              type: 'object',
              properties: {
                count: { type: 'integer' },
                total: { type: 'integer' },
                per_page: { type: 'integer' },
              },
            },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetTopManga = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          type: {
            description: 'Available Manga types',
            type: 'string',
            enum: ['manga', 'novel', 'lightnovel', 'oneshot', 'doujin', 'manhwa', 'manhua'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          filter: {
            description: 'Top items filter types',
            type: 'string',
            enum: ['publishing', 'upcoming', 'bypopularity', 'favorite'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          limit: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Manga Search Resource',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Manga Resource',
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              images: {
                type: 'object',
                properties: {
                  jpg: {
                    description: 'Available images in JPG',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL JPG',
                        type: ['string', 'null'],
                      },
                      large_image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    },
                  },
                  webp: {
                    description: 'Available images in WEBP',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                      small_image_url: {
                        description: 'Small Image URL WEBP',
                        type: ['string', 'null'],
                      },
                      large_image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                    },
                  },
                },
              },
              approved: {
                description: 'Whether the entry is pending approval on MAL or not',
                type: 'boolean',
              },
              titles: {
                description: 'All Titles',
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { description: 'Title type', type: 'string' },
                    title: { description: 'Title value', type: 'string' },
                  },
                },
              },
              title: { description: 'Title', type: 'string', deprecated: true },
              title_english: {
                description: 'English Title',
                type: ['string', 'null'],
                deprecated: true,
              },
              title_japanese: {
                description: 'Japanese Title',
                type: ['string', 'null'],
                deprecated: true,
              },
              type: {
                description:
                  'Manga Type\n\n`Manga` `Novel` `Light Novel` `One-shot` `Doujinshi` `Manhua` `Manhwa` `OEL`',
                type: ['string', 'null'],
                enum: [
                  'Manga',
                  'Novel',
                  'Light Novel',
                  'One-shot',
                  'Doujinshi',
                  'Manhua',
                  'Manhwa',
                  'OEL',
                ],
              },
              chapters: { description: 'Chapter count', type: ['integer', 'null'] },
              volumes: { description: 'Volume count', type: ['integer', 'null'] },
              status: {
                description:
                  'Publishing status\n\n`Finished` `Publishing` `On Hiatus` `Discontinued` `Not yet published`',
                type: 'string',
                enum: ['Finished', 'Publishing', 'On Hiatus', 'Discontinued', 'Not yet published'],
              },
              publishing: { description: 'Publishing boolean', type: 'boolean' },
              published: {
                description: 'Date range',
                type: 'object',
                properties: {
                  from: { description: 'Date ISO8601', type: ['string', 'null'] },
                  to: { description: 'Date ISO8601', type: ['string', 'null'] },
                  prop: {
                    description: 'Date Prop',
                    type: 'object',
                    properties: {
                      from: {
                        description: 'Date Prop From',
                        type: 'object',
                        properties: {
                          day: { description: 'Day', type: ['integer', 'null'] },
                          month: { description: 'Month', type: ['integer', 'null'] },
                          year: { description: 'Year', type: ['integer', 'null'] },
                        },
                      },
                      to: {
                        description: 'Date Prop To',
                        type: 'object',
                        properties: {
                          day: { description: 'Day', type: ['integer', 'null'] },
                          month: { description: 'Month', type: ['integer', 'null'] },
                          year: { description: 'Year', type: ['integer', 'null'] },
                        },
                      },
                      string: { description: 'Raw parsed string', type: ['string', 'null'] },
                    },
                  },
                },
              },
              score: {
                description: 'Score',
                type: ['number', 'null'],
                format: 'float',
                minimum: -3.402823669209385e38,
                maximum: 3.402823669209385e38,
              },
              scored_by: { description: 'Number of users', type: ['integer', 'null'] },
              rank: { description: 'Ranking', type: ['integer', 'null'] },
              popularity: { description: 'Popularity', type: ['integer', 'null'] },
              members: {
                description: 'Number of users who have added this entry to their list',
                type: ['integer', 'null'],
              },
              favorites: {
                description: 'Number of users who have favorited this entry',
                type: ['integer', 'null'],
              },
              synopsis: { description: 'Synopsis', type: ['string', 'null'] },
              background: { description: 'Background', type: ['string', 'null'] },
              authors: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              serializations: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              genres: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              explicit_genres: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              themes: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
              demographics: {
                type: 'array',
                items: {
                  description: 'Parsed URL Data',
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                    type: { description: 'Type of resource', type: 'string' },
                    name: { description: 'Resource Name/Title', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                  },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
            items: {
              type: 'object',
              properties: {
                count: { type: 'integer' },
                total: { type: 'integer' },
                per_page: { type: 'integer' },
              },
            },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetTopPeople = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          limit: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'People Search',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Person Resource',
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              url: { description: 'MyAnimeList URL', type: 'string' },
              website_url: { description: "Person's website URL", type: ['string', 'null'] },
              images: {
                type: 'object',
                properties: {
                  jpg: {
                    description: 'Available images in JPG',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    },
                  },
                },
              },
              name: { description: 'Name', type: 'string' },
              given_name: { description: 'Given Name', type: ['string', 'null'] },
              family_name: { description: 'Family Name', type: ['string', 'null'] },
              alternate_names: {
                description: 'Other Names',
                type: 'array',
                items: { type: 'string' },
              },
              birthday: { description: 'Birthday Date ISO8601', type: ['string', 'null'] },
              favorites: {
                description: 'Number of users who have favorited this entry',
                type: 'integer',
              },
              about: { description: 'Biography', type: ['string', 'null'] },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
            items: {
              type: 'object',
              properties: {
                count: { type: 'integer' },
                total: { type: 'integer' },
                per_page: { type: 'integer' },
              },
            },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetTopReviews = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          type: {
            description: 'The type of reviews to filter by. Defaults to anime.',
            type: 'string',
            enum: ['anime', 'manga'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          preliminary: {
            type: 'boolean',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              'Whether the results include preliminary reviews or not. Defaults to true.',
          },
          spoilers: {
            type: 'boolean',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description:
              'Whether the results include reviews with spoilers or not. Defaults to true.',
          },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                anyOf: [
                  {
                    type: 'object',
                    properties: {
                      user: {
                        type: 'object',
                        properties: {
                          username: { description: 'MyAnimeList Username', type: 'string' },
                          url: { description: 'MyAnimeList Profile URL', type: 'string' },
                          images: {
                            type: 'object',
                            properties: {
                              jpg: {
                                description: 'Available images in JPG',
                                type: 'object',
                                properties: {
                                  image_url: {
                                    description: 'Image URL JPG',
                                    type: ['string', 'null'],
                                  },
                                },
                              },
                              webp: {
                                description: 'Available images in WEBP',
                                type: 'object',
                                properties: {
                                  image_url: {
                                    description: 'Image URL WEBP',
                                    type: ['string', 'null'],
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      anime: {
                        type: 'object',
                        properties: {
                          mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                          url: { description: 'MyAnimeList URL', type: 'string' },
                          images: {
                            type: 'object',
                            properties: {
                              jpg: {
                                description: 'Available images in JPG',
                                type: 'object',
                                properties: {
                                  image_url: {
                                    description: 'Image URL JPG',
                                    type: ['string', 'null'],
                                  },
                                  small_image_url: {
                                    description: 'Small Image URL JPG',
                                    type: ['string', 'null'],
                                  },
                                  large_image_url: {
                                    description: 'Image URL JPG',
                                    type: ['string', 'null'],
                                  },
                                },
                              },
                              webp: {
                                description: 'Available images in WEBP',
                                type: 'object',
                                properties: {
                                  image_url: {
                                    description: 'Image URL WEBP',
                                    type: ['string', 'null'],
                                  },
                                  small_image_url: {
                                    description: 'Small Image URL WEBP',
                                    type: ['string', 'null'],
                                  },
                                  large_image_url: {
                                    description: 'Image URL WEBP',
                                    type: ['string', 'null'],
                                  },
                                },
                              },
                            },
                          },
                          title: { description: 'Entry title', type: 'string' },
                        },
                      },
                      mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                      url: { description: 'MyAnimeList review URL', type: 'string' },
                      type: { description: 'Entry type', type: 'string' },
                      reactions: {
                        description: 'User reaction count on the review',
                        type: 'object',
                        properties: {
                          overall: { description: 'Overall reaction count', type: 'integer' },
                          nice: { description: 'Nice reaction count', type: 'integer' },
                          love_it: { description: 'Love it reaction count', type: 'integer' },
                          funny: { description: 'Funny reaction count', type: 'integer' },
                          confusing: { description: 'Confusing reaction count', type: 'integer' },
                          informative: {
                            description: 'Informative reaction count',
                            type: 'integer',
                          },
                          well_written: {
                            description: 'Well written reaction count',
                            type: 'integer',
                          },
                          creative: { description: 'Creative reaction count', type: 'integer' },
                        },
                      },
                      date: { description: 'Review created date ISO8601', type: 'string' },
                      review: { description: 'Review content', type: 'string' },
                      score: { description: 'Number of user votes on the Review', type: 'integer' },
                      tags: {
                        description: 'Review tags',
                        type: 'array',
                        items: { type: 'string' },
                      },
                      is_spoiler: { description: 'The review contains spoiler', type: 'boolean' },
                      is_preliminary: {
                        description: 'The review was made before the entry was completed',
                        type: 'boolean',
                      },
                      episodes_watched: {
                        description: 'Number of episodes watched',
                        type: 'integer',
                      },
                    },
                  },
                  {
                    type: 'object',
                    properties: {
                      user: {
                        type: 'object',
                        properties: {
                          username: { description: 'MyAnimeList Username', type: 'string' },
                          url: { description: 'MyAnimeList Profile URL', type: 'string' },
                          images: {
                            type: 'object',
                            properties: {
                              jpg: {
                                description: 'Available images in JPG',
                                type: 'object',
                                properties: {
                                  image_url: {
                                    description: 'Image URL JPG',
                                    type: ['string', 'null'],
                                  },
                                },
                              },
                              webp: {
                                description: 'Available images in WEBP',
                                type: 'object',
                                properties: {
                                  image_url: {
                                    description: 'Image URL WEBP',
                                    type: ['string', 'null'],
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      manga: {
                        type: 'object',
                        properties: {
                          mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                          url: { description: 'MyAnimeList URL', type: 'string' },
                          images: {
                            type: 'object',
                            properties: {
                              jpg: {
                                description: 'Available images in JPG',
                                type: 'object',
                                properties: {
                                  image_url: {
                                    description: 'Image URL JPG',
                                    type: ['string', 'null'],
                                  },
                                  small_image_url: {
                                    description: 'Small Image URL JPG',
                                    type: ['string', 'null'],
                                  },
                                  large_image_url: {
                                    description: 'Image URL JPG',
                                    type: ['string', 'null'],
                                  },
                                },
                              },
                              webp: {
                                description: 'Available images in WEBP',
                                type: 'object',
                                properties: {
                                  image_url: {
                                    description: 'Image URL WEBP',
                                    type: ['string', 'null'],
                                  },
                                  small_image_url: {
                                    description: 'Small Image URL WEBP',
                                    type: ['string', 'null'],
                                  },
                                  large_image_url: {
                                    description: 'Image URL WEBP',
                                    type: ['string', 'null'],
                                  },
                                },
                              },
                            },
                          },
                          title: { description: 'Entry title', type: 'string' },
                        },
                      },
                      mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                      url: { description: 'MyAnimeList review URL', type: 'string' },
                      type: { description: 'Entry type', type: 'string' },
                      reactions: {
                        description: 'User reaction count on the review',
                        type: 'object',
                        properties: {
                          overall: { description: 'Overall reaction count', type: 'integer' },
                          nice: { description: 'Nice reaction count', type: 'integer' },
                          love_it: { description: 'Love it reaction count', type: 'integer' },
                          funny: { description: 'Funny reaction count', type: 'integer' },
                          confusing: { description: 'Confusing reaction count', type: 'integer' },
                          informative: {
                            description: 'Informative reaction count',
                            type: 'integer',
                          },
                          well_written: {
                            description: 'Well written reaction count',
                            type: 'integer',
                          },
                          creative: { description: 'Creative reaction count', type: 'integer' },
                        },
                      },
                      date: { description: 'Review created date ISO8601', type: 'string' },
                      review: { description: 'Review content', type: 'string' },
                      score: { description: 'Number of user votes on the Review', type: 'integer' },
                      tags: {
                        description: 'Review tags',
                        type: 'array',
                        items: { type: 'string' },
                      },
                      is_spoiler: { description: 'The review contains spoiler', type: 'boolean' },
                      is_preliminary: {
                        description: 'The review was made before the entry was completed',
                        type: 'boolean',
                      },
                    },
                  },
                ],
              },
            },
            pagination: {
              type: 'object',
              properties: {
                last_visible_page: { type: 'integer' },
                has_next_page: { type: 'boolean' },
              },
            },
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetUserAbout = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          username: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: ['username'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              about: {
                description:
                  'User About. NOTE: About information is customizable by users through BBCode on MyAnimeList. This means users can add multimedia content, different text sizes, etc. Due to this freeform, Jikan returns parsed HTML. Validate on your end!',
                type: ['string', 'null'],
              },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetUserAnimelist = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          username: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: ['username'],
      },
      {
        type: 'object',
        properties: {
          status: {
            description: "User's anime list status filter options",
            type: 'string',
            enum: ['all', 'watching', 'completed', 'onhold', 'dropped', 'plantowatch'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
        },
        required: [],
      },
    ],
  },
  response: { '200': { $schema: 'http://json-schema.org/draft-04/schema#' } },
} as const;
const GetUserById = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: { id: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' } },
        required: ['id'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          description: 'User Meta By ID',
          properties: {
            url: { description: 'MyAnimeList URL', type: 'string' },
            username: { description: 'MyAnimeList Username', type: 'string' },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetUserClubs = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          username: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: ['username'],
      },
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'User Clubs',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              mal_id: { description: 'MyAnimeList ID', type: 'integer' },
              name: { description: 'Club Name', type: 'string' },
              url: { description: 'Club URL', type: 'string' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetUserExternal = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          username: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: ['username'],
      },
    ],
  },
  response: {
    '200': {
      description: 'External links',
      properties: {
        data: {
          type: 'array',
          items: {
            properties: { name: { type: 'string' }, url: { type: 'string' } },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetUserFavorites = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          username: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: ['username'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          properties: {
            anime: {
              description: 'Favorite Anime',
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  start_year: { type: 'integer' },
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  images: {
                    type: 'object',
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL JPG',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL JPG',
                            type: ['string', 'null'],
                          },
                        },
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL WEBP',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL WEBP',
                            type: ['string', 'null'],
                          },
                        },
                      },
                    },
                  },
                  title: { description: 'Entry title', type: 'string' },
                },
              },
            },
            manga: {
              description: 'Favorite Manga',
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  start_year: { type: 'integer' },
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  images: {
                    type: 'object',
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL JPG',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL JPG',
                            type: ['string', 'null'],
                          },
                        },
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL WEBP',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL WEBP',
                            type: ['string', 'null'],
                          },
                        },
                      },
                    },
                  },
                  title: { description: 'Entry title', type: 'string' },
                },
              },
            },
            characters: {
              description: 'Favorite Characters',
              type: 'array',
              items: {
                type: 'object',
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  images: {
                    type: 'object',
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL JPG',
                            type: ['string', 'null'],
                          },
                        },
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL WEBP',
                            type: ['string', 'null'],
                          },
                        },
                      },
                    },
                  },
                  name: { description: 'Entry name', type: 'string' },
                  type: { description: 'Type of resource', type: 'string' },
                  title: { description: 'Resource Name/Title', type: 'string' },
                },
              },
            },
            people: {
              description: 'Favorite People',
              type: 'array',
              items: {
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  images: {
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL JPG',
                            type: ['string', 'null'],
                          },
                        },
                        type: 'object',
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL WEBP',
                            type: ['string', 'null'],
                          },
                        },
                        type: 'object',
                      },
                    },
                    type: 'object',
                  },
                  name: { description: 'Entry name', type: 'string' },
                },
                type: 'object',
              },
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetUserFriends = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          username: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: ['username'],
      },
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'User Friends',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  username: { description: 'MyAnimeList Username', type: 'string' },
                  url: { description: 'MyAnimeList Profile URL', type: 'string' },
                  images: {
                    type: 'object',
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                        },
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                        },
                      },
                    },
                  },
                },
              },
              last_online: { description: 'Last Online Date ISO8601 format', type: 'string' },
              friends_since: { description: 'Friends Since Date ISO8601 format', type: 'string' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetUserFullProfile = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          username: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: ['username'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          description: 'Transform the resource into an array.',
          properties: {
            mal_id: { description: 'MyAnimeList ID', type: ['integer', 'null'] },
            username: { description: 'MyAnimeList Username', type: 'string' },
            url: { description: 'MyAnimeList URL', type: 'string' },
            images: {
              properties: {
                jpg: {
                  description: 'Available images in JPG',
                  properties: {
                    image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
                webp: {
                  description: 'Available images in WEBP',
                  properties: {
                    image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            last_online: { description: 'Last Online Date ISO8601', type: ['string', 'null'] },
            gender: { description: 'User Gender', type: ['string', 'null'] },
            birthday: { description: 'Birthday Date ISO8601', type: ['string', 'null'] },
            location: { description: 'Location', type: ['string', 'null'] },
            joined: { description: 'Joined Date ISO8601', type: ['string', 'null'] },
            statistics: {
              properties: {
                anime: {
                  description: 'Anime Statistics',
                  properties: {
                    days_watched: {
                      description: 'Number of days spent watching Anime',
                      type: 'number',
                      format: 'float',
                      minimum: -3.402823669209385e38,
                      maximum: 3.402823669209385e38,
                    },
                    mean_score: {
                      description: 'Mean Score',
                      type: 'number',
                      format: 'float',
                      minimum: -3.402823669209385e38,
                      maximum: 3.402823669209385e38,
                    },
                    watching: { description: 'Anime Watching', type: 'integer' },
                    completed: { description: 'Anime Completed', type: 'integer' },
                    on_hold: { description: 'Anime On-Hold', type: 'integer' },
                    dropped: { description: 'Anime Dropped', type: 'integer' },
                    plan_to_watch: { description: 'Anime Planned to Watch', type: 'integer' },
                    total_entries: {
                      description: 'Total Anime entries on User list',
                      type: 'integer',
                    },
                    rewatched: { description: 'Anime re-watched', type: 'integer' },
                    episodes_watched: {
                      description: 'Number of Anime Episodes Watched',
                      type: 'integer',
                    },
                  },
                  type: 'object',
                },
                manga: {
                  description: 'Manga Statistics',
                  properties: {
                    days_read: {
                      description: 'Number of days spent reading Manga',
                      type: 'number',
                      format: 'float',
                      minimum: -3.402823669209385e38,
                      maximum: 3.402823669209385e38,
                    },
                    mean_score: {
                      description: 'Mean Score',
                      type: 'number',
                      format: 'float',
                      minimum: -3.402823669209385e38,
                      maximum: 3.402823669209385e38,
                    },
                    reading: { description: 'Manga Reading', type: 'integer' },
                    completed: { description: 'Manga Completed', type: 'integer' },
                    on_hold: { description: 'Manga On-Hold', type: 'integer' },
                    dropped: { description: 'Manga Dropped', type: 'integer' },
                    plan_to_read: { description: 'Manga Planned to Read', type: 'integer' },
                    total_entries: {
                      description: 'Total Manga entries on User list',
                      type: 'integer',
                    },
                    reread: { description: 'Manga re-read', type: 'integer' },
                    chapters_read: {
                      description: 'Number of Manga Chapters Read',
                      type: 'integer',
                    },
                    volumes_read: { description: 'Number of Manga Volumes Read', type: 'integer' },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            external: {
              type: 'array',
              items: {
                properties: { name: { type: 'string' }, url: { type: 'string' } },
                type: 'object',
              },
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetUserHistory = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          username: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: ['username'],
      },
      {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['anime', 'manga'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          type: 'array',
          items: {
            description: 'Transform the resource into an array.',
            properties: {
              entry: {
                description: 'Parsed URL Data',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  type: { description: 'Type of resource', type: 'string' },
                  name: { description: 'Resource Name/Title', type: 'string' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                },
                type: 'object',
              },
              increment: {
                description: 'Number of episodes/chapters watched/read',
                type: 'integer',
              },
              date: { description: 'Date ISO8601', type: 'string' },
            },
            type: 'object',
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetUserMangaList = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          username: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: ['username'],
      },
      {
        type: 'object',
        properties: {
          status: {
            description: "User's anime list status filter options",
            type: 'string',
            enum: ['all', 'reading', 'completed', 'onhold', 'dropped', 'plantoread'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
        },
        required: [],
      },
    ],
  },
  response: { '200': { $schema: 'http://json-schema.org/draft-04/schema#' } },
} as const;
const GetUserProfile = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          username: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: ['username'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          properties: {
            mal_id: { description: 'MyAnimeList ID', type: ['integer', 'null'] },
            username: { description: 'MyAnimeList Username', type: 'string' },
            url: { description: 'MyAnimeList URL', type: 'string' },
            images: {
              properties: {
                jpg: {
                  description: 'Available images in JPG',
                  properties: {
                    image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
                webp: {
                  description: 'Available images in WEBP',
                  properties: {
                    image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                  },
                  type: 'object',
                },
              },
              type: 'object',
            },
            last_online: { description: 'Last Online Date ISO8601', type: ['string', 'null'] },
            gender: { description: 'User Gender', type: ['string', 'null'] },
            birthday: { description: 'Birthday Date ISO8601', type: ['string', 'null'] },
            location: { description: 'Location', type: ['string', 'null'] },
            joined: { description: 'Joined Date ISO8601', type: ['string', 'null'] },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetUserRecommendations = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          username: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: ['username'],
      },
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Recommendations',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              mal_id: {
                description:
                  "MAL IDs of recommendations is both of the MAL ID's with a `-` delimiter",
                type: 'string',
              },
              entry: {
                description: 'Array of 2 entries that are being recommended to each other',
                type: 'array',
                items: {
                  type: 'object',
                  anyOf: [
                    {
                      properties: {
                        mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                        url: { description: 'MyAnimeList URL', type: 'string' },
                        images: {
                          type: 'object',
                          properties: {
                            jpg: {
                              description: 'Available images in JPG',
                              type: 'object',
                              properties: {
                                image_url: {
                                  description: 'Image URL JPG',
                                  type: ['string', 'null'],
                                },
                                small_image_url: {
                                  description: 'Small Image URL JPG',
                                  type: ['string', 'null'],
                                },
                                large_image_url: {
                                  description: 'Image URL JPG',
                                  type: ['string', 'null'],
                                },
                              },
                            },
                            webp: {
                              description: 'Available images in WEBP',
                              type: 'object',
                              properties: {
                                image_url: {
                                  description: 'Image URL WEBP',
                                  type: ['string', 'null'],
                                },
                                small_image_url: {
                                  description: 'Small Image URL WEBP',
                                  type: ['string', 'null'],
                                },
                                large_image_url: {
                                  description: 'Image URL WEBP',
                                  type: ['string', 'null'],
                                },
                              },
                            },
                          },
                        },
                        title: { description: 'Entry title', type: 'string' },
                      },
                      type: 'object',
                    },
                    {
                      properties: {
                        mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                        url: { description: 'MyAnimeList URL', type: 'string' },
                        images: {
                          type: 'object',
                          properties: {
                            jpg: {
                              description: 'Available images in JPG',
                              type: 'object',
                              properties: {
                                image_url: {
                                  description: 'Image URL JPG',
                                  type: ['string', 'null'],
                                },
                                small_image_url: {
                                  description: 'Small Image URL JPG',
                                  type: ['string', 'null'],
                                },
                                large_image_url: {
                                  description: 'Image URL JPG',
                                  type: ['string', 'null'],
                                },
                              },
                            },
                            webp: {
                              description: 'Available images in WEBP',
                              type: 'object',
                              properties: {
                                image_url: {
                                  description: 'Image URL WEBP',
                                  type: ['string', 'null'],
                                },
                                small_image_url: {
                                  description: 'Small Image URL WEBP',
                                  type: ['string', 'null'],
                                },
                                large_image_url: {
                                  description: 'Image URL WEBP',
                                  type: ['string', 'null'],
                                },
                              },
                            },
                          },
                        },
                        title: { description: 'Entry title', type: 'string' },
                      },
                      type: 'object',
                    },
                  ],
                },
              },
              content: {
                description: 'Recommendation context provided by the user',
                type: 'string',
              },
              user: {
                description: 'User Meta By ID',
                type: 'object',
                properties: {
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  username: { description: 'MyAnimeList Username', type: 'string' },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetUserReviews = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          username: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: ['username'],
      },
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                anyOf: [
                  {
                    type: 'object',
                    properties: {
                      user: {
                        type: 'object',
                        properties: {
                          username: { description: 'MyAnimeList Username', type: 'string' },
                          url: { description: 'MyAnimeList Profile URL', type: 'string' },
                          images: {
                            type: 'object',
                            properties: {
                              jpg: {
                                description: 'Available images in JPG',
                                type: 'object',
                                properties: {
                                  image_url: {
                                    description: 'Image URL JPG',
                                    type: ['string', 'null'],
                                  },
                                },
                              },
                              webp: {
                                description: 'Available images in WEBP',
                                type: 'object',
                                properties: {
                                  image_url: {
                                    description: 'Image URL WEBP',
                                    type: ['string', 'null'],
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      anime: {
                        type: 'object',
                        properties: {
                          mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                          url: { description: 'MyAnimeList URL', type: 'string' },
                          images: {
                            type: 'object',
                            properties: {
                              jpg: {
                                description: 'Available images in JPG',
                                type: 'object',
                                properties: {
                                  image_url: {
                                    description: 'Image URL JPG',
                                    type: ['string', 'null'],
                                  },
                                  small_image_url: {
                                    description: 'Small Image URL JPG',
                                    type: ['string', 'null'],
                                  },
                                  large_image_url: {
                                    description: 'Image URL JPG',
                                    type: ['string', 'null'],
                                  },
                                },
                              },
                              webp: {
                                description: 'Available images in WEBP',
                                type: 'object',
                                properties: {
                                  image_url: {
                                    description: 'Image URL WEBP',
                                    type: ['string', 'null'],
                                  },
                                  small_image_url: {
                                    description: 'Small Image URL WEBP',
                                    type: ['string', 'null'],
                                  },
                                  large_image_url: {
                                    description: 'Image URL WEBP',
                                    type: ['string', 'null'],
                                  },
                                },
                              },
                            },
                          },
                          title: { description: 'Entry title', type: 'string' },
                        },
                      },
                      mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                      url: { description: 'MyAnimeList review URL', type: 'string' },
                      type: { description: 'Entry type', type: 'string' },
                      reactions: {
                        description: 'User reaction count on the review',
                        type: 'object',
                        properties: {
                          overall: { description: 'Overall reaction count', type: 'integer' },
                          nice: { description: 'Nice reaction count', type: 'integer' },
                          love_it: { description: 'Love it reaction count', type: 'integer' },
                          funny: { description: 'Funny reaction count', type: 'integer' },
                          confusing: { description: 'Confusing reaction count', type: 'integer' },
                          informative: {
                            description: 'Informative reaction count',
                            type: 'integer',
                          },
                          well_written: {
                            description: 'Well written reaction count',
                            type: 'integer',
                          },
                          creative: { description: 'Creative reaction count', type: 'integer' },
                        },
                      },
                      date: { description: 'Review created date ISO8601', type: 'string' },
                      review: { description: 'Review content', type: 'string' },
                      score: { description: 'Number of user votes on the Review', type: 'integer' },
                      tags: {
                        description: 'Review tags',
                        type: 'array',
                        items: { type: 'string' },
                      },
                      is_spoiler: { description: 'The review contains spoiler', type: 'boolean' },
                      is_preliminary: {
                        description: 'The review was made before the entry was completed',
                        type: 'boolean',
                      },
                      episodes_watched: {
                        description: 'Number of episodes watched',
                        type: 'integer',
                      },
                    },
                  },
                  {
                    type: 'object',
                    properties: {
                      user: {
                        type: 'object',
                        properties: {
                          username: { description: 'MyAnimeList Username', type: 'string' },
                          url: { description: 'MyAnimeList Profile URL', type: 'string' },
                          images: {
                            type: 'object',
                            properties: {
                              jpg: {
                                description: 'Available images in JPG',
                                type: 'object',
                                properties: {
                                  image_url: {
                                    description: 'Image URL JPG',
                                    type: ['string', 'null'],
                                  },
                                },
                              },
                              webp: {
                                description: 'Available images in WEBP',
                                type: 'object',
                                properties: {
                                  image_url: {
                                    description: 'Image URL WEBP',
                                    type: ['string', 'null'],
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      manga: {
                        type: 'object',
                        properties: {
                          mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                          url: { description: 'MyAnimeList URL', type: 'string' },
                          images: {
                            type: 'object',
                            properties: {
                              jpg: {
                                description: 'Available images in JPG',
                                type: 'object',
                                properties: {
                                  image_url: {
                                    description: 'Image URL JPG',
                                    type: ['string', 'null'],
                                  },
                                  small_image_url: {
                                    description: 'Small Image URL JPG',
                                    type: ['string', 'null'],
                                  },
                                  large_image_url: {
                                    description: 'Image URL JPG',
                                    type: ['string', 'null'],
                                  },
                                },
                              },
                              webp: {
                                description: 'Available images in WEBP',
                                type: 'object',
                                properties: {
                                  image_url: {
                                    description: 'Image URL WEBP',
                                    type: ['string', 'null'],
                                  },
                                  small_image_url: {
                                    description: 'Small Image URL WEBP',
                                    type: ['string', 'null'],
                                  },
                                  large_image_url: {
                                    description: 'Image URL WEBP',
                                    type: ['string', 'null'],
                                  },
                                },
                              },
                            },
                          },
                          title: { description: 'Entry title', type: 'string' },
                        },
                      },
                      mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                      url: { description: 'MyAnimeList review URL', type: 'string' },
                      type: { description: 'Entry type', type: 'string' },
                      reactions: {
                        description: 'User reaction count on the review',
                        type: 'object',
                        properties: {
                          overall: { description: 'Overall reaction count', type: 'integer' },
                          nice: { description: 'Nice reaction count', type: 'integer' },
                          love_it: { description: 'Love it reaction count', type: 'integer' },
                          funny: { description: 'Funny reaction count', type: 'integer' },
                          confusing: { description: 'Confusing reaction count', type: 'integer' },
                          informative: {
                            description: 'Informative reaction count',
                            type: 'integer',
                          },
                          well_written: {
                            description: 'Well written reaction count',
                            type: 'integer',
                          },
                          creative: { description: 'Creative reaction count', type: 'integer' },
                        },
                      },
                      date: { description: 'Review created date ISO8601', type: 'string' },
                      review: { description: 'Review content', type: 'string' },
                      score: { description: 'Number of user votes on the Review', type: 'integer' },
                      tags: {
                        description: 'Review tags',
                        type: 'array',
                        items: { type: 'string' },
                      },
                      is_spoiler: { description: 'The review contains spoiler', type: 'boolean' },
                      is_preliminary: {
                        description: 'The review was made before the entry was completed',
                        type: 'boolean',
                      },
                    },
                  },
                ],
              },
            },
            pagination: {
              type: 'object',
              properties: {
                last_visible_page: { type: 'integer' },
                has_next_page: { type: 'boolean' },
              },
            },
          },
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetUserStatistics = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          username: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: ['username'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          properties: {
            anime: {
              description: 'Anime Statistics',
              properties: {
                days_watched: {
                  description: 'Number of days spent watching Anime',
                  type: 'number',
                  format: 'float',
                  minimum: -3.402823669209385e38,
                  maximum: 3.402823669209385e38,
                },
                mean_score: {
                  description: 'Mean Score',
                  type: 'number',
                  format: 'float',
                  minimum: -3.402823669209385e38,
                  maximum: 3.402823669209385e38,
                },
                watching: { description: 'Anime Watching', type: 'integer' },
                completed: { description: 'Anime Completed', type: 'integer' },
                on_hold: { description: 'Anime On-Hold', type: 'integer' },
                dropped: { description: 'Anime Dropped', type: 'integer' },
                plan_to_watch: { description: 'Anime Planned to Watch', type: 'integer' },
                total_entries: { description: 'Total Anime entries on User list', type: 'integer' },
                rewatched: { description: 'Anime re-watched', type: 'integer' },
                episodes_watched: {
                  description: 'Number of Anime Episodes Watched',
                  type: 'integer',
                },
              },
              type: 'object',
            },
            manga: {
              description: 'Manga Statistics',
              properties: {
                days_read: {
                  description: 'Number of days spent reading Manga',
                  type: 'number',
                  format: 'float',
                  minimum: -3.402823669209385e38,
                  maximum: 3.402823669209385e38,
                },
                mean_score: {
                  description: 'Mean Score',
                  type: 'number',
                  format: 'float',
                  minimum: -3.402823669209385e38,
                  maximum: 3.402823669209385e38,
                },
                reading: { description: 'Manga Reading', type: 'integer' },
                completed: { description: 'Manga Completed', type: 'integer' },
                on_hold: { description: 'Manga On-Hold', type: 'integer' },
                dropped: { description: 'Manga Dropped', type: 'integer' },
                plan_to_read: { description: 'Manga Planned to Read', type: 'integer' },
                total_entries: { description: 'Total Manga entries on User list', type: 'integer' },
                reread: { description: 'Manga re-read', type: 'integer' },
                chapters_read: { description: 'Number of Manga Chapters Read', type: 'integer' },
                volumes_read: { description: 'Number of Manga Volumes Read', type: 'integer' },
              },
              type: 'object',
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetUserUpdates = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          username: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: ['username'],
      },
    ],
  },
  response: {
    '200': {
      properties: {
        data: {
          properties: {
            anime: {
              description: 'Last updated Anime',
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  entry: {
                    type: 'object',
                    properties: {
                      mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                      url: { description: 'MyAnimeList URL', type: 'string' },
                      images: {
                        type: 'object',
                        properties: {
                          jpg: {
                            description: 'Available images in JPG',
                            type: 'object',
                            properties: {
                              image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                              small_image_url: {
                                description: 'Small Image URL JPG',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL JPG',
                                type: ['string', 'null'],
                              },
                            },
                          },
                          webp: {
                            description: 'Available images in WEBP',
                            type: 'object',
                            properties: {
                              image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              small_image_url: {
                                description: 'Small Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                            },
                          },
                        },
                      },
                      title: { description: 'Entry title', type: 'string' },
                    },
                  },
                  score: { type: ['integer', 'null'] },
                  status: { type: 'string' },
                  episodes_seen: { type: ['integer', 'null'] },
                  episodes_total: { type: ['integer', 'null'] },
                  date: { description: 'ISO8601 format', type: 'string' },
                },
              },
            },
            manga: {
              description: 'Last updated Manga',
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  entry: {
                    type: 'object',
                    properties: {
                      mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                      url: { description: 'MyAnimeList URL', type: 'string' },
                      images: {
                        type: 'object',
                        properties: {
                          jpg: {
                            description: 'Available images in JPG',
                            type: 'object',
                            properties: {
                              image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                              small_image_url: {
                                description: 'Small Image URL JPG',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL JPG',
                                type: ['string', 'null'],
                              },
                            },
                          },
                          webp: {
                            description: 'Available images in WEBP',
                            type: 'object',
                            properties: {
                              image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              small_image_url: {
                                description: 'Small Image URL WEBP',
                                type: ['string', 'null'],
                              },
                              large_image_url: {
                                description: 'Image URL WEBP',
                                type: ['string', 'null'],
                              },
                            },
                          },
                        },
                      },
                      title: { description: 'Entry title', type: 'string' },
                    },
                  },
                  score: { type: ['integer', 'null'] },
                  status: { type: 'string' },
                  chapters_read: { type: ['integer', 'null'] },
                  chapters_total: { type: ['integer', 'null'] },
                  volumes_read: { type: ['integer', 'null'] },
                  volumes_total: { type: ['integer', 'null'] },
                  date: { description: 'ISO8601 format', type: 'string' },
                },
              },
            },
          },
          type: 'object',
        },
      },
      type: 'object',
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetUsersSearch = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          limit: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          q: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
          gender: {
            description: 'Users Search Query Gender.',
            type: 'string',
            enum: ['any', 'male', 'female', 'nonbinary'],
            $schema: 'http://json-schema.org/draft-04/schema#',
          },
          location: { type: 'string', $schema: 'http://json-schema.org/draft-04/schema#' },
          maxAge: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
          minAge: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'User Results',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              url: { description: 'MyAnimeList URL', type: 'string' },
              username: { description: 'MyAnimeList Username', type: 'string' },
              images: {
                type: 'object',
                properties: {
                  jpg: {
                    description: 'Available images in JPG',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                    },
                  },
                  webp: {
                    description: 'Available images in WEBP',
                    type: 'object',
                    properties: {
                      image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                    },
                  },
                },
              },
              last_online: { description: 'Last Online Date ISO8601', type: 'string' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetWatchPopularEpisodes = {
  response: {
    '200': {
      description: 'Watch Episodes',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              entry: {
                type: 'object',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  images: {
                    type: 'object',
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL JPG',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL JPG',
                            type: ['string', 'null'],
                          },
                        },
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL WEBP',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL WEBP',
                            type: ['string', 'null'],
                          },
                        },
                      },
                    },
                  },
                  title: { description: 'Entry title', type: 'string' },
                },
              },
              episodes: {
                description: 'Recent Episodes (max 2 listed)',
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                    title: { description: 'Episode Title', type: 'string' },
                    premium: { description: 'For MyAnimeList Premium Users', type: 'boolean' },
                  },
                },
              },
              region_locked: { description: 'Region Locked Episode', type: 'boolean' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetWatchPopularPromos = {
  response: {
    '200': {
      description: 'Watch Promos',
      type: 'object',
      properties: {
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
        title: { description: 'Promo Title', type: 'string' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              entry: {
                type: 'object',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  images: {
                    type: 'object',
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL JPG',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL JPG',
                            type: ['string', 'null'],
                          },
                        },
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL WEBP',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL WEBP',
                            type: ['string', 'null'],
                          },
                        },
                      },
                    },
                  },
                  title: { description: 'Entry title', type: 'string' },
                },
              },
              trailer: {
                type: 'array',
                items: {
                  description: 'Youtube Images',
                  type: 'object',
                  properties: {
                    youtube_id: { description: 'YouTube ID', type: ['string', 'null'] },
                    url: { description: 'YouTube URL', type: ['string', 'null'] },
                    embed_url: { description: 'Parsed Embed URL', type: ['string', 'null'] },
                    images: {
                      type: 'object',
                      properties: {
                        image_url: {
                          description: 'Default Image Size URL (120x90)',
                          type: ['string', 'null'],
                        },
                        small_image_url: {
                          description: 'Small Image Size URL (640x480)',
                          type: ['string', 'null'],
                        },
                        medium_image_url: {
                          description: 'Medium Image Size URL (320x180)',
                          type: ['string', 'null'],
                        },
                        large_image_url: {
                          description: 'Large Image Size URL (480x360)',
                          type: ['string', 'null'],
                        },
                        maximum_image_url: {
                          description: 'Maximum Image Size URL (1280x720)',
                          type: ['string', 'null'],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetWatchRecentEpisodes = {
  response: {
    '200': {
      description: 'Watch Episodes',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              entry: {
                type: 'object',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  images: {
                    type: 'object',
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL JPG',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL JPG',
                            type: ['string', 'null'],
                          },
                        },
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL WEBP',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL WEBP',
                            type: ['string', 'null'],
                          },
                        },
                      },
                    },
                  },
                  title: { description: 'Entry title', type: 'string' },
                },
              },
              episodes: {
                description: 'Recent Episodes (max 2 listed)',
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    mal_id: { description: 'MyAnimeList ID', type: 'string' },
                    url: { description: 'MyAnimeList URL', type: 'string' },
                    title: { description: 'Episode Title', type: 'string' },
                    premium: { description: 'For MyAnimeList Premium Users', type: 'boolean' },
                  },
                },
              },
              region_locked: { description: 'Region Locked Episode', type: 'boolean' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
const GetWatchRecentPromos = {
  metadata: {
    allOf: [
      {
        type: 'object',
        properties: {
          page: { type: 'integer', $schema: 'http://json-schema.org/draft-04/schema#' },
        },
        required: [],
      },
    ],
  },
  response: {
    '200': {
      description: 'Watch Promos',
      type: 'object',
      properties: {
        pagination: {
          type: 'object',
          properties: {
            last_visible_page: { type: 'integer' },
            has_next_page: { type: 'boolean' },
          },
        },
        title: { description: 'Promo Title', type: 'string' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              entry: {
                type: 'object',
                properties: {
                  mal_id: { description: 'MyAnimeList ID', type: 'integer' },
                  url: { description: 'MyAnimeList URL', type: 'string' },
                  images: {
                    type: 'object',
                    properties: {
                      jpg: {
                        description: 'Available images in JPG',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL JPG', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL JPG',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL JPG',
                            type: ['string', 'null'],
                          },
                        },
                      },
                      webp: {
                        description: 'Available images in WEBP',
                        type: 'object',
                        properties: {
                          image_url: { description: 'Image URL WEBP', type: ['string', 'null'] },
                          small_image_url: {
                            description: 'Small Image URL WEBP',
                            type: ['string', 'null'],
                          },
                          large_image_url: {
                            description: 'Image URL WEBP',
                            type: ['string', 'null'],
                          },
                        },
                      },
                    },
                  },
                  title: { description: 'Entry title', type: 'string' },
                },
              },
              trailer: {
                type: 'array',
                items: {
                  description: 'Youtube Images',
                  type: 'object',
                  properties: {
                    youtube_id: { description: 'YouTube ID', type: ['string', 'null'] },
                    url: { description: 'YouTube URL', type: ['string', 'null'] },
                    embed_url: { description: 'Parsed Embed URL', type: ['string', 'null'] },
                    images: {
                      type: 'object',
                      properties: {
                        image_url: {
                          description: 'Default Image Size URL (120x90)',
                          type: ['string', 'null'],
                        },
                        small_image_url: {
                          description: 'Small Image Size URL (640x480)',
                          type: ['string', 'null'],
                        },
                        medium_image_url: {
                          description: 'Medium Image Size URL (320x180)',
                          type: ['string', 'null'],
                        },
                        large_image_url: {
                          description: 'Large Image Size URL (480x360)',
                          type: ['string', 'null'],
                        },
                        maximum_image_url: {
                          description: 'Maximum Image Size URL (1280x720)',
                          type: ['string', 'null'],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-04/schema#',
    },
  },
} as const;
export {
  GetAnimeById,
  GetAnimeCharacters,
  GetAnimeEpisodeById,
  GetAnimeEpisodes,
  GetAnimeExternal,
  GetAnimeForum,
  GetAnimeFullById,
  GetAnimeGenres,
  GetAnimeMoreInfo,
  GetAnimeNews,
  GetAnimePictures,
  GetAnimeRecommendations,
  GetAnimeRelations,
  GetAnimeReviews,
  GetAnimeSearch,
  GetAnimeStaff,
  GetAnimeStatistics,
  GetAnimeStreaming,
  GetAnimeThemes,
  GetAnimeUserUpdates,
  GetAnimeVideos,
  GetAnimeVideosEpisodes,
  GetCharacterAnime,
  GetCharacterById,
  GetCharacterFullById,
  GetCharacterManga,
  GetCharacterPictures,
  GetCharacterVoiceActors,
  GetCharactersSearch,
  GetClubMembers,
  GetClubRelations,
  GetClubStaff,
  GetClubsById,
  GetClubsSearch,
  GetMagazines,
  GetMangaById,
  GetMangaCharacters,
  GetMangaExternal,
  GetMangaFullById,
  GetMangaGenres,
  GetMangaMoreInfo,
  GetMangaNews,
  GetMangaPictures,
  GetMangaRecommendations,
  GetMangaRelations,
  GetMangaReviews,
  GetMangaSearch,
  GetMangaStatistics,
  GetMangaTopics,
  GetMangaUserUpdates,
  GetPeopleSearch,
  GetPersonAnime,
  GetPersonById,
  GetPersonFullById,
  GetPersonManga,
  GetPersonPictures,
  GetPersonVoices,
  GetProducerById,
  GetProducerExternal,
  GetProducerFullById,
  GetProducers,
  GetRandomAnime,
  GetRandomCharacters,
  GetRandomManga,
  GetRandomPeople,
  GetRandomUsers,
  GetRecentAnimeRecommendations,
  GetRecentAnimeReviews,
  GetRecentMangaRecommendations,
  GetRecentMangaReviews,
  GetSchedules,
  GetSeason,
  GetSeasonNow,
  GetSeasonUpcoming,
  GetSeasonsList,
  GetTopAnime,
  GetTopCharacters,
  GetTopManga,
  GetTopPeople,
  GetTopReviews,
  GetUserAbout,
  GetUserAnimelist,
  GetUserById,
  GetUserClubs,
  GetUserExternal,
  GetUserFavorites,
  GetUserFriends,
  GetUserFullProfile,
  GetUserHistory,
  GetUserMangaList,
  GetUserProfile,
  GetUserRecommendations,
  GetUserReviews,
  GetUserStatistics,
  GetUserUpdates,
  GetUsersSearch,
  GetWatchPopularEpisodes,
  GetWatchPopularPromos,
  GetWatchRecentEpisodes,
  GetWatchRecentPromos,
};
