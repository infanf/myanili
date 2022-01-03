import { Pipe, PipeTransform } from '@angular/core';
import { WatchStatus } from '@models/anime';
import { ReadStatus } from '@models/manga';

@Pipe({
  name: 'mal',
})
export class MalPipe implements PipeTransform {
  transform(
    value: number | string = '',
    type?: 'mediatype' | 'mystatus' | 'seasonicon' | 'rating' | 'mediaicon',
  ): string {
    if (type === 'mystatus') return this.myStatus(value as WatchStatus | ReadStatus);
    if (type === 'mediatype') return this.mediaType(String(value));
    if (type === 'seasonicon') return this.seasonIcon(value);
    if (type === 'rating') return this.rating(String(value));
    if (type === 'mediaicon') return this.mediaIcon(String(value));
    return String(value);
  }

  myStatus(value: WatchStatus | ReadStatus): string {
    let status = value
      .split('_')
      .map(word => word[0].toUpperCase() + word.slice(1))
      .join(' ');
    if (value === 'plan_to_watch') status = 'Plan to Watch';
    if (value === 'plan_to_read') status = 'Plan to Read';
    return status;
  }

  mediaType(value = ''): string {
    switch (value) {
      case 'ona':
      case 'ova':
      case 'tv':
        return value.toUpperCase();
      default:
        return value
          .split('_')
          .map(word => word[0].toUpperCase() + word.slice(1))
          .join(' ');
    }
  }

  mediaIcon(value = ''): string {
    switch (value) {
      case 'tv':
        return 'tv';
      case 'ova':
        return 'disc';
      case 'ona':
        return 'play-btn';
      case 'special':
        return 'camera-video';
      case 'movie':
        return 'camera-reels';
      case 'music':
        return 'music-note-beamed';
      case 'manga':
        return 'manga';
      case 'manhwa':
        return 'manhwa';
      case 'manhua':
        return 'manhua';
      case 'light_novel':
        return 'file-richtext';
      case 'novel':
        return 'file-text';
      case 'doujinshi':
        return 'brush';
      case 'one_shot':
        return 'bullseye';
      default:
        return 'question';
    }
  }

  seasonIcon(value: number | string): string {
    switch (value) {
      case 'spring':
      case 1:
        return 'flower1';
      case 'summer':
      case 2:
        return 'sun';
      case 'fall':
      case 3:
        return 'clouds';
      case 'winter':
      case 0:
        return 'snow';
      default:
        return 'question';
    }
  }

  rating(value: string): string {
    const ratings = {
      g: 'G - All Ages',
      pg: 'PG - Children',
      pg_13: 'PG 13 - Teens 13 and Older',
      r: 'R - 17+ (violence & profanity)',
      'r+': 'R+ - Profanity & Mild Nudity',
      rx: 'Rx - Hentai',
    } as { [key: string]: string };
    if (value in ratings) {
      return ratings[value];
    }
    return value;
  }
}
