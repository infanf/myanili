import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DarkTableDirective } from './dark-table.directive';
import { ExternalIdInputDirective } from './external-id-input.directive';

@NgModule({
  declarations: [DarkTableDirective, ExternalIdInputDirective],
  imports: [CommonModule],
  exports: [DarkTableDirective, ExternalIdInputDirective],
})
export class DirectivesModule {}
