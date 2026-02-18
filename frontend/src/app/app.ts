import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true, // Angular 19+ usa standalone por defecto
  imports: [CommonModule,RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  mensaje = 'Cargando conexión con Django...';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Aquí hacemos la llamada a la IP de tu servidor Django
    this.http.get<any>('http://127.0.0.1:8000/api/saludo/')
      .subscribe({
        next: (data) => this.mensaje = data.mensaje,
        error: (e) => this.mensaje = 'Error: ¿Encendiste el servidor de Django?'
      });
  }
}
