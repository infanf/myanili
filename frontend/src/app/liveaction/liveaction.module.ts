import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DirectivesModule } from '@app/directives/directives.module';
import { ComponentsModule } from '@components/components.module';
import { IconModule } from '@icon/icon.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InViewportModule } from 'ng-in-viewport';

import { LiveactionDetailsComponent } from './details/details.component';
import { LiveactionEditComponent } from './details/edit/liveaction-edit.component';
import { LiveactionListComponent } from './list/list.component';
import { LiveactionWatchlistComponent } from './watchlist/watchlist.component';

@NgModule({
  declarations: [
    LiveactionDetailsComponent,
    LiveactionEditComponent,
    LiveactionListComponent,
    LiveactionWatchlistComponent,
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    DirectivesModule,
    FormsModule,
    IconModule,
    InViewportModule,
    NgbModule,
    RouterModule.forChild([
      { path: 'list/:status', component: LiveactionListComponent, data: { reuse: 'volatile' } },
      { path: 'details/:id', component: LiveactionDetailsComponent, data: { reuse: 'volatile' } },
      {
        path: 'watchlist',
        component: LiveactionWatchlistComponent,
        data: { reuse: 'volatile' },
      },
      { path: '', redirectTo: 'watchlist', pathMatch: 'full' },
    ]),
  ],
})
export class LiveactionModule {}
