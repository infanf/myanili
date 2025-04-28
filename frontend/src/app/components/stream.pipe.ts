import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stream',
})
export class StreamPipe implements PipeTransform {
  readonly streamingProviders: StreamingProvider[] = [
    {
      id: 'abema',
      name: 'ABEMA',
      urlprefix: 'https://abema.tv/video/title/',
    },
    {
      id: 'akibapass',
      name: 'AKIBA PASS TV',
      urlprefix: 'https://akibapass.tv/products/',
    },
    {
      id: 'adn',
      name: 'Animation Digital Network',
      urlprefix: 'https://animationdigitalnetwork.fr/video/',
    },
    {
      id: 'aone',
      name: 'Ani-One Asia',
      urlprefix: 'https://youtube.com/',
      deprecated: true,
    },
    {
      id: 'aod',
      name: 'Anime-on-demand',
      urlprefix: 'https://anime-on-demand.de/anime/',
      deprecated: true,
    },
    {
      id: 'animeonegai',
      name: 'Anime Onegai',
      urlprefix: 'https://animeonegai.com/es/details/',
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
      deprecated: true,
    },
    {
      id: 'bili',
      name: 'Bilibili',
      urlprefix: 'https://www.bilibili.tv/play/',
    },
    {
      id: 'cr',
      name: 'Crunchyroll',
      urlprefix: 'https://crunchyroll.com/',
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
      deprecated: true,
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
    },
    {
      id: 'iqiyi',
      name: 'iQIYI',
      urlprefix: 'https://www.iq.com/series/',
    },
    {
      id: 'laftel',
      name: 'Laftel',
      urlprefix: 'https://laftel.tv/series/',
    },
    {
      id: 'muse',
      name: 'Muse Asia',
      urlprefix: 'https://youtube.com/',
      deprecated: true,
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
      id: 'plex',
      name: 'Plex',
      urlprefix: 'https://watch.plex.tv/de/show/',
    },
    {
      id: 'azn',
      name: 'Prime Video',
      urlprefix: 'https://primevideo.com/dp/',
    },
    {
      id: 'shahid',
      name: 'SHAHID',
      urlprefix: 'https://shahid.mbc.net/en/series/',
    },
    {
      id: 'tubi',
      name: 'Tubi',
      urlprefix: 'https://tubitv.com/series/',
    },
    {
      id: 'wak',
      name: 'Wakanim',
      urlprefix: 'https://www.wakanim.tv/sc/v2/catalogue/show/',
      deprecated: true,
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

  get providers(): StreamingProvider[] {
    return this.streamingProviders.filter(prov => !prov.deprecated);
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
}
