import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

// Servicios
import { ProductoService } from '../../../services/vendedor/producto';
import { AuthService } from '../../../services/auth';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario.html',
  styleUrls: ['./inventario.css']
})
export class InventarioComponent implements OnInit, OnDestroy {
  // Estado del inventario
  productos: any[] = [];
  productosFiltrados: any[] = []; // Lista que se muestra en el HTML
  usuarioId: number | null = null;
  loading: boolean = true;

  // Para evitar fugas de memoria
  private authSub!: Subscription;

  constructor(
    private productoService: ProductoService,
    private authService: AuthService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    // 1. Nos conectamos al flujo de identidad del AuthService
    this.authSub = this.authService.usuarioActual$.subscribe({
      next: (u) => {
        if (u && u.id) {
          this.usuarioId = u.id;
          this.cargarInventario();
        } else {
          this.loading = false;
          console.warn('Inventario: No se detectó sesión activa.');
        }
      },
      error: (err: any) => {
        console.error('Error en la suscripción de usuario:', err);
        this.loading = false;
      }
    });
  }

  // 2. Cargar productos desde el Service
  cargarInventario(): void {
    this.loading = true;
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.productosFiltrados = data; // Al cargar, mostramos todo
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.notification.show('ERROR AL CARGAR EL STOCK', 'error');
        console.error('Fallo API:', err);
      }
    });
  }

  // 3. Lógica de búsqueda (Se activa desde el (input) en el HTML)
  onSearch(event: any): void {
    const query = event.target.value.toLowerCase().trim();
    
    if (!query) {
      this.productosFiltrados = [...this.productos];
      return;
    }

    this.productosFiltrados = this.productos.filter(p => 
      (p.nombre && p.nombre.toLowerCase().includes(query)) || 
      (p.sku && p.sku.toLowerCase().includes(query))
    );
  }

  // 4. Eliminar producto
  borrarProducto(id: number, nombre: string): void {
    if (confirm(`¿Estás seguro de eliminar "${nombre}" del inventario?`)) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => {
          this.notification.show('PRODUCTO ELIMINADO', 'success');
          // Actualizamos ambas listas localmente
          this.productos = this.productos.filter(p => p.id !== id);
          this.productosFiltrados = this.productosFiltrados.filter(p => p.id !== id);
        },
        error: (err: any) => {
          this.notification.show('NO SE PUDO ELIMINAR', 'error');
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}