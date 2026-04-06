import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // Importación necesaria para redirección
import { AuthService } from '../../services/auth'; // Asegúrate que esta ruta sea correcta
import { StoreService } from '../../services/store';
import { Producto } from '../../models/producto.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';


@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './store.html',
  styleUrls: ['./store.css']
})
export class StoreComponent implements OnInit {
  // Inyectamos el servicio de forma pública para el HTML
  public cartService = inject(CartService); 
  
  private _storeService = inject(StoreService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthService);

  listProductos: Producto[] = [];
  loading: boolean = false;
  private buscador = new Subject<string>();

  constructor() {
    // Lógica de redirección inteligente:
    // Si el usuario ya está logueado y entra por la URL pública (/tienda),
    // lo enviamos a la versión del Dashboard (/app/store) para que vea su Header de usuario.
    if (this.authService.isLoggedIn() && this.router.url === '/tienda') {
      this.router.navigate(['/app/store']);
    }
  }

  ngOnInit(): void {
    this.obtenerProductos();

    // Configuración del buscador para no saturar el servidor (Debounce)
    this.buscador.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(termino => {
      this.obtenerProductos(termino);
    });
  }

  obtenerProductos(termino: string = '') {
    this.loading = true;
    this._storeService.getStoreProducts(termino).subscribe({
      next: (data) => {
        this.listProductos = data;
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        console.error('Error cargando la Store:', e);
      }
    });
  }

  onSearch(event: any) {
    const term = event.target.value;
    this.buscador.next(term);
  }

  // Dentro de la clase StoreComponent
  verDetalle(id: number) {
    // Si el usuario está en /app/store, navegará a /app/store/producto/ID
    this.router.navigate(['producto', id], { relativeTo: this.activatedRoute });
    // Navegamos a la ruta de detalle pasando el ID del producto
    this.router.navigate(['/app/store/producto', id]);
  }

  getImagenPortada(producto: Producto): string {
    if (producto.imagenes && producto.imagenes.length > 0) {
      // 1. Buscamos la imagen que marcaste como principal en el backend
      const portada = producto.imagenes.find(img => img.es_principal);
      
      // 2. Si existe, devolvemos su URL; si no, la primera del arreglo
      return portada ? portada.imagen : producto.imagenes[0].imagen;
    }
    
    // 3. Imagen por defecto si el producto no tiene fotos
    return 'assets/img/no-image.png';
  }
}