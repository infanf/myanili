import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DialogueComponent, InputType } from './dialogue.component';

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
}
