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

  isEditing: boolean = false;
  currentMotoId: number | null = null; // <-- 1. Faltaba declarar esta variable

  motoSeleccionada: any = null;

  @Output() motoRegistrada = new EventEmitter<string>();

  private fb = inject(FormBuilder);
  private motoService = inject(MotoService);
  private notificationService = inject(NotificationService);

  constructor() {
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
    this.isEditing = false; // Aseguramos resetear el modo
    this.currentMotoId = null;
    this.motoSeleccionada = null;
    this.resetFormulario();
  }

  resetFormulario() {
    this.motoForm.reset({ kilometraje: 0 });
    this.imagePreview = null;
    this.selectedFile = null;
  }

  verDetalleMoto(moto: any) {
    this.isEditing = false; // Si vemos detalle, no estamos editando
    this.motoSeleccionada = moto;
  }

  // --- PERSISTENCIA Guardado de Moto ---
  guardarMoto(): void {
    // 1. Validación inicial
    if (this.motoForm.invalid) {
      this.motoForm.markAllAsTouched();
      this.notificationService.show('Formulario inválido', 'error');
      return;
    }

    // 2. Preparación de datos (FormData)
    const formData = new FormData();
    const formValues = { ...this.motoForm.value };
    
    if (formValues.placa_moto) {
      formValues.placa_moto = formValues.placa_moto.toUpperCase();
    }

    Object.keys(formValues).forEach(key => {
      // Si el valor es nulo o es la URL de la imagen previa (un string), no lo enviamos
      if (formValues[key] !== null && formValues[key] !== undefined && typeof formValues[key] !== 'string') {
        formData.append(key, formValues[key]);
      } else if (typeof formValues[key] === 'string' && key !== 'imagen_moto') {
        // Enviamos strings normales (marca, modelo, etc.) pero ignoramos la URL de la imagen
        formData.append(key, formValues[key]);
      }
    });

    if (this.selectedFile) {
      formData.append('imagen_moto', this.selectedFile);
    }

    // 3. Ejecución de la petición
    if (this.isEditing && this.currentMotoId) {
      // --- CAMINO A: ACTUALIZAR ---
      this.motoService.actualizarMoto(this.currentMotoId, formData).subscribe({
        next: (res) => {
          this.notificationService.show('¡Moto actualizada!', 'success');
          
          // Finalizamos el estado de edición y limpiamos
          this.isEditing = false;
          this.currentMotoId = null;
          this.selectedFile = null;

          // Emitimos el objeto completo al Dashboard para que refresque la lista
          this.motoRegistrada.emit(res); 
          
          // Saltamos directamente a la vista de detalle de la moto actualizada
          this.verDetalleMoto(res);
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          this.notificationService.show('Error al actualizar los datos', 'error');
        }
      });

    } else {
      // --- CAMINO B: REGISTRO NUEVO ---
      this.motoService.guardarMoto(formData).subscribe({
        next: (res) => {
          this.notificationService.show('¡Moto registrada!', 'success');
          
          this.resetFormulario(); // Limpia el formulario
          this.motoRegistrada.emit(res); // Avisa al dashboard
          
          // También saltamos al detalle de la nueva moto
          this.verDetalleMoto(res);
        },
        error: (err) => {
          console.error('Error al registrar:', err);
          this.notificationService.show('Error al registrar nueva moto', 'error');
        }
      });
    }
  }

  // --- EDICIÓN ---
  solicitarEdicion() {
    if (this.motoSeleccionada) {
      // IMPORTANTE: Verifica si es .id_datosmoto o .ID_DATOSMOTO
      // Según tu log de consola anterior es: id_datosmoto
      this.currentMotoId = this.motoSeleccionada.id_datosmoto; 
      
      const motoAEditar = { ...this.motoSeleccionada };
      this.isEditing = true;
      this.motoSeleccionada = null; // Esto activa el *ngIf del formulario

      setTimeout(() => {
        this.cargarDatosParaEditar(motoAEditar);
        console.log('Modo Edición Activado para ID:', this.currentMotoId);
      }, 100);
    }
  }

  cargarDatosParaEditar(moto: any) {
    this.motoForm.patchValue({
      marca_moto: moto.marca_moto,
      modelo_moto: moto.modelo_moto,
      color_moto: moto.color_moto,
      placa_moto: moto.placa_moto,
      kilometraje: moto.kilometraje,
      soat_moto: moto.soat_moto,
      tecnomecanica: moto.tecnomecanica
    });

    if (moto.imagen_moto) {
      this.imagePreview = moto.imagen_moto; 
    }
  }

  // 3. Método necesario para limpiar todo después de una acción
  finalizarModoEdicion() {
    this.isEditing = false;
    this.currentMotoId = null;
    this.resetFormulario();
    // Aquí podrías llamar a obtenerMotos() o dejar que el EventEmitter haga su trabajo
  }

  // Eliminamos Moto
  eliminarMotoActual() {
    if (!this.motoSeleccionada) return;

    const confirmacion = confirm(`¿Estás seguro de que deseas eliminar la moto con placa ${this.motoSeleccionada.placa_moto}?`);
    
    if (confirmacion) {
      const idAEliminar = this.motoSeleccionada.id_datosmoto;
      this.motoService.eliminarMoto(idAEliminar).subscribe({
        next: () => {
          this.notificationService.show('Moto eliminada correctamente', 'success');
          this.motoSeleccionada = null; // Cerramos el detalle
          this.motoRegistrada.emit('eliminada'); // Avisamos al dashboard para refrescar lista
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          this.notificationService.show('No se pudo eliminar la moto', 'error');
        }
      });
    }
  }
}