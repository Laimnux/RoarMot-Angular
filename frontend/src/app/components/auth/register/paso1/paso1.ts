import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importante para usar [(ngModel)]
import { Router } from '@angular/router';

@Component({
  selector: 'app-paso1',
  standalone: true,
  imports: [CommonModule, FormsModule], // Agregamos FormsModule
  templateUrl: './paso1.html',
  styleUrl: './paso1.css'
})
export class Paso1Component {
  rol: string = 'comprador'; // Por defecto ya tiene uno
  email: string = '';
  
  @Output() rolSeleccionado = new EventEmitter<string>();
  @Output() emailEnviado = new EventEmitter<string>(); // Nuevo emisor

  constructor(private router: Router) {}

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
      // 1. Enviamos el email al Padre antes de irnos 
      this.emailEnviado.emit(this.email);
      console.log('Datos válidos, navegando al paso 2...');
      // 2. Navegamos al paso 2
      this.router.navigate(['/registro/paso2']);
    } else {
      alert('Por favor, ingresa un correo de Gmail válido.');
    }
  }
}