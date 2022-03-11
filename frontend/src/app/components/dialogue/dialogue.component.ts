import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChildren } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'myanili-dialogue',
  templateUrl: './dialogue.component.html',
})
export class DialogueComponent implements OnInit, AfterViewInit {
  @Input() title?: string;
  @Input() message?: string;
  @Input() prompt?: {
    placeholder?: string;
    type?: InputType;
    value?: string;
  };
  @Input() buttons: Array<Button<unknown>> = [];
  @ViewChildren('value') valueInput?: ElementRef;

  constructor(public modal: NgbActiveModal) {}

  ngOnInit(): void {
    if (this.buttons.length === 0) {
      this.buttons.push({
        label: 'Ok',
        value: true,
      });
    }
  }

  ngAfterViewInit(): void {
    this.valueInput?.nativeElement?.focus();
  }

  submit<T>(value: T) {
    this.modal.close(this.prompt?.value || value);
  }

  dismiss() {
    this.modal.dismiss();
  }
}

export interface Button<T> {
  label: string;
  value: T;
  class?: string;
}

export type InputType =
  | 'text'
  | 'number'
  | 'password'
  | 'email'
  | 'tel'
  | 'url'
  | 'date'
  | 'datetime-local'
  | 'time';
