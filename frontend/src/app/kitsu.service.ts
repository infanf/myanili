import { Injectable } from '@angular/core';
import { KitsuMappingResponse } from '@models/kitsu';

@Injectable({
  providedIn: 'root',
})
export class KitsuService {
  private baseUrl = 'https://kitsu.io/api/edge/';
  // private clientId = '';
  // private accessToken = '';
  // private refreshToken = '';
  // private userSubject = new BehaviorSubject<string | undefined>(undefined);
  // loggedIn = false;

  constructor() {
    // this.clientId = String(localStorage.getItem('kitsuClientId'));
    // this.accessToken = String(localStorage.getItem('kitsuAccessToken'));
    // this.refreshToken = String(localStorage.getItem('kitsuRefreshToken'));
    // if (this.accessToken) {
    //   this.checkLogin()
    //     .then(user => {
    //       this.userSubject.next(user);
    //     })
    //     .catch(e => {
    //       alert('Could not connect to Kitsu, please check your account settings.');
    //       localStorage.removeItem('kitsuAccessToken');
    //     });
    // }
  }

  async getId(
    externalId: number,
    type: 'anime' | 'manga',
    externalSite = 'myanimelist',
  ): Promise<string | undefined> {
    const result = await fetch(
      `${this.baseUrl}mappings?externalSite=${externalSite}/${type}&filter[externalId]=${externalId}`,
    );
    if (result.ok) {
      const response = ((await result.json()) as unknown) as KitsuMappingResponse;
      if (response.data.length) {
        const mappings = response.data.filter(
          elem => elem.attributes.externalSite === `${externalSite}/${type}`,
        );
        if (!mappings.length) return undefined;
        const newUrl = mappings[0].relationships.item.links.related;
        const newResult = await fetch(newUrl);
        const animeResponse = ((await newResult.json()) as unknown) as {
          data?: { id: string; attributes: { slug: string } };
        };
        if (newResult.ok && animeResponse.data) {
          return animeResponse.data.attributes.slug || animeResponse.data.id;
        }
      }
    }
    return undefined;
  }
}
