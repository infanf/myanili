import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ValuePairArrayComponent } from './value-pair-array/value-pair-array.component';
import { ValuePairComponent } from './value-pair/value-pair.component';

@NgModule({
  declarations: [ValuePairComponent, ValuePairArrayComponent],
  imports: [CommonModule],
  exports: [ValuePairComponent, ValuePairArrayComponent],
})
export class ComponentsModule {}
