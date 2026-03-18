import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth'; // <--- Verifica que esta ruta sea exacta según tu captura

@Component({
  selector: 'app-provider-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './provider-panel.html',
  styleUrl: './provider-panel.css'
})
export class ProviderPanelComponent implements OnInit {
  isDarkMode: boolean = true;
  usuario: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarUsuario();
    
    // Sincronizar tema (usando sessionStorage para ser fiel a tu lógica)
    const theme = sessionStorage.getItem('theme');
    this.isDarkMode = theme === 'dark' || !theme;
    this.applyTheme();
  }

  cargarUsuario(): void {
    // Usamos el nuevo getter que añadimos al servicio
    this.usuario = this.authService.usuarioActualValue;
    
    // Si por alguna razón el servicio devuelve null (ej. F5), 
    // lo intentamos recuperar directamente del storage
    if (!this.usuario) {
      this.usuario = JSON.parse(sessionStorage.getItem('user_session') || 'null');
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
  }

  private applyTheme(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      sessionStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      sessionStorage.setItem('theme', 'light');
    }
  }

  logout(): void {
    this.authService.logout();
  }
}