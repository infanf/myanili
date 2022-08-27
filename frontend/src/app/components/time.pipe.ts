import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
  name: 'time',
})
export class TimePipe implements PipeTransform {
  transform(value?: string, target: 'local' | 'utc' = 'local'): string {
    if (!value) return '';
    if (!/^\d\d:\d\d$/.test(value)) return value;
    const { hour, minute } = {
      hour: Number(value.replace(/:.+/, '')),
      minute: Number(value.replace(/.+:/, '')),
    };
    if (target === 'local') {
      return DateTime.utc().set({ hour, minute }).toLocal().toFormat('HH:mm');
    } else {
      return DateTime.local().set({ hour, minute }).toUTC().toFormat('HH:mm');
    }
  }
}
