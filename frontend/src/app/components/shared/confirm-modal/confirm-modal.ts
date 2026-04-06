import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirm-modal.html',
  styleUrls: ['./confirm-modal.css']
})
export class ConfirmModalComponent {
  @Input() titulo: string = 'CREAR OFERTA';
  @Input() nombreProducto: string = '';
  @Input() visible: boolean = false;
  
  @Output() alConfirmar = new EventEmitter<number>();
  @Output() alCancelar = new EventEmitter<void>();

  porcentaje: number = 20;

  confirmar() {
    if (this.porcentaje > 0 && this.porcentaje < 100) {
      this.alConfirmar.emit(this.porcentaje);
    }
  }

  cancelar() {
    this.alCancelar.emit();
  }
}