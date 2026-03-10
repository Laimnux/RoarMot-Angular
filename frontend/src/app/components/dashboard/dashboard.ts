
import { Component, ViewChild } from '@angular/core'; // Añadimos ViewChild
import { MotoComponent } from '../moto/moto';
import { CommonModule } from '@angular/common';
import { MotoService } from '../../services/moto.service';
// 1. Importa los archivos de los nuevos componentes



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
export class Dashboard {
  // 1. Creamos la referencia al componente de la moto
  // El '!' le dice a TS que estamos seguros de que existirá
  @ViewChild(MotoComponent) motoComp!: MotoComponent;

  // 2. La función debe estar DENTRO de la clase
  onBtnMasClick() {
    console.log('Botón "+" presionado en Dashboard');
    
    if (this.motoComp) {
      this.motoComp.nuevaMoto();
    } else {
      console.warn('No se encontró la referencia a MotoComponent');
    }
  }
}