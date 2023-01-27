import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DirectivesModule } from '@app/directives/directives.module';
import { ComponentsModule } from '@components/components.module';
import { IconModule } from '@icon/icon.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { NavbarBottomComponent } from './bottom/bottom.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { NavbarTopComponent } from './top/top.component';

@NgModule({
  declarations: [NavbarBottomComponent, NavbarTopComponent, NotificationsComponent],
  imports: [
    CommonModule,
    NgbDropdownModule,
    IconModule,
    ComponentsModule,
    DirectivesModule,
    RouterModule,
  ],
  exports: [NavbarBottomComponent, NavbarTopComponent, NotificationsComponent],
})
export class NavbarModule {}
