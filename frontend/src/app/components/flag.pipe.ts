import { Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import { countryCodeEmoji } from 'country-code-emoji';

@Pipe({
  name: 'flag',
  standalone: false,
})
export class FlagPipe implements PipeTransform {
  transform(value?: string, hideUnknown = false): string {
    if (!value) value = 'xx';
    const emoji = countryCodeEmoji(value);
    return countryCodeEmoji('xx') === emoji && hideUnknown ? '' : emoji;
  }
}
