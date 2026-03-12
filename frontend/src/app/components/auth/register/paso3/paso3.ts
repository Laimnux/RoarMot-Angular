import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../services/notification.service';


@Component({
  selector: 'app-paso3',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paso3.html'
})
export class Paso3Component implements OnInit {
  @Input() rol: string = 'comprador'; 
  @Output() registroFinalizado = new EventEmitter<any>();

  showPassword: boolean = false;
  fortaleza: number = 0;
  colorFortaleza: string = 'bg-gray-800';

  perfil = {
    nombre: '',
    apellido: '',
    telefono: '',
    nombreEmpresa: '',
    password: '',
    terminos: false
  };

  // Usamos inject para mantener el estilo moderno que traes en los otros componentes
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  constructor() {}

  ngOnInit() {}

  // --- VALIDACIÓN DE TELÉFONO ---
  validarTelefono(event: any) {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, ''); 
    
    if (valor.length > 10) {
      valor = valor.substring(0, 10);
    }
    
    this.perfil.telefono = valor;
    input.value = valor; 
  }

  // --- EVALUACIÓN DE CONTRASEÑA ---
  evaluarPassword() {
    let p = this.perfil.password;
    this.fortaleza = 0;
    
    if (p.length >= 8) this.fortaleza++;
    if (/[A-Z]/.test(p)) this.fortaleza++;
    if (/[0-9]/.test(p)) this.fortaleza++;
    if (/[!@#$%^&*]/.test(p)) this.fortaleza++;

    if (this.fortaleza <= 2) {
      this.colorFortaleza = 'bg-red-500'; 
    } else if (this.fortaleza === 3) {
      this.colorFortaleza = 'bg-orange-500'; 
    } else if (this.fortaleza === 4) {
      this.colorFortaleza = 'bg-green-500'; 
    }
  }

  // --- VALIDADOR DE FORMULARIO ---
  esFormularioValido() {
    const telefonoValido = this.perfil.telefono && this.perfil.telefono.length === 10;

    return this.perfil.nombre.trim().length > 0 && 
           this.perfil.apellido.trim().length > 0 && 
           telefonoValido && 
           this.fortaleza >= 3 && 
           this.perfil.terminos;
  }

  // --- FINALIZAR REGISTRO CON NOTIFICACIONES ---
  finalizarRegistro() {
    if (this.esFormularioValido()) {
      console.log("Datos validados correctamente. Enviando al padre...");
      
      // Notificación de éxito
      this.notificationService.show(`¡Bienvenido ${this.perfil.nombre}! Registro finalizado con éxito.`, 'success');
      
      this.registroFinalizado.emit(this.perfil);
    } else {
      console.error("Validación fallida: Datos inconsistentes.");
      
      // Notificación de error detallada
      if (!this.perfil.terminos) {
        this.notificationService.show('Debes aceptar los términos y condiciones.', 'error');
      } else if (this.fortaleza < 3) {
        this.notificationService.show('La contraseña es muy débil.', 'error');
      } else {
        this.notificationService.show('Por favor revisa que todos los campos estén completos.', 'error');
      }
    }
  }
}