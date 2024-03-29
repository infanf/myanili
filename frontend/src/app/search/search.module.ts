import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DirectivesModule } from '@app/directives/directives.module';
import { ComponentsModule } from '@components/components.module';
import { IconModule } from '@icon/icon.module';
import { InViewportModule } from 'ng-in-viewport';

import { SearchComponent } from './search.component';

@NgModule({
  declarations: [SearchComponent],
  imports: [
    CommonModule,
    FormsModule,
    IconModule,
    InViewportModule,
    ComponentsModule,
    DirectivesModule,
    RouterModule.forChild([
      {
        path: '',
        redirectTo: 'anime',
        pathMatch: 'full',
      },
      {
        path: ':type',
        component: SearchComponent,
      },
      {
        path: ':type/:query',
        component: SearchComponent,
      },
    ]),
  ],
  exports: [SearchComponent],
})
export class SearchModule {}
