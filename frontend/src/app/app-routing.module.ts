import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DetailsComponent } from './details/details.component';
import { ListComponent } from './list/list.component';
import { WatchlistComponent } from './watchlist/watchlist.component';

const routes: Routes = [
  { path: 'anime/list', component: ListComponent, data: { type: 'anime' } },
  { path: 'anime/list/:status', component: ListComponent },
  { path: 'anime/watchlist', component: WatchlistComponent },
  { path: 'anime/details/:id', component: DetailsComponent },
  { path: '', redirectTo: '/anime/list', pathMatch: 'full' },
  { path: 'anime', redirectTo: '/anime/list', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
