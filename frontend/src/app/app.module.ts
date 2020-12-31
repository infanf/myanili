import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { environment } from 'src/environments/environment';

import { DetailsComponent } from './anime/details/details.component';
import { ListComponent } from './anime/list/list.component';
import { SeasonComponent } from './anime/season/season.component';
import { WatchlistComponent } from './anime/watchlist/watchlist.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FlagPipe } from './flag.pipe';
import { IconStatusComponent } from './icon-status/icon-status.component';
import { IconComponent } from './icon/icon.component';
import { MalPipe } from './mal.pipe';
import { NavbarComponent } from './navbar/navbar.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { SettingsComponent } from './settings/settings.component';
import { WidgetSeasonComponent } from './settings/widget-season/widget-season.component';
import { StreamPipe } from './stream.pipe';
import { TimePipe } from './time.pipe';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ListComponent,
    DetailsComponent,
    IconComponent,
    WatchlistComponent,
    FlagPipe,
    MalPipe,
    TimePipe,
    StreamPipe,
    ScheduleComponent,
    SeasonComponent,
    SettingsComponent,
    IconStatusComponent,
    WidgetSeasonComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    NgCircleProgressModule.forRoot({
      radius: 5,
      outerStrokeWidth: 2,
      innerStrokeWidth: 2,
      space: -2,
      showBackground: false,
      showTitle: false,
      showUnits: false,
      showSubtitle: false,
      outerStrokeColor: '#2c3e50',
      innerStrokeColor: 'rgba(0,0,0,0.15)',
      animation: false,
      backgroundPadding: 0,
      outerStrokeLinecap: 'butt',
    }),
  ],
  providers: [TimePipe, StreamPipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
