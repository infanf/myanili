import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateAgo',
  pure: true,
})
export class DateAgoPipe implements PipeTransform {
  transform(value: Date | string | number): string {
    if (value) {
      const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);
      const intervals: { [key: string]: number } = {
        y: 31536000,
        mo: 2592000,
        w: 604800,
        d: 86400,
        h: 3600,
        m: 60,
        s: 1,
      };
      let counter;
      for (const i in intervals) {
        if (!intervals[i]) continue;
        counter = Math.floor(seconds / intervals[i]);
        if (counter > 0) {
          return `${counter}${i}`;
        }
      }
    }
    return String(value);
  }
}
