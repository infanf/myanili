import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'time',
})
export class TimePipe implements PipeTransform {
  transform(value?: string, target: 'local' | 'utc' = 'local'): string {
    if (!value) return '';
    if (!/^\d\d:\d\d$/.test(value)) return value;
    const inMoment = moment();
    const { h, m } = {
      h: value.replace(/:.+/, ''),
      m: value.replace(/.+:/, ''),
    };
    if (target === 'local') {
      inMoment.utc().set('hour', Number(h)).set('minute', Number(m));
      return inMoment.local().format('HH:mm');
    } else {
      inMoment.local().set('hour', Number(h)).set('minute', Number(m));
      return inMoment.utc().format('HH:mm');
    }
  }
}
