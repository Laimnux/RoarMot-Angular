import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router); // Inyectamos el router para control de navegación
  const token = sessionStorage.getItem('auth_token');

  const publicUrls = [
    '/api/users/login/', 
    '/api/users/register/', 
    '/api/users/verificar-email/',
    '/api/index/',
    '/api/vendedor/store/'
  ];

  const isPublic = publicUrls.some(url => req.url.includes(url));

  let clonedRequest = req;

  // 1. Inyección del Token
  if (token && !isPublic) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log(`[Roarmot-Auth] Token inyectado: ${req.url}`);
  }

  // 2. Manejo de la Respuesta y Errores Críticos
  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el servidor responde 401 (No autorizado) o 403 (Prohibido)
      if (error.status === 401 || error.status === 403) {
        console.error('[Roarmot-Auth] Sesión inválida o expirada. Protocolo de re-autenticación.');
        
        // OJO: Solo redirigir si NO estamos ya en el login para evitar bucles
        if (!router.url.includes('login')) {
           // Opcional: sessionStorage.removeItem('auth_token');
           // router.navigate(['/login']); 
        }
      }
      
      // Retornamos el error para que el componente (confirmarPedido) lo maneje
      return throwError(() => error);
    })
  );
};