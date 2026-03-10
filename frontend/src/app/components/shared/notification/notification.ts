import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from '../../../services/notification.service'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css'
})
export class NotificationComponent implements OnInit {
  private notifyService = inject(NotificationService);
  toasts: Toast[] = [];

  ngOnInit() {
    // Escuchamos al servicio para saber cuándo mostrar una alerta
    this.notifyService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }
}