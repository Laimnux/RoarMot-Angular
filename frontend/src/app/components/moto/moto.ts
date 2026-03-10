import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MotoService } from '../../services/moto.service';

@Component({
  selector: 'app-moto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './moto.html',
  styleUrls: ['./moto.css']
})
export class MotoComponent implements OnInit {
  // --- PROPIEDADES ---
  motoForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  
  // Controla si mostramos el formulario de registro (null) o el detalle de una moto
  motoSeleccionada: any = null; 

  private fb = inject(FormBuilder);
  private motoService = inject(MotoService);

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

  ngOnInit(): void {
    // Aquí podrías cargar la lista inicial de motos si fuera necesario
  }

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
  
  // Esta función se llama al presionar el botón "+" en tu selector lateral
  nuevaMoto() {
    this.motoSeleccionada = null;
    this.motoForm.reset({
      kilometraje: 0 // Valor por defecto al resetear
    });
    this.imagePreview = null;
    this.selectedFile = null;
    console.log("Cambiando a modo registro...");
  }

  // Esta función se llamaría cuando el usuario hace clic en una moto ya registrada
  verDetalleMoto(moto: any) {
    this.motoSeleccionada = moto;
    // Aquí no reseteamos el form, simplemente mostramos la data en la vista de detalle
  }

  // --- PERSISTENCIA ---
  guardarMoto(): void {
    if (this.motoForm.invalid) {
      this.motoForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    
    // Extraemos valores y aseguramos que la placa vaya en Mayúsculas
    const formValues = { ...this.motoForm.value };
    formValues.placa_moto = formValues.placa_moto.toUpperCase();

    // Mapear campos al FormData
    Object.keys(formValues).forEach(key => {
      formData.append(key, formValues[key]);
    });

    if (this.selectedFile) {
      formData.append('imagen_moto', this.selectedFile);
    }

    this.motoService.guardarMoto(formData).subscribe({
      next: (res) => {
        alert('¡Moto registrada con éxito!');
        this.nuevaMoto(); // Limpia y vuelve al estado inicial
      },
      error: (err) => {
        console.error('Error al guardar la moto', err);
        alert('Hubo un error al guardar los datos.');
      }
    });
  }
}