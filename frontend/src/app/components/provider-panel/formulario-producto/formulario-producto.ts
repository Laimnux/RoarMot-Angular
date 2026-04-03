import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Servicios
import { ProductoService } from '../../../services/vendedor/producto';
import { AuthService } from '../../../services/auth'; 
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-formulario-producto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-producto.html'
})
export class FormularioProductoComponent implements OnInit {
  productoForm!: FormGroup;
  selectedFiles: File[] = [];
  previews: string [] = [];
  usuarioLogueado: any = null; //Para guardar el ID real
  erroresServidor: any = {}; // calculamos el fallo de Django, posteriormente mostrarlo formulario

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private authService: AuthService,
    private notification: NotificationService, // <--- Inyectado correctamente
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    // 1. SUSCRIPCIÓN IGUAL QUE EN EL HEADER
    this.authService.usuarioActual$.subscribe(u => {
      if (u) {
        this.usuarioLogueado = u;
        console.log('ID real detectado:', u.id);
      }
    });
    // Escuchar cambios específicamente en el SKU para limpiar el error
    this.productoForm.get('sku')?.valueChanges.subscribe(() => {
      if (this.erroresServidor?.sku) {
        // Eliminamos solo el error del SKU para que el borde rojo desaparezca
        delete this.erroresServidor.sku;
      }
    });
  }

  private initForm(): void {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required]],
      marca: ['', [Validators.required]],
      sku: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      precio: [0, [Validators.required, Validators.min(1)]],
      cantidad: [0, [Validators.required, Validators.min(0)]],
      stock_minimo: [5, [Validators.required, Validators.min(1)]],
      talla: ['M'],
      id_subcategoria: ['', [Validators.required]] 
    });
  }

  
  // --- NUEVA LÓGICA DE CAPTURA IMAGENES MÚLTIPLE ---
  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      
      newFiles.forEach(file => {
        this.selectedFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previews.splice(index, 1);
  }
  // ----------------------------------------

  onSubmit(): void {
    // 1.Limpiamos errores anteriores
    this.erroresServidor = {}; 
    // 2. Validación del formulario
    if (this.productoForm.invalid) {
      this.notification.show('POR FAVOR, COMPLETA TODOS LOS CAMPOS', 'info');
      return;
    }

    const formData = new FormData();
    
    // 2. OBTENCIÓN DEL ID (Ahora es directo gracias al Serializer)
    const idVendedor = this.usuarioLogueado?.id;

    if (idVendedor) {
      formData.append('vendedor', idVendedor.toString());
    } else {
      // Si sale este error, recuerda: Cierra sesión y vuelve a entrar
      this.notification.show('ERROR: No se detectó tu ID. Reingresa al sistema.', 'error');
      return;
    }

    // 3. Mapeo de campos del formulario
    // Esto enviará nombre, marca, sku, precio, cantidad, etc.
    Object.keys(this.productoForm.value).forEach(key => {
      formData.append(key, this.productoForm.value[key]);
    });

    // --- ENVÍO DE MÚLTIPLES IMÁGENES AL BACKEND ---
    // Importante: Usamos la llave 'imagenes' que configuramos en el Serializer de Django
    this.selectedFiles.forEach(file => {
      formData.append('imagenes', file, file.name);
    });

    this.productoService.guardarProducto(formData).subscribe({
      next: (res) => {
        this.notification.show('¡PRODUCTO SINCRONIZADO CON ÉXITO!', 'success');
        setTimeout(() => {
          this.router.navigate(['/vendedor/inventario']); 
        }, 1500);
      },
      error: (err) => {
        if (err.status === 400 && err.error) {
          this.erroresServidor = err.error;

          if (this.erroresServidor.non_field_errors) {
            const mensajeGeneral = this.erroresServidor.non_field_errors[0];
            if (mensajeGeneral.includes('sku')) {
              this.erroresServidor.sku = ['Este SKU ya está registrado en tu inventario.'];
            }
          }
          this.notification.show('FALLO_VALIDACIÓN: Revisa los campos marcados', 'error');
        } else {
          this.notification.show('ERROR_SISTEMA: Contacta a soporte', 'error');
        }
      }
    });
  }
}