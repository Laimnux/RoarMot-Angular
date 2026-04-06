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
import { Sos } from './components/sos/sos/sos'; 

// --- NUEVA IMPORTACIÓN DE LA STORE ---
import { StoreComponent } from './components/store/store'; 

// Layouts Profesionales
import { UserLayoutComponent } from './layouts/user-layout/user-layout';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout';

// Componentes del Proveedor
import { ProviderPanelComponent } from './components/provider-panel/provider-panel';
import { DashboardComponent as ProviderDashboard } from './components/provider-panel/dashboard/dashboard';
import { InventarioComponent } from './components/provider-panel/inventario/inventario';
import { FormularioProductoComponent } from './components/provider-panel/formulario-producto/formulario-producto';
import { ProductDetailComponent } from './components/store/product-detail/product-detail';
import { ProfileComponent } from './components/profile/profile'; 
import { CartComponent } from './components/cart/cart'; 

import { CheckoutComponent } from './components/checkout/checkout'; // <--- IMPORTAR AQUÍ
import { PaymentMethodComponent } from './components/payment-method/payment-method';

export const routes: Routes = [
    // --- GRUPO 1: PÚBLICO (Aquí agregamos la Store) ---
    {
      path: '',
      component: PublicLayoutComponent,
      children: [
        { path: '', component: Home },
        { path: 'tienda', component: StoreComponent }, // <-- RUTA AGREGADA
        // AGREGAR AQUÍ (Opcional si quieres detalle público):
        { path: 'tienda/producto/:id', component: ProductDetailComponent }
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

    // --- GRUPO 3: PRIVADO MOTERO ---
    { 
      path: 'app', 
      component: UserLayoutComponent, 
      canActivate: [authGuard], 
      children: [
        { path: 'dashboard', component: Dashboard },
        { path: 'perfil', component: ProfileComponent},
        { path: 'mantenimientos', component: Mantenimientos },
        { path: 'sos', component: Sos }, 
        { path: 'store', component: StoreComponent },
        { path: 'store/producto/:id', component: ProductDetailComponent },
        { path: 'cart', component: CartComponent},
        { path: 'payment', component: PaymentMethodComponent }, // <-- NUEVA RUTA de pago
        { path: 'checkout', component: CheckoutComponent }, // <--- RUTA AGREGADA
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
      ]
    },

    // --- REDIRECCIÓN INTELIGENTE ---
    // Si alguien escribe /store a secas, lo mandamos a la versión pública
    { path: 'store', redirectTo: 'tienda', pathMatch: 'full' },

    // --- GRUPO 4: PANEL PROVEEDOR ---
    {
      path: 'vendedor',
      component: ProviderPanelComponent,
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
    { path: 'store', redirectTo: 'store', pathMatch: 'full' }, 
    { path: 'sos', redirectTo: 'app/sos', pathMatch: 'full' },
    { path: 'dashboard', redirectTo: 'app/dashboard', pathMatch: 'full' },
    { path: 'mantenimientos', redirectTo: 'app/mantenimientos', pathMatch: 'full' },
    { path: 'inventario', redirectTo: 'vendedor/inventario', pathMatch: 'full' },
    { path: 'cart', redirectTo: 'app/cart', pathMatch: 'full' },
    { path: 'carrito', redirectTo: 'app/cart', pathMatch: 'full' },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];