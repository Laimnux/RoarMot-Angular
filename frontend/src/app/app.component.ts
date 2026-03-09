import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api';
import { RouterOutlet } from '@angular/router'; // Solo necesitamos RouterOutlet aquí

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet // Eliminamos Header y Footer porque ahora viven en los Layouts
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  dataFromDjango: any = {};

  constructor(
    private apiService: ApiService
    // Eliminamos el Router y la lógica de showNavbar: las rutas ahora manejan esto solas
  ) {}

  ngOnInit() {
    // Mantenemos la conexión con Django para verificar el estado del sistema Roarmot
    this.apiService.getMensaje().subscribe({
      next: (response) => {
        this.dataFromDjango = response;
        console.log('Conexión con Backend Roarmot establecida:', response);
      },
      error: (err) => {
        console.error('Error al conectar con el servidor Django:', err);
        this.dataFromDjango = { mensaje: 'Servidor fuera de línea', status: 'offline' };
      }
    });
  }
}