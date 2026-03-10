import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importante para usar [(ngModel)]
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth'; // Asegúrate de importar tu servicio
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-paso1',
  standalone: true,
  imports: [CommonModule, FormsModule], // Agregamos FormsModule
  templateUrl: './paso1.html',
  styleUrl: './paso1.css'
})
export class Paso1Component implements OnInit{
  rol: string = 'comprador'; // Por defecto ya tiene uno
  email: string = '';
  
  @Output() rolSeleccionado = new EventEmitter<string>();
  @Output() emailEnviado = new EventEmitter<string>(); // Nuevo emisor

  constructor(private router: Router, 
    private authService: AuthService,
    private notify: NotificationService 
  ) {} // Inyecta el servicio

  // 2. Ahora sí, el método está respaldado por la interfaz
  ngOnInit() {
    this.rolSeleccionado.emit(this.rol);
  }

  cambiarRol(nuevoRol: string) {
    this.rol = nuevoRol;
    this.rolSeleccionado.emit(nuevoRol);
  }

  // Función para saber si el email tiene algo escrito pero está mal
  emailInvalido(): boolean {
    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return this.email.length > 0 && !gmailPattern.test(this.email);
  }
  // Validación estricta desde el Script
  esFormularioValido(): boolean {
    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailPattern.test(this.email) && this.rol !== '';
  }

  continuar() {
  if (this.esFormularioValido()) {
    // Verificamos en el backend antes de navegar
    this.authService.verificarEmail(this.email).subscribe({
      next: (res) => {
        if (res.disponible) {
          this.emailEnviado.emit(this.email);
          this.router.navigate(['/registro/paso2']);
        } else {
          // Cambiado de alert a notify
          this.notify.show('Este correo ya está registrado en Roarmot.', 'error');
        }
      },
      error: () => {
        // Cambiado de alert a notify
        this.notify.show('Error de conexión. Inténtalo más tarde.', 'error');
      }
    });
  } else {
    // Cambiado de alert a notify
    this.notify.show('Por favor, ingresa un correo de Gmail válido.', 'info');
  }
  }
}