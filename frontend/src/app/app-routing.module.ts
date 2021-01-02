import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AnimeDetailsComponent } from './anime/details/details.component';
import { AnimeListComponent } from './anime/list/list.component';
import { ScheduleComponent } from './anime/schedule/schedule.component';
import { SeasonComponent } from './anime/season/season.component';
import { WatchlistComponent } from './anime/watchlist/watchlist.component';
import { MangaDetailsComponent } from './manga/details/details.component';
import { MangaListComponent } from './manga/list/list.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  { path: 'anime/list', component: AnimeListComponent },
  { path: 'anime/list/:status', component: AnimeListComponent },
  { path: 'anime/watchlist', component: WatchlistComponent },
  { path: 'anime/schedule', component: ScheduleComponent },
  { path: 'anime/season', component: SeasonComponent },
  { path: 'anime/details/:id', component: AnimeDetailsComponent },
  { path: 'manga/list', component: MangaListComponent },
  { path: 'manga/list/:status', component: MangaListComponent },
  { path: 'manga/details/:id', component: MangaDetailsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'anime', redirectTo: '/anime/watchlist', pathMatch: 'full' },
  { path: '', redirectTo: '/anime/watchlist', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
