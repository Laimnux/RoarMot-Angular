import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

// Servicios
import { ProductoService } from '../../../services/vendedor/producto';
import { AuthService } from '../../../services/auth';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrls: ['./inventario.css']
})
export class InventarioComponent implements OnInit, OnDestroy {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  usuarioId: number | null = null;
  loading: boolean = true;

  // Control de edición
  editingId: number | null = null;
  editingField: string | null = null;
  tempValue: any = null;

  private authSub!: Subscription;

  constructor(
    private productoService: ProductoService,
    private authService: AuthService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService.usuarioActual$.subscribe({
      next: (u) => {
        if (u && u.id) {
          this.usuarioId = u.id;
          this.cargarInventario();
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error en la suscripción:', err);
        this.loading = false;
      }
    });
  }

  cargarInventario(): void {
    this.loading = true;
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.productosFiltrados = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notification.show('ERROR AL CARGAR EL STOCK', 'error');
      }
    });
  }

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

  // --- LÓGICA DE EDICIÓN (UNIFICADA) ---

  comenzarEdicion(prod: any, campo: string): void {
    this.editingId = prod.id;
    this.editingField = campo;
    this.tempValue = prod[campo];
  }

  cancelarEdicion(): void {
    this.editingId = null;
    this.editingField = null;
    this.tempValue = null;
  }

  actualizarCampo(prod: any, campo: string, nuevoValor: any): void {
    // 1. Validación de cambio: Si el valor es el mismo, no hacemos nada
    if (prod[campo] === nuevoValor) {
      this.cancelarEdicion();
      return;
    }

    // 2. Limpieza de datos según el modelo de Django
    let valorFinal = nuevoValor;
    
    // Convertir a número si el campo lo requiere en el modelo
    if (['precio', 'cantidad', 'stock_minimo'].includes(campo)) {
      valorFinal = Number(nuevoValor);
      if (isNaN(valorFinal)) {
        this.notification.show('POR FAVOR INGRESA UN NÚMERO VÁLIDO', 'error');
        this.cancelarEdicion();
        return;
      }
    }

    const dataPatch = { [campo]: valorFinal };

    this.productoService.patchProducto(prod.id, dataPatch).subscribe({
      next: (res) => {
        // Actualizamos la vista localmente
        prod[campo] = valorFinal;
        this.notification.show(`${campo.toUpperCase()} ACTUALIZADO`, 'success');
        this.cancelarEdicion();
      },
      error: (err) => {
        console.error('Error Django:', err.error);
        // Manejo de errores específicos (ej. SKU duplicado)
        const errorMsg = err.error?.sku ? 'EL SKU YA EXISTE' : 'ERROR AL ACTUALIZAR';
        this.notification.show(errorMsg, 'error');
        this.cancelarEdicion();
      }
    });
  }

  // --- MANEJO DE IMÁGENES ---
  onImageChange(event: any, prod: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('imagen', file);

    this.productoService.patchProducto(prod.id, formData).subscribe({
      next: (res) => {
        prod.imagen = res.imagen; // URL devuelta por Django
        this.notification.show('IMAGEN ACTUALIZADA', 'success');
      },
      error: () => this.notification.show('FALLO AL SUBIR IMAGEN', 'error')
    });
  }

  borrarProducto(id: number, nombre: string): void {
    if (confirm(`¿Estás seguro de eliminar "${nombre}"?`)) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => {
          this.notification.show('PRODUCTO ELIMINADO', 'success');
          this.productos = this.productos.filter(p => p.id !== id);
          this.productosFiltrados = this.productosFiltrados.filter(p => p.id !== id);
        },
        error: () => this.notification.show('NO SE PUDO ELIMINAR', 'error')
      });
    }
  }

  ngOnDestroy(): void {
    if (this.authSub) this.authSub.unsubscribe();
  }
}