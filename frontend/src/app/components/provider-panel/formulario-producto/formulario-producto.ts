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

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private authService: AuthService,
    private notification: NotificationService, // <--- Inyectado correctamente
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
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
    // 1. Validación preventiva
    if (this.productoForm.invalid) {
      this.notification.show('POR FAVOR, COMPLETA TODOS LOS CAMPOS TÉCNICOS', 'info');
      Object.values(this.productoForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    // 2. Preparación del paquete de datos (FormData)
    const formData = new FormData();

    // Agregamos los valores del formulario
    Object.keys(this.productoForm.value).forEach(key => {
      formData.append(key, this.productoForm.value[key]);
    });

    // 3. Inyección de identidad del vendedor
    const usuarioActual = this.authService.usuarioActualValue;
    if (usuarioActual && usuarioActual.id) {
      formData.append('vendedor', usuarioActual.id.toString());
    } else {
      this.notification.show('ERROR: SESIÓN NO DETECTADA', 'error');
      return;
    }

    // 4. Adjuntar imagen binaria
    if (this.selectedFile) {
      formData.append('imagen', this.selectedFile);
    }

    // 5. Envío al servidor (Sincronización)
    this.productoService.guardarProducto(formData).subscribe({
      next: (res) => {
        // Notificación de éxito técnica
        this.notification.show('SISTEMA: PRODUCTO SINCRONIZADO CON ÉXITO', 'success');
        
        // Redirección al inventario
        setTimeout(() => {
          this.router.navigate(['/vendedor/inventario']); 
        }, 1500); // Un pequeño delay para que vean la notificación
      },
      error: (err) => {
        console.error('Error en la sincronización:', err);
        this.notification.show('FALLO CRÍTICO: NO SE PUDO CONECTAR CON EL SERVIDOR', 'error');
      }
    });
  }
}