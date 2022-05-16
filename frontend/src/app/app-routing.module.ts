import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AnimeDetailsComponent } from './anime/details/details.component';
import { AnimeListComponent } from './anime/list/list.component';
import { ProducerComponent } from './anime/producer/producer.component';
import { ScheduleComponent } from './anime/schedule/schedule.component';
import { SeasonComponent } from './anime/season/season.component';
import { WatchlistComponent } from './anime/watchlist/watchlist.component';
import { CharacterComponent } from './character/character.component';
import { BookshelfWrapperComponent } from './manga/bookshelf/bookshelf.component';
import { MangaDetailsComponent } from './manga/details/details.component';
import { MangaListComponent } from './manga/list/list.component';
import { MagazineComponent } from './manga/magazine/magazine.component';
import { PersonComponent } from './person/person.component';
import { SearchComponent } from './search/search.component';

const routes: Routes = [
  { path: 'anime/list', component: AnimeListComponent },
  { path: 'anime/list/:status', component: AnimeListComponent },
  { path: 'anime/watchlist', component: WatchlistComponent },
  { path: 'anime/schedule', component: ScheduleComponent },
  { path: 'anime/season', component: SeasonComponent },
  { path: 'anime/details/:id', component: AnimeDetailsComponent },
  { path: 'anime/producer/:id', component: ProducerComponent },
  { path: 'manga/list', component: MangaListComponent },
  { path: 'manga/list/:status', component: MangaListComponent },
  { path: 'manga/bookshelf', component: BookshelfWrapperComponent },
  { path: 'manga/details/:id', component: MangaDetailsComponent },
  { path: 'manga/magazine/:id', component: MagazineComponent },
  { path: 'mal/:type', component: SearchComponent },
  { path: 'character/:id', component: CharacterComponent },
  { path: 'person/:id', component: PersonComponent },
  { path: 'manga', redirectTo: '/manga/bookshelf', pathMatch: 'full' },
  { path: 'anime', redirectTo: '/anime/watchlist', pathMatch: 'full' },
  { path: '', redirectTo: '/anime/watchlist', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
