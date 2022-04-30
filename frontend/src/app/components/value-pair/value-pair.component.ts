import { Component, Input } from '@angular/core';

@Component({
  selector: 'myanili-value-pair',
  templateUrl: './value-pair.component.html',
})
export class ValuePairComponent {
  @Input() value?: string;
  @Input() name!: string;
  @Input() rowClass?: string;
}
