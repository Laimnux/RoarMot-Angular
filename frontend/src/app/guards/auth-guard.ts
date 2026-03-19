import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  const userSessionStr = sessionStorage.getItem('user_session');
  
  if (isLoggedIn && userSessionStr) {
    const usuario = JSON.parse(userSessionStr);
    
    // 1. Detectamos si intenta entrar a cualquier zona de PROVEEDOR
    const esRutaProveedor = state.url.includes('/vendedor') || 
                            state.url.includes('/provider-panel');

    // 2. Verificamos el ROL (Según tu Django: 1 = Proveedor, 2 = Motero)
    if (esRutaProveedor && usuario.rol_id !== 1) {
      console.warn('ACCESO DENEGADO: Se requiere rol de Proveedor (Rol 1)');
      // Si es un motero intentando entrar a panel de ventas, lo mandamos a su dashboard
      router.navigate(['/app/dashboard']); 
      return false;
    }

    // Si es Rol 1 o está en una ruta pública/permitida, adelante
    return true; 
    
  } else {
    console.warn('Acceso denegado: Sesión inexistente o expirada.');
    router.navigate(['/login']);
    return false;
  }
};