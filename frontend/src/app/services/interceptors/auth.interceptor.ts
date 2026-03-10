import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Definimos las rutas que DEBEN ser públicas (sin token)
  const publicUrls = ['/api/index/', '/api/users/login/', '/api/users/registro/'];

  // 2. Si la petición va a una ruta pública, la dejamos pasar sin tocarla
  const isPublic = publicUrls.some(url => req.url.includes(url));
  
  if (isPublic) {
    console.log('Interceptor: Ruta pública detectada, saltando token');
    return next(req);
  }

  // 3. Extraemos el token (Asegúrate de que el nombre coincida con tu AuthService)
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

  // 4. Si el token existe y la ruta es privada, lo inyectamos
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Interceptor: Token JWT añadido a la petición privada');
    return next(cloned);
  }

  // 5. Si no hay token y la ruta era privada, sigue su curso (Django dará el 401 luego)
  return next(req);
};