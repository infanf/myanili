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
    },
    {
      id: 'aod',
      name: 'Anime-on-demand',
    },
    {
      id: 'fun',
      name: 'Funimation',
    },
    {
      id: 'hulu',
      name: 'hulu',
    },
    {
      id: 'nf',
      name: 'Netflix',
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
