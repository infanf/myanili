import { Component } from '@angular/core';

import { DialogueComponent } from '../dialogue.component';

@Component({
  selector: 'myanili-rating',
  templateUrl: './rating.component.html',
})
export class RatingComponent extends DialogueComponent {
  rating = 0;

  submit() {
    super.submit(this.rating);
  }
}
