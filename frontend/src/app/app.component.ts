// app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api';
import { HeaderComponent } from './components/header/header';
import { Footer } from "./components/footer/footer";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,
    HeaderComponent, Footer],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  dataFromDjango: any = {};

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getMensaje().subscribe({
      next: (response) => {
        this.dataFromDjango = response;
        console.log('Datos recibidos de Django:', response);
      },
      error: (err) => {
        console.error('Error al conectar con Django:', err);
        this.dataFromDjango = { mensaje: 'Error de conexión', status: 'offline' };
      }
    });
  }
}