import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Extraemos el token de sessionStorage (Clave para el aislamiento por pestaña)
  const token = sessionStorage.getItem('auth_token');

  // 2. Definimos las rutas que NO necesitan Token (Públicas)
  const publicUrls = [
    '/api/users/login/', 
    '/api/users/register/', 
    '/api/users/verificar-email/',
    '/api/index/'
  ];

  // 3. Verificamos si la petición actual es a una ruta pública
  const isPublic = publicUrls.some(url => req.url.includes(url));

  // 4. LÓGICA DE DECISIÓN
  // Solo inyectamos el token si existe Y la ruta NO es pública
  if (token && !isPublic) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log(`[Interceptor] Token inyectado para: ${req.url}`);
    return next(cloned);
  }

  // 5. Si es pública o no hay token, la petición sigue normal
  if (isPublic) {
    console.log(`[Interceptor] Ruta pública detectada: ${req.url}`);
  }
  
  return next(req);
};