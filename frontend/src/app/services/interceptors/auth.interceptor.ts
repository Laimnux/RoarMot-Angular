import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Extraemos el token usando la clave 'auth_token' (la que definiste en AuthService)
  const token = localStorage.getItem('auth_token');

  // 2. Definimos las rutas que son estrictamente públicas
  // Agregamos 'verificar-email' que es nueva en tu AuthService
  const publicUrls = [
    '/api/users/login/', 
    '/api/users/register/', 
    '/api/users/verificar-email/',
    '/api/index/'
  ];

  // 3. Verificamos si la URL de la petición actual coincide con alguna pública
  const isPublic = publicUrls.some(url => req.url.includes(url));
  
  // 4. LÓGICA DE DECISIÓN
  if (token && !isPublic) {
    // Si hay token y la ruta es PRIVADA (como /api/motos/), lo inyectamos
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Interceptor: Token JWT añadido a la petición privada:', req.url);
    return next(cloned);
  }

  // 5. Si es pública o no hay token, la petición sigue su curso normal
  if (isPublic) {
    console.log('Interceptor: Ruta pública detectada, enviando sin token:', req.url);
  }
  
  return next(req);
};