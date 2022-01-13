import { Pipe, PipeTransform } from '@angular/core';
import flag from 'country-code-emoji';

@Pipe({
  name: 'flag',
})
export class FlagPipe implements PipeTransform {
  transform(value?: string, hideUnknown = false): string {
    if (!value) value = 'xx';
    const emoji = flag(value);
    return flag('xx') === emoji && hideUnknown ? '' : emoji;
  }
}
