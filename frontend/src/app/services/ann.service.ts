import { Injectable } from '@angular/core';
import { ExtRating } from '@models/components';

import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class AnnService {
  private readonly baseUrl = 'https://cdn.animenewsnetwork.com/encyclopedia/api.xml';

  constructor(private cache: CacheService) {}

  async getEntries(title: string) {
    const url = `${this.baseUrl}?title=~${title}`;
    const data = await this.cache.fetchRaw(url);
    return AnnService.xmlJson<AnnResponse>(data);
  }

  async getEntry(id: number, type: 'anime' | 'manga' = 'anime') {
    const url = `${this.baseUrl}?${type}=${id}`;
    const data = await this.cache.fetchRaw(url);
    const response = AnnService.xmlJson<AnnResponse>(data);
    if ('warning' in response.ann) return;
    return response.ann[type][0];
  }

  async getId(title: string, type: 'anime' | 'manga' = 'anime'): Promise<number | undefined> {
    const data = await this.getEntries(title);
    if ('warning' in data.ann) return;
    const entries = data.ann[type];
    if (!entries) return;
    if (entries.length === 1) return entries[0]._attributes.id;
    const { compareTwoStrings } = await import('string-similarity');
    const entriesByTitle = entries.filter(
      e => compareTwoStrings(e._attributes.name.toLowerCase(), title.toLowerCase()) > 0.9,
    );
    if (entriesByTitle.length === 1) return entriesByTitle[0]._attributes.id;
    return undefined;
  }

  async getRating(id?: number, type: 'anime' | 'manga' = 'anime'): Promise<ExtRating | undefined> {
    if (!id) return;
    const entry = await this.getEntry(id, type);
    if (!entry?.ratings) return;
    const score = Number(
      entry.ratings._attributes.bayesian_score || entry.ratings._attributes.weighted_score || 0,
    );
    if (!score) return;
    return {
      nom: score,
      norm: score * 10,
      ratings: Number(entry.ratings._attributes.nb_votes),
    };
  }

  static xmlJson<T>(xml: string): T {
    const { xml2json } = require('xml-js') as typeof import('xml-js');
    return JSON.parse(
      xml2json(xml, { alwaysArray: ['anime', 'manga'], nativeType: true, compact: true }),
    ) as T;
  }
}

interface AnnResponse {
  ann:
    | {
        anime: [AnnAnime];
        manga: [AnnManga];
      }
    | { warning: string };
}

interface AnnMedia {
  _attributes: {
    id: number;
    gid: number;
    type: string;
    name: string;
    precision: string;
    'generated-on': Date;
  };
  info: [AnnInfo];
  ratings: AnnRating;
  news: [AnnNews];
}

type AnnManga = AnnMedia;
type AnnAnime = AnnMedia;
type AnnInfo = AnnInfoImg | AnnInfoText;

interface AnnInfoImg {
  _attributes: {
    gid: number;
    type: 'Picture';
    src: string;
    width: number;
    height: number;
  };
  img: [
    {
      _attributes: {
        src: string;
        width: number;
        height: number;
      };
    },
  ];
}

interface AnnInfoText {
  _attributes: {
    gid: number;
    type:
      | 'Main title'
      | 'Alternative title'
      | 'Genres'
      | 'Themes'
      | 'Objectionable content'
      | 'Vintage'
      | 'Plot Summary';
    lang: string;
  };
  _text: string;
}

interface AnnRating {
  _attributes: {
    nb_votes: number;
    weighted_score: number;
    bayesian_score: number;
  };
}

