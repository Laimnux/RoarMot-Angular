import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment'; // Importas tu clave

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  private isLoaded = false;

  load(): Promise<void> {
    if (this.isLoaded) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      // Usamos la clave directamente desde el environment que me mostraste
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places,directions`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }
}