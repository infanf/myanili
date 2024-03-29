import { Pipe, PipeTransform } from '@angular/core';
import Timezone from 'timezone-enum';

@Pipe({
  name: 'time',
})
export class TimePipe implements PipeTransform {
  transform(value?: string, tz: Timezone = Timezone.UTC): string {
    if (!value) return '';
    if (!/^\d\d:\d\d$/.test(value)) return value;
    const { hour, minute } = {
      hour: Number(value.replace(/:.+/, '')),
      minute: Number(value.replace(/.+:/, '')),
    };
    const { DateTime } = require('luxon') as typeof import('luxon');
    return DateTime.local().setZone(tz).set({ hour, minute }).toLocal().toFormat('HH:mm');
  }
}
