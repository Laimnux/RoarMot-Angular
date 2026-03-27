import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importación necesaria para redirección
import { AuthService } from '../../services/auth'; // Asegúrate que esta ruta sea correcta
import { StoreService } from '../../services/store';
import { Producto } from '../../models/producto.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './store.html',
  styleUrls: ['./store.css']
})
export class StoreComponent implements OnInit {
  listProductos: Producto[] = [];
  loading: boolean = false;
  private buscador = new Subject<string>();

  constructor(
    private _storeService: StoreService,
    private router: Router,
    private authService: AuthService
  ) {
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
}