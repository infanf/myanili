import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { ViewTransitionService } from '@services/view-transition.service';

/**
 * Marks the poster ([data-vt-poster]) and title ([data-vt-title]) inside the host
 * element as shared elements for the view transition to the details page.
 * The view-transition-name is only assigned on click, so lists do not pay the
 * snapshot cost for every visible card. The clicked poster/title are handed to
 * the ViewTransitionService so the details page can show them while loading.
 */
@Directive({
  selector: '[myaniliViewTransition]',
  standalone: false,
})
export class ViewTransitionDirective {
  @Input() myaniliViewTransition = '';

  constructor(
    private el: ElementRef<HTMLElement>,
    private viewTransition: ViewTransitionService,
  ) {}

  @HostListener('click')
  markForTransition() {
    if (!this.myaniliViewTransition) return;
    const host = this.el.nativeElement;
    const poster = host.querySelector<HTMLImageElement>('[data-vt-poster]');
    const title = host.querySelector<HTMLElement>('[data-vt-title]');
    poster?.style.setProperty('view-transition-name', `poster-${this.myaniliViewTransition}`);
    title?.style.setProperty('view-transition-name', `title-${this.myaniliViewTransition}`);
    this.viewTransition.setPreview({
      poster: poster?.currentSrc || poster?.src,
      title: title?.textContent?.trim(),
    });
  }
}
