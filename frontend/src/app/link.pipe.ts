import { Pipe, PipeTransform } from '@angular/core';

import { SettingsService } from './settings/settings.service';

@Pipe({
  name: 'link',
})
export class LinkPipe implements PipeTransform {
  private source = 'mal';

  constructor(private settings: SettingsService) {
    this.settings.mainService.subscribe(source => (this.source = source));
  }

  transform(value?: string | number): string {
    if (!value) return '';
    return `${this.source}:${value}`;
  }
}
