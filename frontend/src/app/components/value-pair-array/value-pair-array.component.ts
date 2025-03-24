import { Component, Input } from '@angular/core';

@Component({
  selector: 'myanili-value-pair-array',
  templateUrl: './value-pair-array.component.html',
  standalone: false,
})
export class ValuePairArrayComponent {
  @Input() value?: string[];
  @Input() name!: string;
  @Input() cols = 4;
}
