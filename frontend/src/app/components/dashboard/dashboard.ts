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
  @ViewChild(MotoComponent) motoComp!: MotoComponent;
  motos: any[] = [];
  private motoService = inject(MotoService);

  ngOnInit(): void {
    this.obtenerMotos(); // Llamamos a la función única
  }

  // Única función para traer datos de la API
  obtenerMotos() {
    this.motoService.getMotos().subscribe({
      next: (data) => {
        this.motos = data;
        console.log('Motos sincronizadas en Dashboard:', this.motos);
      },
      error: (err) => console.error('Error en la comunicación con la API:', err)
    });
  }

  onBtnMasClick() {
    if (this.motoComp) this.motoComp.nuevaMoto();
  }

  seleccionarMoto(moto: any) {
    if (this.motoComp) {
      this.motoComp.isEditing = false;
      this.motoComp.verDetalleMoto(moto);
    }
  }

  onMotoRegistrada(moto: any) {
    console.log('Moto procesada exitosamente:', moto);
    this.obtenerMotos(); // Refresca los botones de la izquierda
    // El hijo (motoComp) ya se encarga de mostrar el detalle, así que aquí solo refrescamos.
  }
}