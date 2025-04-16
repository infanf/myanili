import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';
import Timezone from 'timezone-enum';

@Pipe({
  name: 'time',
  standalone: false,
})
export class TimePipe implements PipeTransform {
  transform(value?: string, tz: Timezone = Timezone.UTC): string {
    if (!value) return '';
    if (!/^\d\d:\d\d$/.test(value)) return value;
    const { hour, minute } = {
      hour: Number(value.replace(/:.+/, '')),
      minute: Number(value.replace(/.+:/, '')),
    };
    return DateTime.local().setZone(tz).set({ hour, minute }).toLocal().toFormat('HH:mm');
  }
}
