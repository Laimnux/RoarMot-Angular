import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Extraemos el token que guardamos en el AuthService
  const token = localStorage.getItem('auth_token');

  // 2. Si el token existe, inyectamos la cabecera de seguridad
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        // Formato estándar para SimpleJWT en Django
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Interceptor: Token JWT añadido a la petición');
    return next(cloned);
  }

  // 3. Si no hay token (ej. durante el login), la petición sigue su curso
  return next(req);
};