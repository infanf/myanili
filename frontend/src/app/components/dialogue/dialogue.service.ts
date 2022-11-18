import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Button, DialogueComponent, InputType } from './dialogue.component';
import { RatingComponent } from './rating/rating.component';

@Injectable({
  providedIn: 'root',
})
export class DialogueService {
  constructor(private modalService: NgbModal) {}

  async alert(message: string, title?: string) {
    await this.confirm(message, title);
  }

  async confirm(message: string, title?: string): Promise<boolean> {
    const modal = this.modalService.open(DialogueComponent);
    modal.componentInstance.title = title;
    modal.componentInstance.message = message;
    return modal.result.then(() => true).catch(() => false);
  }

  async prompt(
    message: string,
    title?: string,
    value?: string,
    type: InputType = 'text',
    placeholder?: string,
  ): Promise<string> {
    const modal = this.modalService.open(DialogueComponent);
    modal.componentInstance.title = title;
    modal.componentInstance.message = message;
    modal.componentInstance.prompt = {
      placeholder,
      type,
      value,
    };
    return modal.result.catch(() => value);
  }

  async open<T>(
    message: string,
    title?: string,
    buttons?: Array<Button<T>>,
    fallback?: T,
  ): Promise<T> {
    const modal = this.modalService.open(DialogueComponent);
    modal.componentInstance.title = title;
    modal.componentInstance.message = message;
    modal.componentInstance.buttons = buttons;
    return modal.result.catch(() => fallback);
  }

  async rating(title: string): Promise<number> {
    const modal = this.modalService.open(RatingComponent);
    modal.componentInstance.title = title;
    return modal.result.catch(() => 0);
  }
}
