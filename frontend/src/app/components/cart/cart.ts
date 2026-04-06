import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { StoreService } from '../../services/store';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  storeService = inject(StoreService);
  router = inject(Router);
  
  productosRecomendados: any[] = [];

  ngOnInit() {
    // No manipulamos el DOM aquí para el tema, ya lo hace el HeaderDashboardComponent.
    // Solo nos encargamos de los datos.
    this.cargarRecomendaciones();
  }

  cargarRecomendaciones() {
    this.storeService.getStoreProducts().subscribe({
      next: (res) => {
        // Diversificamos la oferta con 4 productos aleatorios
        this.productosRecomendados = [...res]
          .sort(() => Math.random() - 0.5)
          .slice(0, 4);
      },
      error: (err) => console.error('[Roarmot Error] Fallo en carga de recomendaciones:', err)
    });
  }

  /**
   * MÉTODO FALTANTE: Redirige al detalle del producto
   * Identificador único del producto en la base de datos
   */
  verProducto(id: number) {
    // Asumiendo que tu ruta de detalle es '/app/store/producto/:id' o similar
    // Ajusta la ruta según tu AppRoutingModule
    this.router.navigate(['/app/store/producto', id]);
  }

  // AÑADE ESTE MÉTODO para que el HTML del carrito pueda renderizar
  getImagenPortada(producto: any): string {
    if (producto.imagenes && producto.imagenes.length > 0) {
      // Buscamos la marcada como principal en Django
      const portada = producto.imagenes.find((img: any) => img.es_principal);
      return portada ? portada.imagen : producto.imagenes[0].imagen;
    }
    return 'assets/img/no-image.png';
  }

  // Métodos de control vinculados al Service
  sumar(id: number) { this.cartService.actualizarCantidad(id, 1); }
  restar(id: number) { this.cartService.actualizarCantidad(id, -1); }
  eliminar(id: number) { this.cartService.eliminarProducto(id); }

  procederAlPago() {
    console.log(`[Protocolo Pago] Transacción iniciada por: ${this.cartService.total}`);
    this.router.navigate(['/app/checkout']);
  }

}