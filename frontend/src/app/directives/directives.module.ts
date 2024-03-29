import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DarkTableDirective } from './dark-table.directive';

@NgModule({
  declarations: [DarkTableDirective],
  imports: [CommonModule],
  exports: [DarkTableDirective],
})
export class DirectivesModule {}
