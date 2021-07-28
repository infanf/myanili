import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stream',
})
export class StreamPipe implements PipeTransform {
  readonly streamingProviders: StreamingProvider[] = [
    {
      id: 'aod',
      name: 'Anime-on-demand',
      urlprefix: 'https://anime-on-demand.de/anime/',
    },
    {
      id: 'al',
      name: 'animelab',
      urlprefix: 'https://www.animelab.com/shows/',
    },
    {
      id: 'aniverse',
      name: 'aniverse',
      urlprefix: 'https://amazon.de/dp/',
    },
    {
      id: 'cr',
      name: 'Crunchyroll',
      urlprefix: 'https://crunchyroll.com/',
    },
    {
      id: 'fun',
      name: 'Funimation',
      urlprefix: 'https://www.funimation.com/shows/',
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
      urlprefix: 'https://amazon.de/dp/',
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
}
