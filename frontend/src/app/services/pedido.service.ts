import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Importante: falta HttpHeaders
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private http = inject(HttpClient); 
  private apiUrl = `${environment.apiUrl}/users`;

  /**
   * 1. ACTUALIZAR PERFIL CON FOTO (FormData)
   * Usamos este cuando hay archivos binarios.
   */
  actualizarPerfilConFoto(formData: FormData): Observable<any> {
    const token = sessionStorage.getItem('auth_token'); 
    
    // IMPORTANTE: NO pongas 'Content-Type'. 
    // El navegador lo añade automáticamente con el 'boundary' necesario para archivos.
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(`${this.apiUrl}/perfil/`, formData, { headers });
  }

  /**
   * 2. OBTENER PERFIL
   */
  obtenerPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil/`, { headers: this.getHeaders() });
  }

  /**
   * 3. ACTUALIZAR PERFIL (JSON)
   * Úsalo para cambios de texto rápidos sin cambiar la foto.
   */
  actualizarPerfil(datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil/`, datos, { headers: this.getHeaders() });
  }

  /**
   * 4. GESTIÓN DE PEDIDOS
   */
  crearPedido(pedido: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/pedidos/`, pedido, { headers: this.getHeaders() });
  }

  obtenerPedidos(): Observable<any[]> {
  // Asegúrate de que termine en / para coincidir con el path de Django
    return this.http.get<any[]>(`${this.apiUrl}/pedidos/`, { headers: this.getHeaders() });
  }

  /**
   * 5. HELPER PARA HEADERS (JSON)
   * Unificamos el uso de sessionStorage y el tipado de HttpHeaders.
   */
  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('auth_token'); // Unificado con tu AuthService
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}