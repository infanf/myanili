import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DarkTableDirective } from './dark-table.directive';
import { ViewTransitionDirective } from './view-transition.directive';

@NgModule({
  declarations: [DarkTableDirective, ViewTransitionDirective],
  imports: [CommonModule],
  exports: [DarkTableDirective, ViewTransitionDirective],
})
export class DirectivesModule {}
