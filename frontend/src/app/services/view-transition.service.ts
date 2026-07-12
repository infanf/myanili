import { Injectable } from '@angular/core';

export interface TransitionPreview {
  poster?: string;
  title?: string;
}

/**
 * Carries the poster/title of a clicked card over to the details page, so it
 * can render the already known image instead of a skeleton while loading.
 */
@Injectable({
  providedIn: 'root',
})
export class ViewTransitionService {
  private preview?: TransitionPreview;

  setPreview(preview: TransitionPreview) {
    this.preview = preview;
  }

  consumePreview(): TransitionPreview | undefined {
    const preview = this.preview;
    this.preview = undefined;
    return preview;
  }
}
