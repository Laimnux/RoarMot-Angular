import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit() {}

  // --- VALIDACIÓN DE TELÉFONO (VERSIÓN BLINDADA) ---
  validarTelefono(event: any) {
    // 1. Capturamos el valor y removemos TODO lo que no sea número
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, ''); 
    
    // 2. Cortamos a 10 dígitos máximo
    if (valor.length > 10) {
      valor = valor.substring(0, 10);
    }
    
    // 3. Sincronizamos el modelo y el valor del input físico
    this.perfil.telefono = valor;
    input.value = valor; 
  }

  // --- EVALUACIÓN DE CONTRASEÑA (VERSIÓN ACTUALIZADA) ---
  evaluarPassword() {
    let p = this.perfil.password;
    this.fortaleza = 0;
    
    // Sumamos puntos por cada requisito cumplido
    if (p.length >= 8) this.fortaleza++;
    if (/[A-Z]/.test(p)) this.fortaleza++;
    if (/[0-9]/.test(p)) this.fortaleza++;
    if (/[!@#$%^&*]/.test(p)) this.fortaleza++;

    // Ajuste de colores según la fortaleza
    if (this.fortaleza <= 2) {
      this.colorFortaleza = 'bg-red-500'; // Débil
    } else if (this.fortaleza === 3) {
      this.colorFortaleza = 'bg-orange-500'; // Media
    } else if (this.fortaleza === 4) {
      this.colorFortaleza = 'bg-green-500'; // ¡ROBUSTA!
    }
  }

  // --- VALIDADOR DE FORMULARIO (VERSIÓN ESTRICTA) ---
  esFormularioValido() {
    // Validación estricta: debe tener exactamente 10 números
    const telefonoValido = this.perfil.telefono && this.perfil.telefono.length === 10;

    return this.perfil.nombre.trim().length > 0 && 
           this.perfil.apellido.trim().length > 0 && 
           telefonoValido && 
           this.fortaleza >= 3 && 
           this.perfil.terminos;
  }

  finalizarRegistro() {
    if (this.esFormularioValido()) {
      console.log("Datos validados correctamente. Enviando al padre...");
      this.registroFinalizado.emit(this.perfil);
    } else {
      console.error("Validación fallida: Datos inconsistentes.");
    }
  }
}