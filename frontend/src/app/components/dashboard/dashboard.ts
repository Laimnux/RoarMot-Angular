import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotoComponent } from '../moto/moto';
import { MotoService } from '../../services/moto.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MotoComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  // 1. Referencias y Propiedades
  @ViewChild(MotoComponent) motoComp!: MotoComponent;
  
  motos: any[] = []; // Array para almacenar las motos de la DB (incluida la RTZ-34F)

  // 2. Inyección de dependencias (forma moderna con inject)
  private motoService = inject(MotoService);

  // 3. Al iniciar el componente, cargamos las motos
  ngOnInit(): void {
    this.cargarMotos();
  }

  // 4. Función para traer motos desde el Backend (Django)
  cargarMotos() {
    this.motoService.getMotos().subscribe({
      next: (data) => {
        this.motos = data;
        console.log('Motos cargadas en Dashboard:', this.motos);
      },
      error: (err) => {
        console.error('Error al cargar motos desde el servidor', err);
      }
    });
  }

  // 5. Lógica del botón "+" (Modo Registro)
  onBtnMasClick() {
    console.log('Botón "+" presionado: Limpiando formulario para nueva moto');
    if (this.motoComp) {
      this.motoComp.nuevaMoto();
    } else {
      console.warn('No se encontró la referencia a MotoComponent');
    }
  }

  // 6. Recibir evento cuando se registre una moto con éxito
  // (Para que el sidebar se actualice solo sin recargar la página)
  onMotoRegistrada(placa: string) {
    console.log('Nueva moto detectada:', placa);
    this.cargarMotos(); // Volvemos a pedir la lista a Django para que aparezca el nuevo botón
  }

  // 7. Seleccionar una moto para ver su detalle
  seleccionarMoto(moto: any) {
    if (this.motoComp) {
      this.motoComp.verDetalleMoto(moto);
    }
  }
}