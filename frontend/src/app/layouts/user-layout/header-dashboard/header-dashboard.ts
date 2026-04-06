import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router'; // 1. Importar aquí
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth';
import { Usuario } from '../../../models/usuario.model';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterModule],
  templateUrl: './header-dashboard.html',
  styleUrls: ['./header-dashboard.css']
})
export class HeaderDashboardComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  // Usamos el modelo Usuario para que coincida con el Profile
  usuario: Usuario | null = null;
  isDarkMode: boolean = true;

  // Controlamos la visibilidad del boton
  mostrarBotonStore: boolean = true;

  ngOnInit() {
    // 1. SUSCRIPCIÓN REACTIVA SIMPLIFICADA
    // Gracias al "traductor" del AuthService, 'u' ya tiene el formato correcto
    this.authService.usuarioActual$.subscribe(u => {
      this.usuario = u;
    });

    // 2. LÓGICA DE VISIBILIDAD DEL BOTÓN
    // Escuchamos cada vez que la navegación termina con éxito
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Si la URL incluye 'store', ocultamos el botón
      this.mostrarBotonStore = !event.urlAfterRedirects.includes('/app/store');
    });

    // Verificación inicial por si entramos directo a la URL de store
    this.mostrarBotonStore = !this.router.url.includes('/app/store');

    // 2. CONTROL DEL MODO OSCURO
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme !== 'light';
    this.aplicarTema();
  }

  formatearEmail(email: string): string {
    if (!email) return 'Sin correo';
    const [name, domain] = email.split('@');
    if (name.length <= 3) return `***@${domain}`;
    // Muestra los primeros 4 caracteres y oculta el resto
    return `${name.substring(0, 4)}*****@${domain}`;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.aplicarTema();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private aplicarTema() {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}