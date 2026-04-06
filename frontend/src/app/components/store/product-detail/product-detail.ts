import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StoreService } from '../../../services/store';
import { Producto } from '../../../models/producto.model';
import { CartService } from '../../../services/cart.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})
export class ProductDetailComponent implements OnInit {

  // Usamos inject para una sintaxis más limpia y moderna
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private _storeService = inject(StoreService);
  public cartService = inject(CartService); // <--- INYECTAMOS EL CEREBRO DEL CARRITO
  private _notificationService = inject(NotificationService); // <--- Nombre con guion bajo

  // Estados del componente
  producto?: Producto;
  productosRelacionados: Producto [] = []; // para "Prodcutos parecidos"
  loading: boolean = true;
  imagenSeleccionada?: string; // para el visor de la galeria
  isAdding: boolean = false;


  ngOnInit(): void {
    // Usamos paramMap.subscribe para que si el usuario hace clic en un 
    // producto relacionado, la página se refresque con el nuevo ID
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.cargarProducto(Number(id));
      }
    });
  }

  cargarProducto(id: number) {
    this.loading = true;
    this._storeService.getProductoById(id).subscribe({
      next: (data) => {
        this.producto = data;
        // Establecemos la imagen principal por defecto
        this.imagenSeleccionada = this.getImagenPortada(data);
        this.loading = false;
        this.cargarRelacionados();
      },
      error: (err) => {
        console.error('Error al cargar detalle:', err);
        this.loading = false;
        this.router.navigate(['/app/store']);
      }
    });
  }

  // Busca la portada para el inicio
  getImagenPortada(producto: Producto): string {
    if (producto.imagenes && producto.imagenes.length > 0) {
      const portada = producto.imagenes.find(img => img.es_principal);
      return portada ? portada.imagen : producto.imagenes[0].imagen;
    }
    return 'assets/img/no-image.png';
  }

  // Cambia la imagen grande al hacer clic en una miniatura
  seleccionarImagen(url: string) {
    this.imagenSeleccionada = url;
  }

  cargarRelacionados() {
    // Aquí podrías filtrar por subcategoría en tu servicio
    this._storeService.getStoreProducts().subscribe(productos => {
      // Filtramos para no mostrar el producto actual y solo los de la misma marca o tipo
      this.productosRelacionados = productos
        .filter(p => p.id !== this.producto?.id)
        .slice(0, 4); // Mostramos solo 4
    });
  }

  verProducto(id: number) {
    this.router.navigate(['/app/store/producto', id]);
    window.scrollTo(0, 0); // Volver arriba al navegar
  }

  volver() {
    this.router.navigate(['/app/store']);
  }

  // --- MÉTODO CORREGIDO ---
  agregarAlCarrito() {
    if (this.producto) {
      this.isAdding = true; 
      
      setTimeout(() => {
        // Usamos el operador ! porque ya validamos que this.producto existe
        this.cartService.agregarProducto(this.producto!); 
        
        this.isAdding = false;

        // CORRECCIÓN: Usar _notificationService (con el guion bajo)
        this._notificationService.show('SUMINISTRO_VINCULADO', 'success');
        
        // NAVEGACIÓN: Asegúrate de que esta ruta coincida con tu AppRoutingModule
        this.router.navigate(['/app/cart']); 
        
      }, 800);
    }
  }
}