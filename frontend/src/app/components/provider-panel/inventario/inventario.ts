import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { share, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

// --- NUEVO IMPORT PARA EL DRAG & DROP ---
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

// Servicios
import { ProductoService } from '../../../services/vendedor/producto';
import { AuthService } from '../../../services/auth';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-inventario',
  standalone: true,

  imports: [CommonModule, FormsModule, DragDropModule, ConfirmModalComponent],
  templateUrl: './inventario.html',
  styleUrls: ['./inventario.css']
})
export class InventarioComponent implements OnInit, OnDestroy {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  usuarioId: number | null = null;
  loading: boolean = true;

  // Control de edición inline
  editingId: number | null = null;
  editingField: string | null = null;
  tempValue: any = null;

  // --- NUEVAS VARIABLES PARA EL MODAL ---
  mostrarModalOferta = false;
  productoEnEdicion: any = null;

  private authSub!: Subscription;

  constructor(
    private productoService: ProductoService,
    private authService: AuthService,
    private notification: NotificationService
  ) {}

  // --- NUEVA FUNCIÓN PARA PROCESAR LA PROMOCIÓN AL SOLTAR ---
  // --- FUNCIÓN LIMPIA PARA PROCESAR LA PROMOCIÓN ---
  onDropInSpecial(event: CdkDragDrop<any[]>): void {
    // 1. Guardamos el producto que se soltó
    this.productoEnEdicion = event.item.data;

    // 2. Notificación informativa (Opcional, pero da feedback visual)
    this.notification.show(`CONFIGURANDO OFERTA: ${this.productoEnEdicion.nombre.toUpperCase()}`, 'info');

    // 3. ABRIMOS EL MODAL (Y nada más, el modal se encarga del resto)
    this.mostrarModalOferta = true;
  }

  // --- NUEVAS FUNCIONES PARA MANEJAR LA RESPUESTA DEL MODAL ---
  cancelarOferta() {
    this.mostrarModalOferta = false;
    this.productoEnEdicion = null;
  }

  confirmarOferta(porcentaje: number) {
    const producto = this.productoEnEdicion;

    this.productoService.establecerPromocion(producto.id, {
      en_oferta: true,
      porcentaje_descuento: porcentaje
    }).subscribe({
      next: (res) => {
        const idx = this.productos.findIndex(p => p.id === producto.id);
        if (idx !== -1) {
          this.productos[idx] = { ...this.productos[idx], ...res };
          this.productosFiltrados = [...this.productos];
        }
        this.notification.show(`¡OFERTA DEL ${porcentaje}% ACTIVADA!`, 'success');
        this.cancelarOferta(); // Cerramos el modal
      },
      error: () => {
        this.notification.show('FALLO EN LA CONEXIÓN', 'error');
        this.cancelarOferta();
      }
    });
  }

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

  // --- LÓGICA DE EDICIÓN INLINE ---

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
    if (prod[campo] === nuevoValor) {
      this.cancelarEdicion();
      return;
    }

    let valorFinal = nuevoValor;
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
        prod[campo] = valorFinal;
        this.notification.show(`${campo.toUpperCase()} ACTUALIZADO`, 'success');
        this.cancelarEdicion();
      },
      error: (err) => {
        const errorMsg = err.error?.sku ? 'EL SKU YA EXISTE' : 'ERROR AL ACTUALIZAR';
        this.notification.show(errorMsg, 'error');
        this.cancelarEdicion();
      }
    });
  }

  // --- GESTIÓN DE GALERÍA (SUBVENTANA FLOTANTE) ---

  // Ahora recibimos el objeto 'prod' completo para actualizar su lista localmente
  eliminarImagen(prod: any, imgId: number): void {
    if (confirm('¿Deseas eliminar esta imagen de la galería?')) {
      this.productoService.eliminarImagen(imgId).subscribe({
        next: () => {
          this.notification.show('IMAGEN ELIMINADA', 'success');
          // Filtramos las imágenes del producto actual para que desaparezca de la vista de inmediato
          prod.imagenes = prod.imagenes.filter((img: any) => img.id !== imgId);
        },
        error: () => this.notification.show('ERROR AL ELIMINAR', 'error')
      });
    }
  }

  // Recibimos el ID del producto y el ID de la imagen para la portada
  establecerPortada(productoId: number, imgId: number): void {
    this.productoService.setPortada(productoId, imgId).subscribe({
      next: (res) => {
        // Buscamos el producto en nuestra lista principal para actualizar sus imágenes
        // (El backend suele devolver la lista con la nueva portada en la posición [0])
        const productoLocal = this.productos.find(p => p.id === productoId);
        if (productoLocal) {
          productoLocal.imagenes = res.imagenes;
        }
        this.notification.show('PORTADA ACTUALIZADA', 'success');
      },
      error: () => this.notification.show('ERROR AL CAMBIAR PORTADA', 'error')
    });
  }

  // --- MANEJO DE IMÁGENES (SISTEMA DE GALERÍA / SUBIDA) ---

  onImageChange(event: any, prod: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('imagenes', file, file.name);

    // Nota: Usamos patchProducto o guardarProducto según tengas definido en el servicio
    // para que el backend cree el registro en ProductoImagen
    this.productoService.patchProducto(prod.id, formData).subscribe({
      next: (res) => {
        prod.imagenes = res.imagenes; 
        this.notification.show('IMAGEN AÑADIDA A LA GALERÍA', 'success');
        event.target.value = ''; // Limpiar input
      },
      error: () => {
        this.notification.show('FALLO AL SUBIR IMAGEN', 'error');
      }
    });
  }

  // --- ELIMINAR PRODUCTO COMPLETO ---

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