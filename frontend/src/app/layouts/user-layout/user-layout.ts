import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
// 1. Importa el nuevo Header del Dashboard
import { HeaderDashboardComponent } from './header-dashboard/header-dashboard';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  // 2. Agrégalo aquí junto a RouterModule
  imports: [
    CommonModule, 
    RouterModule, 
    HeaderDashboardComponent
  ], 
  templateUrl: './user-layout.html',
  styleUrls: ['./user-layout.css']
})
export class UserLayoutComponent {}