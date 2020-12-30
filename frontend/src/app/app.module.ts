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
import { WatchlistComponent } from './anime/watchlist/watchlist.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FlagPipe } from './flag.pipe';
import { IconComponent } from './icon/icon.component';
import { NavbarComponent } from './navbar/navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ListComponent,
    DetailsComponent,
    IconComponent,
    WatchlistComponent,
    FlagPipe,
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
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
