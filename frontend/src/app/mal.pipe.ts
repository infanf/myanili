import { Pipe, PipeTransform } from '@angular/core';
import { WatchStatus } from '@models/anime';

@Pipe({
  name: 'mal',
})
export class MalPipe implements PipeTransform {
  transform(value: number | string = '', type?: 'mediatype' | 'mystatus' | 'seasonicon'): string {
    if (type === 'mystatus') return this.myStatus(value as WatchStatus);
    if (type === 'mediatype') return this.mediaType(String(value));
    if (type === 'seasonicon') return this.seasonIcon(value);
    return String(value);
  }

  myStatus(value: WatchStatus): string {
    let status = value
      .split('_')
      .map(word => word[0].toUpperCase() + word.slice(1))
      .join(' ');
    if (value === 'plan_to_watch') status = 'Plan to Watch';
    return status;
  }

  mediaType(value = ''): string {
    const status = value
      .split('_')
      .map(word => word[0].toUpperCase() + word.slice(1))
      .join(' ');
    return status;
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
        return 'cloud';
      default:
        return 'tree';
    }
  }
}
