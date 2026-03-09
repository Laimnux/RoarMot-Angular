import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-header-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-dashboard.html',
  styleUrls: ['./header-dashboard.css']
})
export class HeaderDashboardComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  usuario: any = null;
  isDarkMode: boolean = true;

  ngOnInit() {
    // 1. SUSCRIPCIÓN REACTIVA AL USUARIO
    this.authService.usuarioActual$.subscribe(u => {
      console.log('Usuario en el Header:', u);

      if (u) {
        this.usuario = {
          nombre: u.nombre || 'Usuario RoarMot',
          email: u.email || '', 
          // Usamos rol_id que es lo que envía el serializer de Django
          rol_id: u.rol_id || 2,
          urlImagenPerfil: u.urlImagenPerfil || u.URL_IMAGEN_PERFIL
        };
      } else {
        this.usuario = null;
      }
    });

    // 2. CONTROL DEL MODO OSCURO (Inicialización única)
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