import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MotoService } from '../../services/moto.service';
import { environment } from '../../../environments/environment';

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

  private fb = inject(FormBuilder);
  private motoService = inject(MotoService);

  constructor() {
    // Inicialización del formulario reactivo con COLOR_MOTO incluido
    this.motoForm = this.fb.group({
      marca_moto: ['', [Validators.required]],
      modelo_moto: ['', [Validators.required]],
      color_moto: ['', [Validators.required]], // Campo vital para tu DB
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

  verDetalleMoto(moto: any) {
    this.motoSeleccionada = moto;
  }

  // --- PERSISTENCIA (GUARDADO CON IMAGEN) ---
  guardarMoto(): void {
    if (this.motoForm.invalid) {
      this.motoForm.markAllAsTouched();
      return;
    }

    // Usamos FormData para enviar el archivo binario de la imagen
    const formData = new FormData();
    
    // Extraemos valores y aseguramos que la placa vaya en Mayúsculas
    const formValues = { ...this.motoForm.value };
    formValues.placa_moto = formValues.placa_moto.toUpperCase();

    // Mapeamos los campos del formulario al FormData para Django
    Object.keys(formValues).forEach(key => {
      formData.append(key, formValues[key]);
    });

    // Agregamos el archivo de la imagen con el nombre exacto del modelo: imagen_moto
    if (this.selectedFile) {
      formData.append('imagen_moto', this.selectedFile);
    }

    // Llamamos al servicio (asegúrate de que en el servicio se llame guardarMoto o registrarMoto)
    this.motoService.guardarMoto(formData).subscribe({
      next: (res) => {
        console.log('Moto guardada exitosamente:', res);
        alert('¡Moto registrada con éxito!');
        
        // Emitimos la placa al Dashboard para que actualice el botón lateral
        this.motoRegistrada.emit(res.placa_moto);
        
        // Limpiamos el formulario para un nuevo registro
        this.nuevaMoto(); 
      },
      error: (err) => {
        console.error('Error al guardar la moto', err);
        alert('Hubo un error al guardar los datos en el servidor.');
      }
    });
  }
}