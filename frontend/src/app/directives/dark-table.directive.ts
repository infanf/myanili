import { Directive, ElementRef } from '@angular/core';
import { GlobalService } from '@services/global.service';

@Directive({
  selector: '[darkTable]',
  standalone: false,
})
export class DarkTableDirective {
  constructor(
    private elem: ElementRef,
    private glob: GlobalService,
  ) {
    this.glob.darkMode.subscribe(darkMode => {
      this.elem.nativeElement.classList.toggle('table-dark', darkMode);
    });
  }
}
