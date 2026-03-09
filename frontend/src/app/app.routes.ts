import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/auth/register/register';
import { Paso1Component } from './components/auth/register/paso1/paso1';
import { Paso2Component } from './components/auth/register/paso2/paso2';
import { Paso3Component } from './components/auth/register/paso3/paso3';
import { authGuard } from './guards/auth-guard'; 
import { Dashboard } from './components/dashboard/dashboard'; 

// Layouts Profesionales
import { UserLayoutComponent } from './layouts/user-layout/user-layout';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout';

export const routes: Routes = [
    // --- GRUPO 1: PÚBLICO (Home con Header/Footer estándar) ---
    {
      path: '',
      component: PublicLayoutComponent,
      children: [
        { path: '', component: Home } 
      ]
    },

    // --- GRUPO 2: AUTH (Sin distractores visuales) ---
    { path: 'login', component: LoginComponent },
    { 
      path: 'registro', 
      component: RegisterComponent, 
      children: [
        { path: 'paso1', component: Paso1Component },
        { path: 'paso2', component: Paso2Component },
        { path: 'paso3', component: Paso3Component },
        { path: '', redirectTo: 'paso1', pathMatch: 'full' }
      ]
    },

    // --- GRUPO 3: PRIVADO (Layout de Ingeniería Roarmot) ---
    { 
      path: 'dashboard', 
      component: UserLayoutComponent, 
      canActivate: [authGuard],        // Protección activa sincronizada con Django
      children: [
        { 
          path: '', 
          component: Dashboard         // Vista principal del Rider
        },
        // En el futuro, rutas como 'motos' o 'cda' irán aquí
      ]
    },

    // COMODÍN: Redirección de seguridad
    { path: '**', redirectTo: '', pathMatch: 'full' }
];