import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ViewSettingKey, ViewSettingsComponent } from '../view-settings/view-settings.component';

@Component({
  selector: 'myanili-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class HeaderComponent {
  @Input() header!: string;
  @Input() settings?: ViewSettingKey[];

  constructor(private modal: NgbModal) {}

  openSettings(event: Event) {
    event.stopPropagation();
    if (!this.settings?.length) return;
    const modalRef = this.modal.open(ViewSettingsComponent);
    modalRef.componentInstance.keys = this.settings;
    modalRef.componentInstance.title = this.header ? `${this.header} Settings` : 'Settings';
  }
}
