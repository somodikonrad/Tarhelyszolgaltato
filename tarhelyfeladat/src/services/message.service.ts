import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../interfaces/message';  // A saját Message interfészed

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  // BehaviorSubject, amely tárolja az üzenetet
  private messageSubject = new BehaviorSubject<Message | null>(null);
  public messageSubject$ = this.messageSubject.asObservable();

  // Show üzenet metódus
  showMessage(title: string, message: string, severity: string) {
    this.messageSubject.next({ title, message, severity });
  }

  // Clear üzenet metódus
  clearMessage() {
    this.messageSubject.next(null);
  }
}
