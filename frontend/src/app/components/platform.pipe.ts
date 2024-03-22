import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'platform',
})
export class PlatformPipe implements PipeTransform {
  readonly platforms: PlatformingProvider[] = [
    {
      id: 'book',
      name: 'Print',
    },
    {
      id: 'kin',
      name: 'Kindle',
    },
    {
      id: 'azuki',
      name: 'azuki',
      urlprefix: 'https://azuki.co/series/',
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
      id: 'jnc',
      name: 'J-Novel Club',
      urlprefix: 'https://j-novel.club/series/',
    },
    {
      id: 'mplus',
      name: 'MANGA Plus',
      urlprefix: 'https://mangaplus.shueisha.co.jp/titles/',
    },
    {
      id: 'mup',
      name: 'Manga UP!',
      urlprefix: 'https://global.manga-up.com/manga/',
    },
    {
      id: 'mdex',
      name: 'MangaDex',
      urlprefix: 'https://mangadex.org/title/',
    },
    {
      id: 'mangamo',
      name: 'Mangamo',
      urlprefix: 'https://mangamo.com/',
    },
    {
      id: 'twit',
      name: 'X',
      urlprefix: 'https://x.com/',
    },
    {
      id: 'webtoon',
      name: 'WEBTOON',
      urlprefix: 'https://www.webtoons.com/en/genre/title/list?title_no=',
    },
    {
      id: 'tapas',
      name: 'tapas',
      urlprefix: 'https://tapas.io/series/',
    },
    {
      id: 'lezhin',
      name: 'Lezhin',
      urlprefix: 'https://www.lezhin.com/en/comic/',
    },
    {
      id: 'comico',
      name: 'Pocket Comics',
      urlprefix: 'https://www.pocketcomics.com/comic/',
    },
    {
      id: 'webcomics',
      name: 'WebComics',
      urlprefix: 'https://www.webcomicsapp.com/comic/',
    },
    {
      id: 'kmanga',
      name: 'K MANGA',
      urlprefix: 'https://kmanga.kodansha.com/',
    },
    {
      id: 'renta',
      name: 'Renta!',
      urlprefix: 'https://www.ebookrenta.com/renta/sc/frm/item/',
    },
    {
      id: 'comikey',
      name: 'Comikey',
      urlprefix: 'https://comikey.com/comics/title/',
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
