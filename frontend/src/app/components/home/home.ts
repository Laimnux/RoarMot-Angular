import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // 1. Importamos la herramienta

@Component({
  selector: 'app-home',
  standalone: true, // Asegúrate de que tenga esto
  imports: [RouterLink], // 2. La agregamos aquí para que el HTML la reconozca
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  // Aquí no necesitas definir la ruta, ya que el HTML la maneja con routerLink="/registro/paso1"
}