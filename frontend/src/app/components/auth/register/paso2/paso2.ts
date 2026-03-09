import { Component, OnInit, OnDestroy, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-paso2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paso2.html',
  styleUrl: './paso2.css'
})
export class Paso2Component implements OnInit, OnDestroy {
  digitos: string[] = ['', '', '', '', '', ''];
  tiempo: number = 60;
  intervalo: any;
  @Output() codigoEnviado = new EventEmitter<string>();
  
  // Variables para el borrado continuo
  private backspacePresionado: boolean = false;
  private intervaloBackspace: any;
  private indiceActualBackspace: number = -1;
  private timeoutInicialBackspace: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.iniciarContador();
  }

  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
    this.detenerBackspaceContinuo();
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    // Detectar cuando se suelta la tecla Backspace
    if (event.key === 'Backspace') {
      this.detenerBackspaceContinuo();
    }
  }

  iniciarContador() {
    this.tiempo = 60;
    if (this.intervalo) clearInterval(this.intervalo);
    this.intervalo = setInterval(() => {
      if (this.tiempo > 0) this.tiempo--;
      else clearInterval(this.intervalo);
    }, 1000);
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    // Manejo especial para Backspace (borrado continuo)
    if (event.key === 'Backspace') {
      event.preventDefault(); // Prevenir comportamiento por defecto
      
      // Si es la primera vez que se presiona Backspace
      if (!this.backspacePresionado) {
        this.backspacePresionado = true;
        this.indiceActualBackspace = index;
        
        // Borrar inmediatamente el primer carácter
        this.realizarBorrado(index);
        
        // Configurar el borrado continuo después de un pequeño retraso
        this.timeoutInicialBackspace = setTimeout(() => {
          if (this.backspacePresionado) {
            // Iniciar borrado continuo cada 50ms (muy rápido)
            this.intervaloBackspace = setInterval(() => {
              if (this.backspacePresionado) {
                this.realizarBorrado(this.indiceActualBackspace);
              } else {
                this.detenerBackspaceContinuo();
              }
            }, 50); // 50ms = 20 borrados por segundo
          }
        }, 300); // Esperar 300ms antes de comenzar el borrado rápido
      }
      return;
    }
    
    // Detener cualquier borrado continuo si se presiona otra tecla
    this.detenerBackspaceContinuo();
    
    // Permitir teclas de navegación y edición
    if (event.key === 'Tab' || 
        event.key === 'ArrowLeft' || 
        event.key === 'ArrowRight' || 
        event.key === 'ArrowUp' || 
        event.key === 'ArrowDown' || 
        event.key === 'Delete' || 
        event.key === 'Home' || 
        event.key === 'End') {
      return;
    }
    
    // Prevenir que se ingresen caracteres no numéricos
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return;
    }
    
    // Prevenir el comportamiento por defecto para números
    event.preventDefault();
    
    // Actualizar el valor actual
    this.digitos[index] = event.key;
    
    // Saltar al siguiente input automáticamente
    if (index < 5) {
      setTimeout(() => {
        const inputs = document.querySelectorAll('.flex.justify-center.space-x-2 input');
        const nextInput = inputs[index + 1] as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }, 10);
    }
  }

  private realizarBorrado(index: number) {
    // Si el input actual tiene contenido, borrarlo
    if (this.digitos[index] && this.digitos[index] !== '') {
      this.digitos[index] = '';
    } 
    // Si el input actual está vacío y no es el primero, moverse al anterior
    else if (index > 0) {
      // Mover el foco al input anterior
      const inputs = document.querySelectorAll('.flex.justify-center.space-x-2 input');
      const prevInput = inputs[index - 1] as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
        this.indiceActualBackspace = index - 1;
        // Borrar el contenido del anterior
        this.digitos[index - 1] = '';
      }
    }
    // Si estamos en el primer input y está vacío, no hacer nada
  }

  private detenerBackspaceContinuo() {
    this.backspacePresionado = false;
    
    if (this.timeoutInicialBackspace) {
      clearTimeout(this.timeoutInicialBackspace);
      this.timeoutInicialBackspace = null;
    }
    
    if (this.intervaloBackspace) {
      clearInterval(this.intervaloBackspace);
      this.intervaloBackspace = null;
    }
  }

  verificarCodigo() {
    const codigoCompleto = this.digitos.join('');
    if (codigoCompleto.length === 6) {
      this.codigoEnviado.emit(codigoCompleto);
      this.router.navigate(['/registro/paso3']);
    }
  }

  reenviar() {
    if (this.tiempo === 0) {
      console.log("Simulando reenvío de código...");
      this.iniciarContador();
    }
  }

  onPaste(event: ClipboardEvent, index: number) {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData?.getData('text') || '';
    
    // Limpiar el texto pegado (solo números)
    const cleanText = pastedText.replace(/[^0-9]/g, '');
    
    // Pegar en las posiciones correspondientes
    for (let i = 0; i < cleanText.length && i + index < 6; i++) {
      this.digitos[i + index] = cleanText[i];
    }
    
    // Enfocar el último input que se llenó o el siguiente vacío
    setTimeout(() => {
      const nextEmptyIndex = this.digitos.findIndex(d => !d);
      if (nextEmptyIndex !== -1) {
        const inputs = document.querySelectorAll('.flex.justify-center.space-x-2 input');
        const inputToFocus = inputs[nextEmptyIndex] as HTMLInputElement;
        if (inputToFocus) {
          inputToFocus.focus();
        }
      } else {
        // Si todos están llenos, enfocar el último
        const inputs = document.querySelectorAll('.flex.justify-center.space-x-2 input');
        const lastInput = inputs[5] as HTMLInputElement;
        if (lastInput) {
          lastInput.focus();
        }
      }
    }, 10);
  }

  // Método para limpiar cuando se sale del componente
  @HostListener('window:blur')
  onWindowBlur() {
    this.detenerBackspaceContinuo();
  }
}