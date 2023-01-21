import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DirectivesModule } from '@app/directives/directives.module';
import { ComponentsModule } from '@components/components.module';
import { IconModule } from '@icon/icon.module';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { AboutComponent } from './about/about.component';
import { ChangelogComponent } from './changelog/changelog.component';
import { MigrateBakaComponent } from './migrate-baka/migrate-baka.component';
import { NewVersionComponent } from './new-version/new-version.component';
import { SettingsComponent } from './settings.component';

@NgModule({
  declarations: [
    AboutComponent,
    ChangelogComponent,
    MigrateBakaComponent,
    NewVersionComponent,
    SettingsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IconModule,
    NgbModalModule,
    DirectivesModule,
    ComponentsModule,
  ],
  exports: [
    AboutComponent,
    ChangelogComponent,
    MigrateBakaComponent,
    NewVersionComponent,
    SettingsComponent,
  ],
})
export class SettingsModule {}
