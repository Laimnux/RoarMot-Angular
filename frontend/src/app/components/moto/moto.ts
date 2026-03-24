import { Component, OnInit, OnDestroy, inject, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MotoService } from '../../services/moto.service';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../services/notification.service';

// Importación de Cropper.js
import Cropper from 'cropperjs';

@Component({
  selector: 'app-moto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './moto.html',
  styleUrls: ['./moto.css']
})
export class MotoComponent implements OnInit, OnDestroy {

  baseUrl = environment.apiUrl;
  motoForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  isEditing: boolean = false;
  currentMotoId: number | null = null; 
  motoSeleccionada: any = null;

  // Propiedades para el ajustador de imagen (Roarmot Engine)
  @ViewChild('imageToCrop') imageToCrop!: ElementRef<HTMLImageElement>;
  cropper: Cropper | null = null;
  isAdjustingImage: boolean = false;
  isCropperInitializing: boolean = false;

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
      km_ultimo_mantenimiento: [0, [Validators.required, Validators.min(0)]],
      cilindraje: [150, [Validators.required, Validators.min(50)]],
      fecha_ultimo_mantenimiento: [new Date().toISOString().split('T')[0], [Validators.required]],
      tipo_uso: ['MIXTO', [Validators.required]],
      tipo_aceite: ['SEMISINTETICO', [Validators.required]]
    });
  }

  ngOnInit(): void {
    window.addEventListener('keydown', this.handleEscKey.bind(this));
  }

  ngOnDestroy(): void {
    this.destroyCropper();
    window.removeEventListener('keydown', this.handleEscKey.bind(this));
    document.body.classList.remove('modal-open');
  }

  // --- MÉTODOS DE UTILIDAD ---
  getImagenUrlAbsoluta(imagenPath: string): string {
    if (!imagenPath) return '';
    if (imagenPath.startsWith('http') || imagenPath.startsWith('data:')) return imagenPath;
    return `${this.baseUrl}/${imagenPath}`;
  }

  handleEscKey(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isAdjustingImage) {
      this.cancelarAjuste();
    }
  }

  // --- LÓGICA DEL AJUSTADOR DE IMAGEN ---

  activarAjustador() {
    if (!this.motoSeleccionada && !this.imagePreview) {
      this.notificationService.show('No hay una imagen cargada para ajustar', 'error');
      return;
    }
    
    this.isAdjustingImage = true;
    this.isCropperInitializing = true;
    document.body.classList.add('modal-open');

    // Timeout para asegurar que el DOM del modal esté listo
    setTimeout(() => {
      this.initCropper();
    }, 150);
  }

  private initCropper() {
    const imageElement = this.imageToCrop?.nativeElement;
    if (!imageElement) {
      console.error('Error: No se encontró el elemento #imageToCrop');
      return;
    }

    this.destroyCropper();

    this.cropper = new Cropper(imageElement, {
      aspectRatio: 16 / 9,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.8,
      responsive: true,
      checkCrossOrigin: true, // Vital para imágenes servidas desde Flask
      guides: true,
      center: true,
      highlight: false,
      ready: () => {
        this.isCropperInitializing = false;
        console.log('Cropper Roarmot: Inicializado');
      }
    });
  }

  guardarImagenAjustada() {
    if (!this.cropper) return;

    this.notificationService.show('Procesando encuadre...', 'info');

    const canvas = this.cropper.getCroppedCanvas({
      width: 1280,
      height: 720,
      imageSmoothingQuality: 'high'
    });

    canvas.toBlob((blob) => {
      if (!blob) {
        this.notificationService.show('Error al generar la imagen', 'error');
        return;
      }

      const fileName = `moto_crop_${Date.now()}.jpg`;
      const croppedFile = new File([blob], fileName, { type: 'image/jpeg' });

      // Si estamos editando una moto existente, la subimos de una vez
      if (this.motoSeleccionada?.id_datosmoto) {
        const formData = new FormData();
        formData.append('imagen_moto', croppedFile);

        this.motoService.actualizarMoto(this.motoSeleccionada.id_datosmoto, formData).subscribe({
          next: (res) => {
            this.notificationService.show('Imagen actualizada correctamente', 'success');
            this.motoSeleccionada = res;
            this.imagePreview = this.getImagenUrlAbsoluta(res.imagen_moto);
            this.cancelarAjuste();
          },
          error: () => this.notificationService.show('Error al guardar en el servidor', 'error')
        });
      } else {
        // Si es una moto nueva aún no registrada, solo actualizamos la vista previa
        this.selectedFile = croppedFile;
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result as string;
          this.cancelarAjuste();
        };
        reader.readAsDataURL(croppedFile);
      }
    }, 'image/jpeg', 0.9);
  }

  cancelarAjuste() {
    this.isAdjustingImage = false;
    this.isCropperInitializing = false;
    document.body.classList.remove('modal-open');
    this.destroyCropper();
  }

  private destroyCropper(): void {
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }
  }

  // --- GESTIÓN DE FORMULARIO Y DATOS ---

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.notificationService.show('El archivo debe ser una imagen', 'error');
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        // Abrir el ajustador automáticamente al seleccionar foto
        this.activarAjustador();
      };
      reader.readAsDataURL(file);
    }
  }

  guardarMoto(): void {
    if (this.motoForm.invalid) {
      this.motoForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const values = { ...this.motoForm.value };
    values.placa_moto = values.placa_moto.toUpperCase();

    Object.keys(values).forEach(key => {
      formData.append(key, values[key]);
    });

    if (this.selectedFile) {
      formData.append('imagen_moto', this.selectedFile);
    }

    const request = (this.isEditing && this.currentMotoId)
      ? this.motoService.actualizarMoto(this.currentMotoId, formData)
      : this.motoService.guardarMoto(formData);

    request.subscribe({
      next: (res) => {
        this.notificationService.show('Datos guardados correctamente', 'success');
        this.motoRegistrada.emit(res);
        this.verDetalleMoto(res);
      },
      error: () => this.notificationService.show('Error al procesar la solicitud', 'error')
    });
  }

  verDetalleMoto(moto: any) {
    this.isEditing = false;
    this.motoSeleccionada = moto;
    this.imagePreview = this.getImagenUrlAbsoluta(moto.imagen_moto);
  }

  nuevaMoto() {
    this.isEditing = false;
    this.currentMotoId = null;
    this.motoSeleccionada = null;
    this.motoForm.reset({
      kilometraje: 0,
      cilindraje: 150,
      tipo_uso: 'MIXTO',
      tipo_aceite: 'SEMISINTETICO',
      fecha_ultimo_mantenimiento: new Date().toISOString().split('T')[0]
    });
    this.imagePreview = null;
    this.selectedFile = null;
  }

  solicitarEdicion() {
    if (this.motoSeleccionada) {
      this.isEditing = true;
      this.currentMotoId = this.motoSeleccionada.id_datosmoto;
      this.motoForm.patchValue(this.motoSeleccionada);
      this.motoSeleccionada = null;
    }
  }

  eliminarMotoActual() {
    if (!this.motoSeleccionada || !confirm('¿Eliminar esta moto de Roarmot?')) return;

    this.motoService.eliminarMoto(this.motoSeleccionada.id_datosmoto).subscribe({
      next: () => {
        this.notificationService.show('Moto eliminada', 'success');
        this.nuevaMoto();
        this.motoRegistrada.emit('eliminada');
      }
    });
  }
}