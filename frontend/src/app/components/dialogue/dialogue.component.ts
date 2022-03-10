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
  @Input() buttons: Button[] = [];
  @ViewChildren('value') valueInput?: ElementRef;

  constructor(private modal: NgbActiveModal) {}

  ngOnInit(): void {
    if (this.buttons.length === 0) {
      this.buttons.push({
        label: 'Ok',
        action: () => this.submit(),
      });
    }
  }

  ngAfterViewInit(): void {
    this.valueInput?.nativeElement?.focus();
  }

  submit() {
    this.modal.close(this.prompt?.value);
  }

  dismiss() {
    this.modal.dismiss();
  }
}

interface Button {
  label: string;
  action: Function;
  // tslint:disable-next-line: no-any
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
