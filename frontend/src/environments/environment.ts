// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

declare const PLATFORM_ENV: string | undefined;

export const environment = {
  production: false,
  platform: (typeof PLATFORM_ENV !== 'undefined' ? PLATFORM_ENV : 'web') as 'web' | 'mobile',
  backend: 'http://localhost:4280/',
  jikanUrl: 'https://api.jikan.moe/v4/',
  jikanFallbackUrl: 'http://localhost:9001/v4/',
  anisearchUrl: 'https://anisearch.myani.li/',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
