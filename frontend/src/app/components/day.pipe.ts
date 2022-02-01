import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'day',
})
export class DayPipe implements PipeTransform {
  transform(value?: number | number[], format: 'dd' | 'ddd' | 'dddd' = 'ddd'): string {
    if (!value && value !== 0) return '';
    if (typeof value === 'object') {
      return value.map(d => moment().day(d).format(format)).join(', ');
    }
    return moment().weekday(value).format(format);
  }
}
