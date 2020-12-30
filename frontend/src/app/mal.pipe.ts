import { Pipe, PipeTransform } from '@angular/core';
import { WatchStatus } from '@models/anime';

@Pipe({
  name: 'mal',
})
export class MalPipe implements PipeTransform {
  transform(value = '', type?: string): string {
    if (type === 'mystatus') return this.myStatus(value as WatchStatus);
    if (type === 'mediatype') return this.mediaType(value);
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
}
