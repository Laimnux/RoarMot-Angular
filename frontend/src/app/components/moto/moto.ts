import { Component, OnInit, inject, Output, EventEmitter, HostListener  } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MotoService } from '../../services/moto.service';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../services/notification.service';



@Component({
  selector: 'app-moto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './moto.html',
  styleUrls: ['./moto.css']
})
export class MotoComponent implements OnInit {

  baseUrl = environment.apiUrl;
  motoForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  isEditing: boolean = false;
  currentMotoId: number | null = null; 
  motoSeleccionada: any = null;

  @Output() motoRegistrada = new EventEmitter<any>();

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
      // --- CAMPOS TÉCNICOS ---
      km_ultimo_mantenimiento: [0, [Validators.required, Validators.min(0)]],
      cilindraje: [150, [Validators.required, Validators.min(50)]],
      fecha_ultimo_mantenimiento: [new Date().toISOString().split('T')[0], [Validators.required]],
      tipo_uso: ['MIXTO', [Validators.required]],
      tipo_aceite: ['SEMISINTETICO', [Validators.required]]
    });
  }

  ngOnInit(): void {}

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

  nuevaMoto() {
    this.isEditing = false;
    this.currentMotoId = null;
    this.motoSeleccionada = null;
    this.resetFormulario();
  }

  resetFormulario() {
    this.motoForm.reset({ 
      kilometraje: 0,
      km_ultimo_mantenimiento: 0, // Resetear también este
      cilindraje: 150, 
      tipo_uso: 'MIXTO', 
      tipo_aceite: 'SEMISINTETICO',
      fecha_ultimo_mantenimiento: new Date().toISOString().split('T')[0]
    });
    this.imagePreview = null;
    this.selectedFile = null;
  }

  verDetalleMoto(moto: any) {
    this.isEditing = false;
    this.motoSeleccionada = moto;
  }

  guardarMoto(): void {
    if (this.motoForm.invalid) {
      this.motoForm.markAllAsTouched();
      this.notificationService.show('Completa los campos técnicos correctamente', 'error');
      return;
    }

    const formData = new FormData();
    const formValues = { ...this.motoForm.value };
    
    if (formValues.placa_moto) {
      formValues.placa_moto = formValues.placa_moto.toUpperCase();
    }

    Object.keys(formValues).forEach(key => {
      if (formValues[key] !== null && formValues[key] !== undefined) {
        formData.append(key, formValues[key]);
      }
    });

    if (this.selectedFile) {
      formData.append('imagen_moto', this.selectedFile);
    }

    if (this.isEditing && this.currentMotoId) {
      this.motoService.actualizarMoto(this.currentMotoId, formData).subscribe({
        next: (res) => {
          this.notificationService.show('Configuración mecánica actualizada', 'success');
          this.isEditing = false;
          this.motoRegistrada.emit(res); 
          this.verDetalleMoto(res);
        },
        error: (err) => {
          this.notificationService.show('Error al actualizar datos técnicos', 'error');
        }
      });
    } else {
      this.motoService.guardarMoto(formData).subscribe({
        next: (res) => {
          this.notificationService.show('¡Moto registrada con éxito!', 'success');
          this.resetFormulario();
          this.motoRegistrada.emit(res); 
          this.verDetalleMoto(res);
        },
        error: (err) => {
          this.notificationService.show('Error al registrar nueva moto', 'error');
        }
      });
    }
  }

  solicitarEdicion() {
    if (this.motoSeleccionada) {
      this.currentMotoId = this.motoSeleccionada.id_datosmoto; 
      const motoAEditar = { ...this.motoSeleccionada };
      this.isEditing = true;
      // Quitamos motoSeleccionada para que el *ngIf muestre el formulario
      this.motoSeleccionada = null; 

      setTimeout(() => {
        this.cargarDatosParaEditar(motoAEditar);
      }, 50);
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
      tecnomecanica: moto.tecnomecanica,
      cilindraje: moto.cilindraje,
      fecha_ultimo_mantenimiento: moto.fecha_ultimo_mantenimiento,
      tipo_uso: moto.tipo_uso,
      tipo_aceite: moto.tipo_aceite,
      // --- CORRECCIÓN: AGREGAR EL CAMPO FALTANTE AQUÍ ---
      km_ultimo_mantenimiento: moto.km_ultimo_mantenimiento || 0
    });

    if (moto.imagen_moto) {
      // Si la imagen viene de la DB, la mostramos en la previsualización
      this.imagePreview = moto.imagen_moto.startsWith('http') 
        ? moto.imagen_moto 
        : `${this.baseUrl}/${moto.imagen_moto}`;
    }
  }

  eliminarMotoActual() {
    if (!this.motoSeleccionada) return;
    const confirmacion = confirm(`¿Eliminar moto ${this.motoSeleccionada.placa_moto}?`);
    
    if (confirmacion) {
      this.motoService.eliminarMoto(this.motoSeleccionada.id_datosmoto).subscribe({
        next: () => {
          this.notificationService.show('Moto eliminada', 'success');
          this.motoSeleccionada = null;
          this.motoRegistrada.emit('eliminada');
        },
        error: (err) => {
          this.notificationService.show('Error al eliminar', 'error');
        }
      });
    }
  }

}

