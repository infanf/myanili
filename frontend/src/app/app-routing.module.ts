import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DetailsComponent } from './anime/details/details.component';
import { ListComponent } from './anime/list/list.component';
import { ScheduleComponent } from './anime/schedule/schedule.component';
import { SeasonComponent } from './anime/season/season.component';
import { WatchlistComponent } from './anime/watchlist/watchlist.component';

const routes: Routes = [
  { path: 'anime/list', component: ListComponent, data: { type: 'anime' } },
  { path: 'anime/list/:status', component: ListComponent },
  { path: 'anime/watchlist', component: WatchlistComponent },
  { path: 'anime/schedule', component: ScheduleComponent },
  { path: 'anime/season', component: SeasonComponent },
  { path: 'anime/details/:id', component: DetailsComponent },
  { path: '', redirectTo: '/anime/watchlist', pathMatch: 'full' },
  { path: 'anime', redirectTo: '/anime/watchlist', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
