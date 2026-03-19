import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/auth/register/register';
import { Paso1Component } from './components/auth/register/paso1/paso1';
import { Paso2Component } from './components/auth/register/paso2/paso2';
import { Paso3Component } from './components/auth/register/paso3/paso3';
import { authGuard } from './guards/auth-guard'; 
import { Dashboard } from './components/dashboard/dashboard'; 
import { Mantenimientos } from './components/mantenimientos/mantenimientos';

// Layouts Profesionales
import { UserLayoutComponent } from './layouts/user-layout/user-layout';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout';

// Componentes del Proveedor (Asegúrate de que las rutas de importación sean correctas)
import { ProviderPanelComponent } from './components/provider-panel/provider-panel';
import { Dashboard as ProviderDashboard } from './components/provider-panel/dashboard/dashboard';
import { InventarioComponent } from './components/provider-panel/inventario/inventario';
import { FormularioProductoComponent } from './components/provider-panel/formulario-producto/formulario-producto';

export const routes: Routes = [
    // --- GRUPO 1: PÚBLICO ---
    {
      path: '',
      component: PublicLayoutComponent,
      children: [
        { path: '', component: Home } 
      ]
    },

    // --- GRUPO 2: AUTH ---
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

    // --- GRUPO 3: PRIVADO MOTERO (Layout de Ingeniería Roarmot) ---
    { 
      path: 'app', 
      component: UserLayoutComponent, 
      canActivate: [authGuard], 
      children: [
        { path: 'dashboard', component: Dashboard },
        { path: 'mantenimientos', component: Mantenimientos },
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
      ]
    },

    // --- GRUPO 4: PANEL PROVEEDOR (Gestión de Inventario) ---
    {
      path: 'vendedor',
      component: ProviderPanelComponent, // Este actúa como su propio Layout
      canActivate: [authGuard], 
      children: [
        { path: 'dashboard', component: ProviderDashboard },
        { path: 'inventario', component: InventarioComponent },
        { path: 'nuevo-producto', component: FormularioProductoComponent },
        { path: 'editar-producto/:id', component: FormularioProductoComponent },
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
      ]
    },

    // Redirecciones globales
    { path: 'dashboard', redirectTo: 'app/dashboard', pathMatch: 'full' },
    { path: 'mantenimientos', redirectTo: 'app/mantenimientos', pathMatch: 'full' },
    { path: 'inventario', redirectTo: 'vendedor/inventario', pathMatch: 'full' },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];