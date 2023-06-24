import { Component } from '@angular/core';

import { DialogueComponent } from '../dialogue.component';

@Component({
  selector: 'myanili-dialogue-rating',
  templateUrl: './rating.component.html',
})
export class RatingDialogueComponent extends DialogueComponent {
  rating = 0;

  submit() {
    super.submit(this.rating);
  }
}
