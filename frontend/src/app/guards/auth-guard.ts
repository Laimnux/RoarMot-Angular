import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // CAMBIO: Verificar en sessionStorage
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  const hasUserSession = sessionStorage.getItem('user_session') !== null;

  if (isLoggedIn && hasUserSession) {
    return true; 
  } else {
    console.warn('Acceso denegado: Sesión inválida o inexistente.');
    router.navigate(['/login']);
    return false;
  }
};