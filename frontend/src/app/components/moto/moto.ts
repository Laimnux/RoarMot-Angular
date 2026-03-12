import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MotoService } from '../../services/moto.service';
import { environment } from '../../../environments/environment';
// Importamos el servicio de notificaciones desde la ruta correcta de services
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-moto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './moto.html',
  styleUrls: ['./moto.css']
})
export class MotoComponent implements OnInit {
  // --- PROPIEDADES ---
  baseUrl = environment.apiUrl;
  motoForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  
  // Controla si mostramos el formulario de registro (null) o el detalle de una moto
  motoSeleccionada: any = null; 

  // Emitimos un evento al padre (Dashboard) cuando se registra una moto con éxito
  @Output() motoRegistrada = new EventEmitter<string>();

  // Inyectamos los servicios
  private fb = inject(FormBuilder);
  private motoService = inject(MotoService);
  private notificationService = inject(NotificationService); 

  constructor() {
    // Inicialización del formulario reactivo
    this.motoForm = this.fb.group({
      marca_moto: ['', [Validators.required]],
      modelo_moto: ['', [Validators.required]],
      color_moto: ['', [Validators.required]], 
      placa_moto: ['', [Validators.required, Validators.maxLength(10)]],
      kilometraje: [0, [Validators.required, Validators.min(0)]],
      soat_moto: ['', [Validators.required]],
      tecnomecanica: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {}

  // --- LÓGICA DE IMAGEN ---
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

  // --- ACCIONES DEL SELECTOR ---
  
  nuevaMoto() {
    this.motoSeleccionada = null;
    this.resetFormulario();
    console.log("Cambiando a modo registro...");
  }

  // Centralizamos el reset para usarlo en varios lugares
  resetFormulario() {
    this.motoForm.reset({
      kilometraje: 0
    });
    this.imagePreview = null;
    this.selectedFile = null;
  }

  /**
   * Esta función es requerida por el Dashboard para mostrar los detalles
   * de una moto ya existente.
   */
  verDetalleMoto(moto: any) {
    this.motoSeleccionada = moto;
    console.log('Visualizando detalle de:', moto);
  }

  // --- PERSISTENCIA (GUARDADO CON IMAGEN Y NOTIFICACIONES) ---
  guardarMoto(): void {
    // 1. Validación inicial
    if (this.motoForm.invalid) {
      this.motoForm.markAllAsTouched();
      this.notificationService.show('Por favor llena todos los datos requeridos.', 'error');
      return;
    }

    // 2. Preparación de datos (FormData)
    const formData = new FormData();
    const formValues = { ...this.motoForm.value };
    formValues.placa_moto = formValues.placa_moto.toUpperCase();

    Object.keys(formValues).forEach(key => {
      formData.append(key, formValues[key]);
    });

    if (this.selectedFile) {
      formData.append('imagen_moto', this.selectedFile);
    }

    // 3. Decisión: ¿Actualizar o Crear?
    // Si motoSeleccionada existe y tiene un ID, vamos a actualizar
    if (this.motoSeleccionada && this.motoSeleccionada.id) {
      
      this.motoService.actualizarMoto(this.motoSeleccionada.id, formData).subscribe({
        next: (res) => {
          this.notificationService.show(`¡Moto ${res.placa_moto} actualizada!`, 'success');
          this.motoRegistrada.emit(res.placa_moto);
          this.nuevaMoto(); // Limpia y vuelve a modo registro
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          this.notificationService.show('Error al actualizar los datos.', 'error');
        }
      });

    } else {
      
      // Lógica de Registro Nuevo (Tu código original)
      this.motoService.guardarMoto(formData).subscribe({
        next: (res) => {
          this.notificationService.show(`¡Moto ${res.placa_moto} registrada con éxito!`, 'success');
          this.motoRegistrada.emit(res.placa_moto);
          this.nuevaMoto(); 
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          this.notificationService.show('Hubo un error al guardar en el servidor.', 'error');
        }
      });
    }
  }

  // moto.ts

  // Método para cargar los datos en el formulario
  cargarDatosParaEditar(moto: any) {
    this.motoSeleccionada = moto;
    
    // PatchValue llena los campos que coincidan con los nombres del formulario
    this.motoForm.patchValue({
      marca_moto: moto.marca_moto,
      modelo_moto: moto.modelo_moto,
      color_moto: moto.color_moto,
      placa_moto: moto.placa_moto,
      kilometraje: moto.kilometraje,
      soat_moto: moto.soat_moto,
      tecnomecanica: moto.tecnomecanica
    });

    // Si la moto tiene imagen, podemos mostrar la previsualización
    if (moto.imagen_moto) {
      this.imagePreview = moto.imagen_moto; 
    }
  }
}