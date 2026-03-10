import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toasts: Toast[] = [];
  private toastSubject = new Subject<Toast[]>();
  toasts$ = this.toastSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = Date.now();
    this.toasts.push({ id, message, type });
    this.toastSubject.next([...this.toasts]);

    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
      this.toastSubject.next([...this.toasts]);
    }, 4000); // 4 segundos de visibilidad
  }
}