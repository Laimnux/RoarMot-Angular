import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './services/interceptors/auth.interceptor'; // Ajusta la ruta si es necesario


export const appConfig: ApplicationConfig = {
  providers: [
    // Mantenemos la detección de cambios optimizada
    provideZoneChangeDetection({ eventCoalescing: true }), 
    
    // Configuramos las rutas
    provideRouter(routes),
    
    // Configuramos el Cliente HTTP con el "Peaje" de Seguridad (JWT)
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};