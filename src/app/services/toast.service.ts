import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'danger' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  public toasts = signal<ToastMessage[]>([]);
  private counter = 0;

  public show(title: string, message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'info', duration = 4000): void {
    const id = ++this.counter;
    const toast: ToastMessage = { id, title, message, type, duration };
    this.toasts.update(list => [...list, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  public success(title: string, message: string): void {
    this.show(title, message, 'success');
  }

  public error(title: string, message: string): void {
    this.show(title, message, 'danger', 5000);
  }

  public info(title: string, message: string): void {
    this.show(title, message, 'info');
  }

  public warning(title: string, message: string): void {
    this.show(title, message, 'warning');
  }

  public remove(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
