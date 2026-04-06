import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Añadido RouterModule
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-method',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Añadido aquí
  templateUrl: './payment-method.html',
  styleUrls: ['./payment-method.css']
})
export class PaymentMethodComponent {
  private router = inject(Router);
  
  metodoSeleccionado: string = '';

  // Esta lista la usaremos en el HTML con un *ngFor para mantener el código limpio
  metodos = [
    { id: 'card', nombre: 'Tarjeta de Crédito', sub: 'Visa / Mastercard / Amex', icon: 'fas fa-credit-card' },
    { id: 'nequi', nombre: 'Nequi / Daviplata', sub: 'Transferencia Directa Móvil', icon: 'fas fa-mobile-alt' },
    { id: 'pse', nombre: 'PSE (Débito)', sub: 'Banca Nacional Sincronizada', icon: 'fas fa-university' }
  ];

  continuar() {
    if (this.metodoSeleccionado) {
      // Aquí podrías guardar el método en un servicio (ej. CartService) antes de navegar
      console.log("Protocolo iniciado con:", this.metodoSeleccionado);
      this.router.navigate(['/app/checkout']);
    }
  }
}