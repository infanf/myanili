import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
  name: 'day',
})
export class DayPipe implements PipeTransform {
  transform(value?: number | number[], format: 'ccc' | 'cccc' | 'ccccc' = 'ccc'): string {
    if (!value && value !== 0) return '';
    if (typeof value === 'object') {
      return value.map(d => DateTime.now().set({ weekday: d }).toFormat(format)).join(', ');
    }
    return DateTime.now().set({ weekday: value }).toFormat(format);
  }
}
