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
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  usuarioLogueado: any = null; //Para guardar el ID real

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

  // Captura de imagen con vista previa técnica
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    // 1. Validación del formulario
    if (this.productoForm.invalid) {
      this.notification.show('POR FAVOR, COMPLETA TODOS LOS CAMPOS', 'info');
      return;
    }

    const formData = new FormData();
    
    // 2. OBTENCIÓN DEL ID (Ahora es directo gracias al Serializer)
    const idVendedor = this.usuarioLogueado?.id;

    if (idVendedor) {
      formData.append('vendedor', idVendedor.toString());
      console.log('ID de Vendedor detectado:', idVendedor);
    } else {
      // Si sale este error, recuerda: Cierra sesión y vuelve a entrar
      this.notification.show('ERROR: No se detectó tu ID. Reingresa al sistema.', 'error');
      return;
    }

    // 3. Mapeo de campos del formulario
    // Esto enviará nombre, marca, sku, precio, cantidad, etc.
    Object.keys(this.productoForm.value).forEach(key => {
      const value = this.productoForm.value[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // 4. Imagen
    if (this.selectedFile) {
      formData.append('imagen', this.selectedFile);
    }

    // 5. Envío al servicio
    this.productoService.guardarProducto(formData).subscribe({
      next: (res) => {
        this.notification.show('¡PRODUCTO SINCRONIZADO CON ÉXITO!', 'success');
        setTimeout(() => {
          this.router.navigate(['/vendedor/inventario']); 
        }, 1500);
      },
      error: (err) => {
        console.error('Error detallado de Django:', err.error);
        this.notification.show('FALLO EN EL SERVIDOR: Revisa los datos', 'error');
      }
    });
  }
}