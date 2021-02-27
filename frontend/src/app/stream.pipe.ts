import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stream',
})
export class StreamPipe implements PipeTransform {
  readonly streamingProviders: StreamingProvider[] = [
    {
      id: 'cr',
      name: 'Crunchyroll',
      urlprefix: 'https://crunchyroll.com/',
    },
    {
      id: 'hid',
      name: 'HIDIVE',
      urlprefix: 'https://hidive.com/tv/',
    },
    {
      id: 'azn',
      name: 'Prime Video',
      urlprefix: 'https://amazon.de/dp/',
    },
    {
      id: 'wak',
      name: 'Wakanim',
      urlprefix: 'https://www.wakanim.tv/sc/v2/catalogue/show/',
    },
    {
      id: '',
      name: 'Other',
    },
    {
      id: 'al',
      name: 'animelab',
      urlprefix: 'https://www.animelab.com/shows/',
    },
    {
      id: 'aod',
      name: 'Anime-on-demand',
      urlprefix: 'https://anime-on-demand.de/anime/',
    },
    {
      id: 'fun',
      name: 'Funimation',
      urlprefix: 'https://www.funimation.com/shows/',
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
      id: 'yt',
      name: 'YouTube',
    },
    {
      id: 'aniverse',
      name: 'aniverse',
      urlprefix: 'https://amazon.de/dp/',
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
