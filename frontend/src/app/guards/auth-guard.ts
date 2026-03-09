import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Verificamos tanto el flag de login como la existencia de los datos del usuario
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const hasUserSession = localStorage.getItem('user_session') !== null;

  if (isLoggedIn && hasUserSession) {
    return true; // Acceso concedido
  } else {
    // Si la sesión es inválida o está vacía, limpiamos y redirigimos
    console.warn('Acceso denegado: Sesión inválida o inexistente.');
    router.navigate(['/login']);
    return false;
  }
};