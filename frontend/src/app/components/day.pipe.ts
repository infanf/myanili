import { Pipe, PipeTransform } from '@angular/core';
import { GlobalService } from '@services/global.service';

@Pipe({
  name: 'day',
})
export class DayPipe implements PipeTransform {
  constructor(private glob: GlobalService) {}
  transform(value?: number | number[], format: 'ccc' | 'cccc' | 'ccccc' = 'ccc'): string {
    if (!value && value !== 0) return '';
    const { DateTime } = require('luxon') as typeof import('luxon');
    if (typeof value === 'object') {
      return value
        .map(d =>
          DateTime.now()
            .set({ weekday: this.glob.toWeekday(d) })
            .toFormat(format),
        )
        .join(', ');
    }
    return DateTime.now()
      .set({ weekday: this.glob.toWeekday(value) })
      .toFormat(format);
  }
}