export interface AnnNews {
  _attributes: {
    datetime: Date;
    href: URL;
  };
  _text: string;
}
// {
//     {
//       _attributes: {
//         gid: '1481067901';
//         type: 'Main title';
//         lang: 'EN';
//       };
//       _text: 'Death Parade';
//     },
//     {
//       _attributes: {
//         gid: '2860684941';
//         type: 'Alternative title';
//         lang: 'JA';
//       };
//       _text: 'デス・パレード';
//     },
//     {
//       _attributes: {
//         gid: '334226517';
//         type: 'Genres';
//       };
//       _text: 'drama';
//     },
//     {
//       _attributes: {
//         gid: '3565825656';
//         type: 'Genres';
//       };
//       _text: 'mystery';
//     },
//     {
//       _attributes: {
//         gid: '695467220';
//         type: 'Genres';
//       };
//       _text: 'psychological';
//     },
//     {
//       _attributes: {
//         gid: '2628510150';
//         type: 'Themes';
//       };
//       _text: 'death';
//     },
//     {
//       _attributes: {
//         gid: '1864855510';
//         type: 'Objectionable content';
//       };
//       _text: 'TA';
//     },
//     {
//       _attributes: {
//         gid: '1702081504';
//         type: 'Plot Summary';
//       };
//       _text: 'After death, humans go to either the eternal void or are reincarnated. However, where there\'s doubt as to were to place some occasional souls, these instead arrive at bar Quindecim, with no memories of having died. Decim, the bartender, challenges them to the Death Game, wherein they wager their "lives" and reveal their true natures. Decim himself is actually an arbiter in charge of deciding the fate of those that arrive at Quindecim - by pulling the darkness from deepest within them, he judges their ultimate fate.';
//     },
//     {
//       _attributes: {
//         gid: '2593362190';
//         type: 'Running time';
//       };
//       _text: '23';
//     },
//     {
//       _attributes: {
//         gid: '2036264748';
//         type: 'Number of episodes';
//       };
//       _text: '12';
//     },
//     {
//       _attributes: {
//         gid: '3058004669';
//         type: 'Vintage';
//       };
//       _text: '2015-01-09 to 2015-03-27';
//     },
//     {
//       _attributes: {
//         gid: '1661029738';
//         type: 'Opening Theme';
//       };
//       _text: '"Flyers" by BRADIO';
//     },
//     {
//       _attributes: {
//         gid: '3092703702';
//         type: 'Ending Theme';
//       };
//       _text: '"Last Theater" by NoisyCell';
//     },
//     {
//       _attributes: {
//         gid: '2982558227';
//         type: 'Official website';
//         lang: 'JA';
//         href: 'http://twitter.com/dp_anime';
//       };
//       _text: 'デス・パレード (dp_anime) | Twitter';
//     },
//     {
//       _attributes: {
//         gid: '3340556888';
//         type: 'Official website';
//         lang: 'JA';
//         href: 'http://www.ntv.co.jp/deathparade/';
//       };
//       _text: 'デス・パレード｜日本テレビ';
//     },
//     {
//       _attributes: {
//         gid: '3177701518';
//         type: 'Official website';
//         lang: 'JA';
//         href: 'https://www.vap.co.jp/deathparade/index.html';
//       };
//       _text: 'デス・パレード | 公式サイト';
//     },
//   ];
//   ratings: {
//     _attributes: {
//       nb_votes: '1181';
//       weighted_score: '7.8671';
//       bayesian_score: '7.86294';
//     };
//   };
//   episode: [
//     {
//       _attributes: {
//         num: '1';
//       };
//       title: {
//         _attributes: {
//           gid: '1456653355';
//           lang: 'EN';
//         };
//         _text: 'Death Seven Darts';
//       };
//     },
//     {
//       _attributes: {
//         num: '2';
//       };
//       title: {
//         _attributes: {
//           gid: '1553596212';
//           lang: 'EN';
//         };
//         _text: 'Death: Reverse';
//       };
//     },
//     {
//       _attributes: {
//         num: '3';
//       };
//       title: {
//         _attributes: {
//           gid: '3632238866';
//           lang: 'EN';
//         };
//         _text: 'Rolling Ballade';
//       };
//     },
//     {
//       _attributes: {
//         num: '4';
//       };
//       title: {
//         _attributes: {
//           gid: '1736113129';
//           lang: 'EN';
//         };
//         _text: 'Death Arcade';
//       };
//     },
//     {
//       _attributes: {
//         num: '5';
//       };
//       title: {
//         _attributes: {
//           gid: '2290946593';
//           lang: 'EN';
//         };
//         _text: 'Death March';
//       };
//     },
//     {
//       _attributes: {
//         num: '6';
//       };
//       title: {
//         _attributes: {
//           gid: '1072634501';
//           lang: 'EN';
//         };
//         _text: 'Cross Heart Attack';
//       };
//     },
//     {
//       _attributes: {
//         num: '7';
//       };
//       title: {
//         _attributes: {
//           gid: '1801588931';
//           lang: 'EN';
//         };
//         _text: 'Alcohol Poison';
//       };
//     },
//     {
//       _attributes: {
//         num: '8';
//       };
//       title: {
//         _attributes: {
//           gid: '2779981659';
//           lang: 'EN';
//         };
//         _text: 'Death Rally';
//       };
//     },
//     {
//       _attributes: {
//         num: '9';
//       };
//       title: {
//         _attributes: {
//           gid: '942952261';
//           lang: 'EN';
//         };
//         _text: 'Death Counter';
//       };
//     },
//     {
//       _attributes: {
//         num: '10';
//       };
//       title: {
//         _attributes: {
//           gid: '2405972550';
//           lang: 'EN';
//         };
//         _text: 'Story Teller';
//       };
//     },
//     {
//       _attributes: {
//         num: '11';
//       };
//       title: {
//         _attributes: {
//           gid: '2107941542';
//           lang: 'EN';
//         };
//         _text: 'Memento Mori';
//       };
//     },
//     {
//       _attributes: {
//         num: '12';
//       };
//       title: {
//         _attributes: {
//           gid: '2869155992';
//           lang: 'EN';
//         };
//         _text: 'Suicide Tour';
//       };
//     },
//   ];
//   review: {
//     _attributes: {
//       href: 'https://www.animenewsnetwork.com/review/death-parade/.86639';
//     };
//     _text: 'Death Parade Episodes 1-12 Streaming';
//   };
//   release: [
//     {
//       _attributes: {
//         date: '2018-09-04';
//         href: 'https://www.animenewsnetwork.com/encyclopedia/releases.php?id=38548';
//       };
//       _text: 'Death Parade - The Complete Series [Classics] (Blu-ray)';
//     },
//     {
//       _attributes: {
//         date: '2016-11-29';
//         href: 'https://www.animenewsnetwork.com/encyclopedia/releases.php?id=31956';
//       };
//       _text: 'Death Parade - The Complete Series (BD+DVD)';
//     },
//     {
//       _attributes: {
//         date: '2016-11-29';
//         href: 'https://www.animenewsnetwork.com/encyclopedia/releases.php?id=31955';
//       };
//       _text: 'Death Parade - The Complete Series [Limited Edition] (BD+DVD)';
//     },
//     {
//       _attributes: {
//         date: '2016-11-29';
//         href: 'https://www.animenewsnetwork.com/encyclopedia/releases.php?id=36695';
//       };
//       _text: 'Death Parade - The Complete Series [Walmart Exclusive] (DVD)';
//     },
//   ];
//   news: [
//     {
//       _attributes: {
//         datetime: '2014-10-31T13:30:00Z';
//         href: 'https://www.animenewsnetwork.com:/news/2014-10-31/anime-mirai-short-death-billiards-gets-tv-anime/.80532';
//       };
//       _text: '<cite>Anime Mirai</cite> Short <cite>Death Billiards</cite> Gets TV Anime (Update)';
//     },
//     {
//       _attributes: {
//         datetime: '2014-11-21T23:20:00Z';
//         href: 'https://www.animenewsnetwork.com:/news/2014-11-21/rumi-ookubo-yoshimasa-hosoya-join-death-parade-anime-cast/.81306';
//       };
//       _text: 'Rumi Ookubo, Yoshimasa Hosoya Join <cite>Death Parade</cite> Anime Cast';
//     },
//     {
//       _attributes: {
//         datetime: '2014-12-10T04:57:00Z';
//         href: 'https://www.animenewsnetwork.com:/news/2014-12-09/death-billiards-death-parade-tv-anime-slated-for-january-9/.81979';
//       };
//       _text: "<cite>Death Billiards'</cite> <cite>Death Parade</cite> TV Anime Slated for January 9";
//     },
//     {
//       _attributes: {
//         datetime: '2014-12-12T15:25:00Z';
//         href: 'https://www.animenewsnetwork.com:/news/2014-12-12/death-billiards-death-parade-show-previewed-in-2nd-video/.82081';
//       };
//       _text: "<cite>Death Billiards'</cite> <cite>Death Parade</cite> Show Previewed in 2nd Video";
//     },
//     {
//       _attributes: {
//         datetime: '2014-12-23T20:17:54Z';
//         href: 'https://www.animenewsnetwork.com:/news/2014-12-23/funimation-to-stream-death-parade-anime/.82562';
//       };
//       _text: 'Funimation to Stream <cite>Death Parade</cite> Anime';
//     },
//     {
//       _attributes: {
//         datetime: '2015-01-08T16:12:24Z';
//         href: 'https://www.animenewsnetwork.com:/news/2015-01-09/animelab-announces-six-new-titles-for-winter-season/.83041';
//       };
//       _text: 'AnimeLab Announces Six New Titles for Winter Season';
//     },
//     {
//       _attributes: {
//         datetime: '2015-01-11T21:30:00Z';
//         href: 'https://www.animenewsnetwork.com:/news/2015-01-11/death-parade-twitter-account-shares-key-animation-videos/.83141';
//       };
//       _text: '<cite>Death Parade</cite> Twitter Account Shares Key Animation Videos';
//     },
//     {
//       _attributes: {
//         datetime: '2015-02-13T22:52:15Z';
//         href: 'https://www.animenewsnetwork.com:/news/2015-02-13/funimation-dubs-assassination-classroom-death-parade-tokyo-ghoul-a-7-more-winter-shows/.84440';
//       };
//       _text: 'Funimation Dubs Assassination Classroom, Death Parade, Tokyo Ghoul √A, 7 More Winter Shows';
//     },
//     {
//       _attributes: {
//         datetime: '2015-02-17T23:00:00Z';
//         href: 'https://www.animenewsnetwork.com:/news/2015-02-17/funimation-announces-death-parade-english-dub-cast/.85107';
//       };
//       _text: 'Funimation Announces <cite>Death Parade</cite> English Dub Cast';
//     },
//     {
//       _attributes: {
//         datetime: '2015-03-25T04:00:00Z';
//         href: 'https://www.animenewsnetwork.com:/news/2015-03-25/death-parade-final-episode-long-preview-streamed/.86349';
//       };
//       _text: "<cite>Death Parade</cite> Final Episode's Long Preview Streamed";
//     },
//     {
//       _attributes: {
//         datetime: '2016-05-29T12:04:06Z';
//         href: 'https://www.animenewsnetwork.com:/news/2016-05-29/anime-limited-updates-from-mcm-london-comic-con/.102628';
//       };
//       _text: 'Anime Limited Updates from MCM London Comic Con (Updated 3)';
//     },
//     {
//       _attributes: {
//         datetime: '2016-06-01T02:28:57Z';
//         href: 'https://www.animenewsnetwork.com:/news/2016-06-01/anime-limited-updates/.102712';
//       };
//       _text: 'Anime Limited Updates';
//     },
//     {
//       _attributes: {
//         datetime: '2016-09-22T14:00:00Z';
//         href: 'https://www.animenewsnetwork.com:/news/2016-09-22/funimation-previews-death-parade-english-dub-in-video/.106710';
//       };
//       _text: 'Funimation Previews <cite>Death Parade</cite> English Dub in Video';
//     },
//     {
//       _attributes: {
//         datetime: '2016-11-29T21:45:00Z';
//         href: 'https://www.animenewsnetwork.com:/news/2016-11-29/north-american-anime-manga-releases-november-27-december-3/.109310';
//       };
//       _text: 'North American Anime, Manga Releases, November 27-December 3';
//     },
//     {
//       _attributes: {
//         datetime: '2017-05-17T17:50:00Z';
//         href: 'https://www.animenewsnetwork.com:/news/2017-05-17/english-subtitled-death-parade-the-rolling-girls-more-move-to-crunchyroll/.116223';
//       };
//       _text: 'English-Subtitled <cite>Death Parade, The Rolling Girls,</cite> More Move to Crunchyroll';
//     },
//     {
//       _attributes: {
//         datetime: '2018-05-20T06:12:21Z';
//         href: 'https://www.animenewsnetwork.com:/news/2018-05-20/anime-limited-delists-ten-titles/.131781';
//       };
//       _text: 'Anime Limited Delists Ten Titles';
//     },
//     {
//       _attributes: {
//         datetime: '2018-09-04T21:10:00Z';
//         href: 'https://www.animenewsnetwork.com:/news/2018-09-04/north-american-anime-manga-releases-september-2-8/.136347';
//       };
//       _text: 'North American Anime, Manga Releases, September 2-8';
//     },
//     {
//       _attributes: {
//         datetime: '2018-12-12T00:01:00Z';
//         href: 'https://www.animenewsnetwork.com:/news/2018-12-11/star-blazers-space-battleship-yamato-anime-also-removed-from-crunchyroll/.140538';
//       };
//       _text: '<cite>Star Blazers: Space Battleship Yamato</cite> Anime Also Removed From Crunchyroll';
//     },
//   ];
//   staff: [
//     {
//       _attributes: {
//         gid: '2800112793';
//       };
//       task: {
//         _text: 'Director';
//       };
//       person: {
//         _attributes: {
//           id: '774';
//         };
//         _text: 'Shinichiro Watanabe';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2266522432';
//       };
//       task: {
//         _text: 'Director';
//       };
//       person: {
//         _attributes: {
//           id: '84034';
//         };
//         _text: 'Yuzuru Tachikawa';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2442967402';
//       };
//       task: {
//         _text: 'Screenplay';
//       };
//       person: {
//         _attributes: {
//           id: '84034';
//         };
//         _text: 'Yuzuru Tachikawa';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1702304457';
//       };
//       task: {
//         _text: 'Storyboard';
//       };
//       person: {
//         _attributes: {
//           id: '1478';
//         };
//         _text: 'Keiji Gotoh';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2822944637';
//       };
//       task: {
//         _text: 'Storyboard';
//       };
//       person: {
//         _attributes: {
//           id: '1724';
//         };
//         _text: 'Shinsaku Sasaki';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2415642330';
//       };
//       task: {
//         _text: 'Storyboard';
//       };
//       person: {
//         _attributes: {
//           id: '22184';
//         };
//         _text: 'Jun Shishido';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2290411318';
//       };
//       task: {
//         _text: 'Storyboard';
//       };
//       person: {
//         _attributes: {
//           id: '24059';
//         };
//         _text: 'Hiroshi Kobayashi';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1326615644';
//       };
//       task: {
//         _text: 'Storyboard';
//       };
//       person: {
//         _attributes: {
//           id: '67114';
//         };
//         _text: 'migmi';
//       };
//     },
//     {
//       _attributes: {
//         gid: '490067880';
//       };
//       task: {
//         _text: 'Storyboard';
//       };
//       person: {
//         _attributes: {
//           id: '84034';
//         };
//         _text: 'Yuzuru Tachikawa';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2015232728';
//       };
//       task: {
//         _text: 'Storyboard';
//       };
//       person: {
//         _attributes: {
//           id: '100246';
//         };
//         _text: 'Yuuzou Satou';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1337028940';
//       };
//       task: {
//         _text: 'Storyboard';
//       };
//       person: {
//         _attributes: {
//           id: '102649';
//         };
//         _text: 'Yousuke Hatta';
//       };
//     },
//     {
//       _attributes: {
//         gid: '3823538692';
//       };
//       task: {
//         _text: 'Episode Director';
//       };
//       person: {
//         _attributes: {
//           id: '9819';
//         };
//         _text: 'Kiyoshi Murayama';
//       };
//     },
//     {
//       _attributes: {
//         gid: '648779933';
//       };
//       task: {
//         _text: 'Episode Director';
//       };
//       person: {
//         _attributes: {
//           id: '22184';
//         };
//         _text: 'Jun Shishido';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1275350415';
//       };
//       task: {
//         _text: 'Episode Director';
//       };
//       person: {
//         _attributes: {
//           id: '67114';
//         };
//         _text: 'migmi';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1141656529';
//       };
//       task: {
//         _text: 'Episode Director';
//       };
//       person: {
//         _attributes: {
//           id: '84034';
//         };
//         _text: 'Yuzuru Tachikawa';
//       };
//     },
//     {
//       _attributes: {
//         gid: '278007307';
//       };
//       task: {
//         _text: 'Episode Director';
//       };
//       person: {
//         _attributes: {
//           id: '102649';
//         };
//         _text: 'Yousuke Hatta';
//       };
//     },
//     {
//       _attributes: {
//         gid: '991396924';
//       };
//       task: {
//         _text: 'Episode Director';
//       };
//       person: {
//         _attributes: {
//           id: '105591';
//         };
//         _text: "Shin'ichirō Ushijima";
//       };
//     },
//     {
//       _attributes: {
//         gid: '1261715131';
//       };
//       task: {
//         _text: 'Episode Director';
//       };
//       person: {
//         _attributes: {
//           id: '105947';
//         };
//         _text: 'Shigatsu Yoshikawa';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2262246508';
//       };
//       task: {
//         _text: 'Episode Director';
//       };
//       person: {
//         _attributes: {
//           id: '111391';
//         };
//         _text: 'Motohiro Abe';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1560955503';
//       };
//       task: {
//         _text: 'Unit Director';
//       };
//       person: {
//         _attributes: {
//           id: '84034';
//         };
//         _text: 'Yuzuru Tachikawa';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1147345326';
//       };
//       task: {
//         _text: 'Music';
//       };
//       person: {
//         _attributes: {
//           id: '118529';
//         };
//         _text: 'Yuki Hayashi';
//       };
//     },
//     {
//       _attributes: {
//         gid: '695351074';
//       };
//       task: {
//         _text: 'Original creator';
//       };
//       person: {
//         _attributes: {
//           id: '84034';
//         };
//         _text: 'Yuzuru Tachikawa';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2044603250';
//       };
//       task: {
//         _text: 'Character Design';
//       };
//       person: {
//         _attributes: {
//           id: '63641';
//         };
//         _text: 'Shinichi Kurita';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2697302997';
//       };
//       task: {
//         _text: 'Art Director';
//       };
//       person: {
//         _attributes: {
//           id: '51401';
//         };
//         _text: 'Satoru Hirayanagi';
//       };
//     },
//     {
//       _attributes: {
//         gid: '3556588527';
//       };
//       task: {
//         _text: 'Chief Animation Director';
//       };
//       person: {
//         _attributes: {
//           id: '63641';
//         };
//         _text: 'Shinichi Kurita';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1712384768';
//       };
//       task: {
//         _text: 'Animation Director';
//       };
//       person: {
//         _attributes: {
//           id: '10443';
//         };
//         _text: 'Shinichi Miyamae';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2976719052';
//       };
//       task: {
//         _text: 'Animation Director';
//       };
//       person: {
//         _attributes: {
//           id: '11830';
//         };
//         _text: 'Hiromi Okazaki';
//       };
//     },
//     {
//       _attributes: {
//         gid: '404297116';
//       };
//       task: {
//         _text: 'Animation Director';
//       };
//       person: {
//         _attributes: {
//           id: '22810';
//         };
//         _text: 'Sadatoshi Matsusaka';
//       };
//     },
//     {
//       _attributes: {
//         gid: '3375539567';
//       };
//       task: {
//         _text: 'Animation Director';
//       };
//       person: {
//         _attributes: {
//           id: '24049';
//         };
//         _text: 'Masanori Shino';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2144285881';
//       };
//       task: {
//         _text: 'Animation Director';
//       };
//       person: {
//         _attributes: {
//           id: '25204';
//         };
//         _text: 'Haruhito Takada';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1638120126';
//       };
//       task: {
//         _text: 'Animation Director';
//       };
//       person: {
//         _attributes: {
//           id: '34045';
//         };
//         _text: 'Atsuko Yamazaki';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1262173547';
//       };
//       task: {
//         _text: 'Animation Director';
//       };
//       person: {
//         _attributes: {
//           id: '36314';
//         };
//         _text: 'Kyong Nam Ko';
//       };
//     },
//     {
//       _attributes: {
//         gid: '4013343491';
//       };
//       task: {
//         _text: 'Animation Director';
//       };
//       person: {
//         _attributes: {
//           id: '41718';
//         };
//         _text: 'Keiko Yamamoto';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1544966656';
//       };
//       task: {
//         _text: 'Animation Director';
//       };
//       person: {
//         _attributes: {
//           id: '59168';
//         };
//         _text: 'Young Sik Hwang';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1112278264';
//       };
//       task: {
//         _text: 'Animation Director';
//       };
//       person: {
//         _attributes: {
//           id: '63641';
//         };
//         _text: 'Shinichi Kurita';
//       };
//     },
//     {
//       _attributes: {
//         gid: '916900817';
//       };
//       task: {
//         _text: 'Animation Director';
//       };
//       person: {
//         _attributes: {
//           id: '68199';
//         };
//         _text: 'Ik Hyun Eum';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1959453811';
//       };
//       task: {
//         _text: 'Animation Director';
//       };
//       person: {
//         _attributes: {
//           id: '75454';
//         };
//         _text: 'Chang Hwan Park';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2262313849';
//       };
//       task: {
//         _text: 'Animation Director';
//       };
//       person: {
//         _attributes: {
//           id: '76998';
//         };
//         _text: 'Shōsuke Ishibashi';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1034269073';
//       };
//       task: {
//         _text: 'Animation Director';
//       };
//       person: {
//         _attributes: {
//           id: '81072';
//         };
//         _text: 'Ryōta Azuma';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2675514454';
//       };
//       task: {
//         _text: 'Animation Director';
//       };
//       person: {
//         _attributes: {
//           id: '100561';
//         };
//         _text: 'Eiko Mishima';
//       };
//     },
//     {
//       _attributes: {
//         gid: '620837790';
//       };
//       task: {
//         _text: 'Animation Director';
//       };
//       person: {
//         _attributes: {
//           id: '129170';
//         };
//         _text: 'Boya Liang';
//       };
//     },
//     {
//       _attributes: {
//         gid: '3236172435';
//       };
//       task: {
//         _text: 'Animation Director';
//       };
//       person: {
//         _attributes: {
//           id: '134810';
//         };
//         _text: 'Gi Yeop Kim';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2308397737';
//       };
//       task: {
//         _text: '3D Director';
//       };
//       person: {
//         _attributes: {
//           id: '88857';
//         };
//         _text: 'Shigenori Hirozumi';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1236083941';
//       };
//       task: {
//         _text: 'Sound Director';
//       };
//       person: {
//         _attributes: {
//           id: '8849';
//         };
//         _text: 'Satoshi Motoyama';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2661697744';
//       };
//       task: {
//         _text: 'Cgi Director';
//       };
//       person: {
//         _attributes: {
//           id: '88857';
//         };
//         _text: 'Shigenori Hirozumi';
//       };
//     },
//     {
//       _attributes: {
//         gid: '623703476';
//       };
//       task: {
//         _text: 'Director of Photography';
//       };
//       person: {
//         _attributes: {
//           id: '89162';
//         };
//         _text: 'Yūki Kawashita';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1555509503';
//       };
//       task: {
//         _text: 'Producer';
//       };
//       person: {
//         _attributes: {
//           id: '2091';
//         };
//         _text: 'Toshio Nakatani';
//       };
//     },
//     {
//       _attributes: {
//         gid: '3519127022';
//       };
//       task: {
//         _text: 'Producer';
//       };
//       person: {
//         _attributes: {
//           id: '99171';
//         };
//         _text: 'Ayuri Taguchi';
//       };
//     },
//     {
//       _attributes: {
//         gid: '849236431';
//       };
//       task: {
//         _text: 'Producer';
//       };
//       person: {
//         _attributes: {
//           id: '122061';
//         };
//         _text: 'Shunsuke Nara';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1993587075';
//       };
//       task: {
//         _text: 'Producer';
//       };
//       person: {
//         _attributes: {
//           id: '122517';
//         };
//         _text: 'Kojiro Naotsuka';
//       };
//     },
//     {
//       _attributes: {
//         gid: '860939415';
//       };
//       task: {
//         _text: 'Producer';
//       };
//       person: {
//         _attributes: {
//           id: '125225';
//         };
//         _text: 'Hiroyuki Inage';
//       };
//     },
//   ];
//   cast: [
//     {
//       _attributes: {
//         gid: '3706032028';
//         lang: 'DE';
//       };
//       role: {
//         _text: 'Decim';
//       };
//       person: {
//         _attributes: {
//           id: '30266';
//         };
//         _text: 'Benjamin Völz';
//       };
//     },
//     {
//       _attributes: {
//         gid: '3763510768';
//         lang: 'DE';
//       };
//       role: {
//         _text: 'Clavis';
//       };
//       person: {
//         _attributes: {
//           id: '33226';
//         };
//         _text: 'Benedikt Gutjan';
//       };
//     },
//     {
//       _attributes: {
//         gid: '3083310321';
//         lang: 'DE';
//       };
//       role: {
//         _text: 'Ginti';
//       };
//       person: {
//         _attributes: {
//           id: '47418';
//         };
//         _text: 'Stefan Günther';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1529366753';
//         lang: 'DE';
//       };
//       role: {
//         _text: 'Black-Haired Woman';
//       };
//       person: {
//         _attributes: {
//           id: '47621';
//         };
//         _text: 'Katharina Schwarzmaier';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2577299862';
//         lang: 'DE';
//       };
//       role: {
//         _text: 'Castra';
//       };
//       person: {
//         _attributes: {
//           id: '48252';
//         };
//         _text: 'Jacqueline Belle';
//       };
//     },
//     {
//       _attributes: {
//         gid: '3100517254';
//         lang: 'DE';
//       };
//       role: {
//         _text: 'Oculus';
//       };
//       person: {
//         _attributes: {
//           id: '49824';
//         };
//         _text: 'Erich Ludwig';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2136725738';
//         lang: 'DE';
//       };
//       role: {
//         _text: 'Nona';
//       };
//       person: {
//         _attributes: {
//           id: '70466';
//         };
//         _text: 'Farina Brock';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1459961809';
//         lang: 'DE';
//       };
//       role: {
//         _text: 'Quin';
//       };
//       person: {
//         _attributes: {
//           id: '162469';
//         };
//         _text: 'Friederike Sipp';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2595389746';
//         lang: 'EN';
//       };
//       role: {
//         _text: 'Black-Haired Woman';
//       };
//       person: {
//         _attributes: {
//           id: '13966';
//         };
//         _text: 'Jamie Marchi';
//       };
//     },
//     {
//       _attributes: {
//         gid: '3122963034';
//         lang: 'EN';
//       };
//       role: {
//         _text: 'Genti';
//       };
//       person: {
//         _attributes: {
//           id: '29209';
//         };
//         _text: 'Robert McCollum';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2796940734';
//         lang: 'EN';
//       };
//       role: {
//         _text: 'Mayu';
//       };
//       person: {
//         _attributes: {
//           id: '31217';
//         };
//         _text: 'Leah Clark';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2394700615';
//         lang: 'EN';
//       };
//       role: {
//         _text: 'Clavis';
//       };
//       person: {
//         _attributes: {
//           id: '38497';
//         };
//         _text: 'Z. Charles Bolton';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2832165612';
//         lang: 'EN';
//       };
//       role: {
//         _text: 'Nona';
//       };
//       person: {
//         _attributes: {
//           id: '71281';
//         };
//         _text: 'Jad Saxton';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2577714114';
//         lang: 'EN';
//       };
//       role: {
//         _text: 'Quin';
//       };
//       person: {
//         _attributes: {
//           id: '73145';
//         };
//         _text: 'Anastasia Munoz';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2604354881';
//         lang: 'EN';
//       };
//       role: {
//         _text: 'Decim';
//       };
//       person: {
//         _attributes: {
//           id: '96390';
//         };
//         _text: 'Alex Organ';
//       };
//     },
//     {
//       _attributes: {
//         gid: '4076046056';
//         lang: 'EN';
//       };
//       role: {
//         _text: 'Castra';
//       };
//       person: {
//         _attributes: {
//           id: '107863';
//         };
//         _text: 'Morgan Garrett';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1542670241';
//         lang: 'EN';
//       };
//       role: {
//         _text: 'Oculus';
//       };
//       person: {
//         _attributes: {
//           id: '129435';
//         };
//         _text: 'Jeremy Schwartz';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2298840671';
//         lang: 'ES';
//       };
//       role: {
//         _text: 'Chiyuki';
//       };
//       person: {
//         _attributes: {
//           id: '3757';
//         };
//         _text: 'Sarah Souza';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2065748640';
//         lang: 'ES';
//       };
//       role: {
//         _text: 'Oculus';
//       };
//       person: {
//         _attributes: {
//           id: '23502';
//         };
//         _text: 'Gerardo Reyero';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2025431525';
//         lang: 'ES';
//       };
//       role: {
//         _text: 'Quin';
//       };
//       person: {
//         _attributes: {
//           id: '23804';
//         };
//         _text: 'Mariana Ortiz';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2376377962';
//         lang: 'ES';
//       };
//       role: {
//         _text: 'Ginti';
//       };
//       person: {
//         _attributes: {
//           id: '35536';
//         };
//         _text: 'Manuel Campuzano';
//       };
//     },
//     {
//       _attributes: {
//         gid: '3454220733';
//         lang: 'ES';
//       };
//       role: {
//         _text: 'Clavis';
//       };
//       person: {
//         _attributes: {
//           id: '51495';
//         };
//         _text: 'Sergio Morel';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2215486936';
//         lang: 'ES';
//       };
//       role: {
//         _text: 'Decim';
//       };
//       person: {
//         _attributes: {
//           id: '51514';
//         };
//         _text: 'Ulises Maynardo Zavala';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2670746142';
//         lang: 'ES';
//       };
//       role: {
//         _text: 'Mayu Arita';
//       };
//       person: {
//         _attributes: {
//           id: '57846';
//         };
//         _text: 'Susana Moreno';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2431051207';
//         lang: 'ES';
//       };
//       role: {
//         _text: 'Castra';
//       };
//       person: {
//         _attributes: {
//           id: '76030';
//         };
//         _text: 'Jahel Morga';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1250812991';
//         lang: 'FR';
//       };
//       role: {
//         _text: 'Mayu Arita';
//       };
//       person: {
//         _attributes: {
//           id: '77506';
//         };
//         _text: 'Karl-Line Heller';
//       };
//     },
//     {
//       _attributes: {
//         gid: '942057165';
//         lang: 'FR';
//       };
//       role: {
//         _text: 'Ginti';
//       };
//       person: {
//         _attributes: {
//           id: '89308';
//         };
//         _text: 'Pascal Gimenez';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2352000154';
//         lang: 'FR';
//       };
//       role: {
//         _text: 'Nona';
//       };
//       person: {
//         _attributes: {
//           id: '90176';
//         };
//         _text: 'Sandra Vandroux';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1356251753';
//         lang: 'FR';
//       };
//       role: {
//         _text: 'Decim';
//       };
//       person: {
//         _attributes: {
//           id: '102732';
//         };
//         _text: 'Marc Wihlem';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2238175619';
//         lang: 'FR';
//       };
//       role: {
//         _text: 'Quin';
//       };
//       person: {
//         _attributes: {
//           id: '105886';
//         };
//         _text: 'Justine Hostekint';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2624207870';
//         lang: 'FR';
//       };
//       role: {
//         _text: 'Chiyuki';
//       };
//       person: {
//         _attributes: {
//           id: '130085';
//         };
//         _text: 'Dany Benedito';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1616715099';
//         lang: 'FR';
//       };
//       role: {
//         _text: 'Occulus';
//       };
//       person: {
//         _attributes: {
//           id: '133395';
//         };
//         _text: 'Julien Dutel';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2041489585';
//         lang: 'FR';
//       };
//       role: {
//         _text: 'Clavis';
//       };
//       person: {
//         _attributes: {
//           id: '134741';
//         };
//         _text: 'Michaël Maino';
//       };
//     },
//     {
//       _attributes: {
//         gid: '3483736652';
//         lang: 'FR';
//       };
//       role: {
//         _text: 'Castra';
//       };
//       person: {
//         _attributes: {
//           id: '148856';
//         };
//         _text: 'Emilie Charbonnier';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2136570501';
//         lang: 'IT';
//       };
//       role: {
//         _text: 'Clavis';
//       };
//       person: {
//         _attributes: {
//           id: '29555';
//         };
//         _text: 'Daniele Raffaeli';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2735363197';
//         lang: 'IT';
//       };
//       role: {
//         _text: 'Mayu Arita';
//       };
//       person: {
//         _attributes: {
//           id: '40726';
//         };
//         _text: 'Eleonora Reti';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1078367234';
//         lang: 'IT';
//       };
//       role: {
//         _text: 'Nona';
//       };
//       person: {
//         _attributes: {
//           id: '51274';
//         };
//         _text: 'Barbara Pitotti';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1997768449';
//         lang: 'IT';
//       };
//       role: {
//         _text: 'Decim';
//       };
//       person: {
//         _attributes: {
//           id: '51275';
//         };
//         _text: 'Alberto Bognanni';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1411578925';
//         lang: 'IT';
//       };
//       role: {
//         _text: 'Oculus';
//       };
//       person: {
//         _attributes: {
//           id: '53298';
//         };
//         _text: 'Dario Oppido';
//       };
//     },
//     {
//       _attributes: {
//         gid: '4000953841';
//         lang: 'IT';
//       };
//       role: {
//         _text: 'Chiyuki';
//       };
//       person: {
//         _attributes: {
//           id: '73988';
//         };
//         _text: 'Emanuela Damasio';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1499821286';
//         lang: 'IT';
//       };
//       role: {
//         _text: 'Quin';
//       };
//       person: {
//         _attributes: {
//           id: '73989';
//         };
//         _text: 'Roberta De Roberto';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2398736914';
//         lang: 'IT';
//       };
//       role: {
//         _text: 'Ginti';
//       };
//       person: {
//         _attributes: {
//           id: '74263';
//         };
//         _text: 'Enrico Chirico';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1732461210';
//         lang: 'JA';
//       };
//       role: {
//         _text: 'Castra';
//       };
//       person: {
//         _attributes: {
//           id: '545';
//         };
//         _text: 'Ryoka Yuzuki';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2144813019';
//         lang: 'JA';
//       };
//       role: {
//         _text: 'Oculus';
//       };
//       person: {
//         _attributes: {
//           id: '1250';
//         };
//         _text: 'Tesshō Genda';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1121759089';
//         lang: 'JA';
//       };
//       role: {
//         _text: 'Quin';
//       };
//       person: {
//         _attributes: {
//           id: '16480';
//         };
//         _text: 'Ryoko Shiraishi';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2628541466';
//         lang: 'JA';
//       };
//       role: {
//         _text: 'Decim';
//       };
//       person: {
//         _attributes: {
//           id: '46653';
//         };
//         _text: 'Tomoaki Maeno';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1570297230';
//         lang: 'JA';
//       };
//       role: {
//         _text: 'Ginti';
//       };
//       person: {
//         _attributes: {
//           id: '53773';
//         };
//         _text: 'Yoshimasa Hosoya';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2673060706';
//         lang: 'JA';
//       };
//       role: {
//         _text: 'Clavis';
//       };
//       person: {
//         _attributes: {
//           id: '56091';
//         };
//         _text: 'Kouki Uchiyama';
//       };
//     },
//     {
//       _attributes: {
//         gid: '2305124494';
//         lang: 'JA';
//       };
//       role: {
//         _text: 'Nona';
//       };
//       person: {
//         _attributes: {
//           id: '88587';
//         };
//         _text: 'Rumi Okubo';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1252135946';
//         lang: 'JA';
//       };
//       role: {
//         _text: 'Black-haired Woman';
//       };
//       person: {
//         _attributes: {
//           id: '95225';
//         };
//         _text: 'Asami Seto';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1585774259';
//         lang: 'JA';
//       };
//       role: {
//         _text: 'Mayu Arita';
//       };
//       person: {
//         _attributes: {
//           id: '111376';
//         };
//         _text: 'Atsumi Tanezaki';
//       };
//     },
//   ];
//   credit: [
//     {
//       _attributes: {
//         gid: '1775072738';
//       };
//       task: {
//         _text: 'Animation Production';
//       };
//       company: {
//         _attributes: {
//           id: '48';
//         };
//         _text: 'Madhouse';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1593177078';
//       };
//       task: {
//         _text: 'Production';
//       };
//       company: {
//         _attributes: {
//           id: '48';
//         };
//         _text: 'Madhouse';
//       };
//     },
//     {
//       _attributes: {
//         gid: '3371883060';
//       };
//       task: {
//         _text: 'Production';
//       };
//       company: {
//         _attributes: {
//           id: '589';
//         };
//         _text: 'VAP';
//       };
//     },
//     {
//       _attributes: {
//         gid: '1246901577';
//       };
//       task: {
//         _text: 'Production';
//       };
//       company: {
//         _attributes: {
//           id: '834';
//         };
//         _text: 'NTV';
//       };
//     },
//   ];
// };
