import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Para el router-outlet
// IMPORTA TUS COMPONENTES AQUÍ
import { HeaderComponent } from '../../components/header/header'; 
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  // AÑÁDELOS A LA LISTA DE IMPORTS
  imports: [
    CommonModule, 
    RouterModule, 
    HeaderComponent, 
    Footer
  ],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css'
})
export class PublicLayoutComponent {}