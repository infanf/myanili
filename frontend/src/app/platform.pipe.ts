import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'platform',
})
export class PlatformPipe implements PipeTransform {
  readonly platforms: PlatformingProvider[] = [
    {
      id: 'kin',
      name: 'Amazon Kindle',
      urlprefix: 'https://amazon.de/dp/',
    },
    {
      id: 'kinun',
      name: 'Kindle Unlimited',
      urlprefix: 'https://amazon.de/dp/',
    },
    {
      id: 'kobo',
      name: 'Rakuten Kobo',
      urlprefix: 'https://www.kobo.com/ebook/',
    },
    {
      id: 'play',
      name: 'Google Play',
      urlprefix: 'https://play.google.com/store/books/details?id=',
    },
    {
      id: 'mplus',
      name: 'MANGA Plus',
      urlprefix: 'https://mangaplus.shueisha.co.jp/titles/',
    },
    {
      id: 'mdex',
      name: 'Mangadex',
      urlprefix: 'https://mangadex.org/title/',
    },
    {
      id: 'twit',
      name: 'Twitter',
      urlprefix: 'https://twitter.com/',
    },
    {
      id: 'cr',
      name: 'Crunchyroll',
      urlprefix: 'https://www.crunchyroll.com/comics/manga/',
      urlpostfix: 'volumes',
    },
    {
      id: 'renta',
      name: 'Renta!',
      urlprefix: 'https://www.ebookrenta.com/renta/sc/frm/item/',
    },
    {
      id: 'book',
      name: 'Print',
      urlprefix: 'https://amazon.de/dp/',
    },
    {
      id: '',
      name: 'Other',
    },
  ];

  transform(id: string, type: keyof PlatformingProvider = 'name'): string {
    const providers = this.platforms.filter(prov => prov.id === id);
    if (providers.length) {
      const provider = providers.shift();
      if (provider && type in provider) {
        return String(provider[type]);
      }
    }
    if (type === 'urlprefix' || type === 'urlpostfix') return '';
    return id;
  }
}

interface PlatformingProvider {
  id: string;
  name: string;
  urlprefix?: string;
  urlpostfix?: string;
}
