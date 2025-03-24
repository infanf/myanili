import { Component, Input } from '@angular/core';

@Component({
  selector: 'myanili-value-pair',
  templateUrl: './value-pair.component.html',
  standalone: false,
})
export class ValuePairComponent {
  @Input() value?: string;
  @Input() name!: string;
  @Input() cols = 4;
}
