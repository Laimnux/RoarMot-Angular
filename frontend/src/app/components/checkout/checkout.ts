import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

// Servicios
import { CartService } from '../../services/cart.service';
import { PedidoService } from '../../services/pedido.service';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification.service'; // <--- Importamos tu servicio

// Modelos
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  // Inyección de servicios (Public para acceso en HTML donde sea necesario)
  public cartService = inject(CartService); 
  private notificationService = inject(NotificationService); // <--- Inyectamos aquí
  private pedidoService = inject(PedidoService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Observables y Estado
  itemsCarrito$ = this.cartService.cart$; 
  usuarioLogueado: Usuario | null = null;
  enviando = false;
  
  private subscripciones = new Subscription();

  constructor() {}

  ngOnInit() {
    // Suscripción al piloto activo
    const authSub = this.authService.usuarioActual$.subscribe(user => {
      this.usuarioLogueado = user;
    });
    this.subscripciones.add(authSub);
  }

  ngOnDestroy() {
    this.subscripciones.unsubscribe();
  }

  confirmarPedido() {
    // Validación con Notificación de Error
    if (!this.usuarioLogueado?.direccion) {
      this.notificationService.show(
        "PROTOCOLO INCOMPLETO: Se requiere dirección de entrega para el despacho.", 
        "error"
      );
      return;
    }

    this.enviando = true;

    // Captura de items actuales para el payload de Django
    let itemsActuales: any[] = [];
    this.itemsCarrito$.subscribe(items => itemsActuales = items).unsubscribe();

    const pedidoData = {
      total_pago: this.cartService.total, 
      detalles: itemsActuales.map(item => ({
        producto_id: item.id,
        nombre_producto: item.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.precio_oferta ? parseFloat(item.precio_oferta) : parseFloat(item.precio)
      }))
    };

    this.pedidoService.crearPedido(pedidoData).subscribe({
      next: (res) => {
        // Notificación de éxito
        this.notificationService.show("SUMINISTROS DESPLEGADOS: Pedido procesado correctamente.", "success");

        setTimeout(() => {
          this.cartService.limpiarCarrito(); 
          this.router.navigate(['/app/perfil']); 
        }, 2000);
      },
      error: (err) => {
        this.enviando = false;
        console.error("ERROR EN EL SERVIDOR:", err);
        // Notificación de fallo técnico
        this.notificationService.show("FALLO DE TRANSMISIÓN: No se pudo contactar con el garaje central.", "error");
      }
    });
  }
}