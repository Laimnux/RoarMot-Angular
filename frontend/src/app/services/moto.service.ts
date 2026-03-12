import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MotoService {
  private apiUrl = 'http://127.0.0.1:8000/api/motos/';
  private http = inject(HttpClient);

  // Función privada para no repetir la lógica del token en cada método
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  guardarMoto(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, { headers: this.getHeaders() });
  }

  getMotos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // --- NUEVO MÉTODO PARA ACTUALIZAR ---
  actualizarMoto(id: number, formData: FormData): Observable<any> {
    // Django REST Framework suele esperar PUT o PATCH para actualizar. 
    // Usamos el ID en la URL: http://127.0.0.1:8000/api/motos/5/
    return this.http.put(`${this.apiUrl}${id}/`, formData, { headers: this.getHeaders() });
  }

  // Eliminacion Moto
  eliminarMoto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`, { headers: this.getHeaders() });
  }
}