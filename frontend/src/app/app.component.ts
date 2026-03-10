import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api';
import { RouterOutlet } from '@angular/router'; 
// 1. Importamos el COMPONENTE visual para la lista de 'imports'
import { NotificationComponent } from './components/shared/notification/notification';
// 2. Importamos el SERVICIO para la lógica
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet,
    NotificationComponent // <-- 3. AGREGAMOS EL COMPONENTE AQUÍ
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  dataFromDjango: any = {};
  
  // Usamos inject para un código más limpio y moderno
  private apiService = inject(ApiService);
  private notify = inject(NotificationService);

  ngOnInit() {
    // Verificamos conexión con el Backend
    this.apiService.getMensaje().subscribe({
      next: (response) => {
        this.dataFromDjango = response;
        console.log('Conexión con Backend Roarmot establecida:', response);
        
        // OPCIONAL: Podrías lanzar una notificación de éxito al conectar
        // this.notify.show('Conectado al servidor de Roarmot', 'success');
      },
      error: (err) => {
        console.error('Error al conectar con el servidor Django:', err);
        this.dataFromDjango = { mensaje: 'Servidor fuera de línea', status: 'offline' };
        
        // 4. USAMOS LA NOTIFICACIÓN en caso de error de servidor
        this.notify.show('El servidor de Roarmot no responde', 'error');
      }
    });
  }
}