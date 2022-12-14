import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  private messages: Toast[] = [];

  addMessage(message: string, type: ToasterType = 'info', timeout = 5000) {
    const id = (Math.random() * 1000).toString(16).replace('.', '').padEnd(14, '0');
    this.messages.push({ message, type, id });
    if (timeout) {
      setTimeout(() => {
        this.messages = this.messages.filter(m => m.id !== id);
      }, timeout);
    }
    return id;
  }

  removeMessage(id: string) {
    this.messages = this.messages.filter(m => m.id !== id);
  }

  addSuccess(message: string, timeout = 5000) {
    return this.addMessage(message, 'success', timeout);
  }

  addError(message: string, timeout = 5000) {
    return this.addMessage(message, 'error', timeout);
  }

  addInfo(message: string, timeout = 5000) {
    return this.addMessage(message, 'info', timeout);
  }

  get messages$() {
    return this.messages;
  }
}

interface Toast {
  id: string;
  type: ToasterType;
  message: string;
}

type ToasterType = 'success' | 'error' | 'info';
