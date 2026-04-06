// La misión de este servicio será consultar el backend y obtener la lista de despachos pendientes.
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http = inject(HttpClient);
  // Asignamos la ruta que crearemos en Django
  private apiUrl = `${environment.apiUrl}/api/vendedor/ventas/`;

  /**
   * OBTENER DESPACHOS PENDIENTES
   * Este es el "cable" que conecta con el Dashboard
   */
  obtenerDespachosPendientes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { 
      headers: this.getHeaders() 
    });
  }

  // Helper para headers con el Token de autenticación
  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}