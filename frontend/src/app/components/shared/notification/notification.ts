import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from '../../../services/notification.service'; // Ajusta la ruta si es necesario
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css'
})
export class NotificationComponent {
  // Usamos inject para seguir tu estilo actual
  private notifyService = inject(NotificationService);
  
  // Definimos el observable que usaremos con el pipe async en el HTML
  toasts$: Observable<Toast[]> = this.notifyService.toasts$;
}