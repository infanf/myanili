import { Pipe, PipeTransform } from '@angular/core';

import {
  SettingsService,
  StreamingCountry,
  StreamingRegion,
  StreamingRegions,
} from '../settings/settings.service';

@Pipe({
  name: 'stream',
})
export class StreamPipe implements PipeTransform {
  country?: StreamingCountry;
  readonly streamingProviders: StreamingProvider[] = [
    {
      id: 'aone',
      name: 'Ani-One Asia',
      urlprefix: 'https://youtube.com/',
      region: StreamingRegions.sea,
    },
    {
      id: 'aod',
      name: 'Anime-on-demand',
      urlprefix: 'https://anime-on-demand.de/anime/',
      deprecated: true,
    },
    {
      id: 'al',
      name: 'animelab',
      urlprefix: 'https://www.animelab.com/shows/',
      deprecated: true,
    },
    {
      id: 'aniverse',
      name: 'aniverse',
      urlprefix: 'https://amazon.de/dp/',
      region: StreamingRegions.de,
    },
    {
      id: 'bili',
      name: 'Bilibili',
      urlprefix: 'https://www.bilibili.tv/play/',
      region: StreamingRegions.sea,
    },
    {
      id: 'cr',
      name: 'Crunchyroll',
      urlprefix: 'https://crunchyroll.com/',
      region: [...StreamingRegions.na, ...StreamingRegions.eu],
    },
    {
      id: 'disney',
      name: 'Disney+',
      urlprefix: 'https://disneyplus.com/',
    },
    {
      id: 'fun',
      name: 'Funimation',
      urlprefix: 'https://www.funimation.com/shows/',
      region: [
        ...StreamingRegions.na,
        ...StreamingRegions.gb,
        ...StreamingRegions.oc,
        ...StreamingRegions.la,
      ],
    },
    {
      id: 'hid',
      name: 'HIDIVE',
      urlprefix: 'https://hidive.com/tv/',
    },
    {
      id: 'hulu',
      name: 'hulu',
      urlprefix: 'https://www.hulu.com/series/',
      region: StreamingRegions.na,
    },
    {
      id: 'muse',
      name: 'Muse Asia',
      urlprefix: 'https://youtube.com/',
      region: StreamingRegions.sea,
    },
    {
      id: 'nf',
      name: 'Netflix',
      urlprefix: 'https://www.netflix.com/title/',
    },
    {
      id: 'nhk',
      name: 'NHK',
      urlprefix: 'https://www3.nhk.or.jp/nhkworld/',
    },
    {
      id: 'azn',
      name: 'Prime Video',
      urlprefix: 'https://primevideo.com/dp/',
    },
    {
      id: 'aznde',
      name: 'Prime Video DE',
      urlprefix: 'https://amazon.de/dp/',
      region: StreamingRegions.de,
    },
    {
      id: 'aznus',
      name: 'Prime Video US',
      urlprefix: 'https://amazon.com/dp/',
      region: StreamingRegions.na,
    },
    {
      id: 'aznuk',
      name: 'Prime Video UK',
      urlprefix: 'https://amazon.co.uk/dp/',
      region: StreamingRegions.gb,
    },
    {
      id: 'tubi',
      name: 'Tubi',
      urlprefix: 'https://tubitv.com/series/',
      region: StreamingRegions.na,
    },
    {
      id: 'wak',
      name: 'Wakanim Nordic',
      urlprefix: 'https://www.wakanim.tv/sc/v2/catalogue/show/',
      region: ['se', 'dk', 'no', 'nl', 'fi', 'is'],
    },
    {
      id: 'wakde',
      name: 'Wakanim DE',
      urlprefix: 'https://www.wakanim.tv/de/v2/catalogue/show/',
      region: StreamingRegions.de,
    },
    {
      id: 'wakfr',
      name: 'Wakanim FR',
      urlprefix: 'https://www.wakanim.tv/fr/v2/catalogue/show/',
      region: ['fr', 'be', 'lu', 'mc', 'ch', 'ag', 'tu', 'ca'],
    },
    {
      id: 'wakru',
      name: 'Wakanim RU',
      urlprefix: 'https://www.wakanim.tv/ru/v2/catalogue/show/',
      region: ['ru', 'ua', 'by', 'kz', 'md', 'tj', 'kg', 'az'],
    },
    {
      id: 'yt',
      name: 'YouTube',
      urlprefix: 'https://youtube.com/',
    },
    {
      id: '',
      name: 'Other',
      urlprefix: 'https://',
    },
  ];

  constructor(settings: SettingsService) {
    settings.streamingCountry.subscribe(country => {
      this.country = country;
    });
  }

  get providers(): StreamingProvider[] {
    return this.streamingProviders
      .filter(prov => {
        if (this.country && prov.region) {
          return prov.region.includes(this.country);
        }
        return true;
      })
      .filter(prov => !prov.deprecated);
  }

  transform(id: string, type: keyof StreamingProvider = 'name'): string {
    const providers = this.streamingProviders.filter(prov => prov.id === id);
    if (providers.length) {
      const provider = providers.shift();
      if (provider && type in provider) {
        return String(provider[type]);
      }
    }
    return id;
  }
}

interface StreamingProvider {
  id: string;
  name: string;
  urlprefix?: string;
  deprecated?: boolean;
  region?: StreamingRegion;
}
