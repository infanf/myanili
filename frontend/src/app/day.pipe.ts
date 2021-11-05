import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'day',
})
export class DayPipe implements PipeTransform {
  transform(value?: number, format: 'dd' | 'ddd' | 'dddd' = 'ddd'): string {
    if (!value && value !== 0) return '';
    return moment().weekday(value).format(format);
  }
}
