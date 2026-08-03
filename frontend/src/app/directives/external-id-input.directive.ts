import { Directive, ElementRef, HostListener, Input, Optional, Self } from '@angular/core';
import { NgModel } from '@angular/forms';
import { ExternalIdProvider, normalizeExternalId } from '@models/external-id';

/**
 * Convenience for manually maintained external ID inputs:
 * - selects the whole content on focus, so it can be copied or overwritten
 * - extracts the ID from a pasted link on blur (when a provider is given)
 */
@Directive({
  selector: 'input[externalId]',
  standalone: false,
})
export class ExternalIdInputDirective {
  /** Provider to extract IDs for; omit for select-on-focus only. */
  @Input() externalId?: ExternalIdProvider | '';

  private selectOnMouseUp = false;

  constructor(
    private elem: ElementRef<HTMLInputElement>,
    @Optional() @Self() private model?: NgModel,
  ) {}

  @HostListener('focus')
  onFocus() {
    this.elem.nativeElement.select();
    // A click focuses first and would collapse the selection on mouseup again
    this.selectOnMouseUp = true;
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (!this.selectOnMouseUp) return;
    this.selectOnMouseUp = false;
    event.preventDefault();
  }

  @HostListener('blur')
  onBlur() {
    this.selectOnMouseUp = false;
    if (!this.externalId || !this.model) return;

    const value = this.model.value as string | number | null | undefined;
    const normalized = normalizeExternalId(this.externalId, value);
    if (normalized === value) return;
    this.model.control.setValue(normalized);
  }
}
