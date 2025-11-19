import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IconModule } from '@icon/icon.module';

import { FeedComponent } from './feed.component';

const routes: Routes = [
  { path: '', component: FeedComponent },
  { path: 'user/:userId', component: FeedComponent },
];

@NgModule({
  declarations: [FeedComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes), IconModule],
})
export class FeedModule {}
