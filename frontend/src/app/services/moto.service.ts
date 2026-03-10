import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MotoService {
  private apiUrl = 'http://127.0.0.1:8000/api/motos/';
  private http = inject(HttpClient);

  guardarMoto(formData: FormData): Observable<any> {
    // 1. Recuperamos el token que guardamos al hacer Login
    const token = localStorage.getItem('token'); 

    // 2. Creamos las cabeceras con la "llave"
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // 3. Enviamos la petición con la imagen y el token
    return this.http.post(this.apiUrl, formData, { headers });
  }

  getMotos(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any[]>(this.apiUrl, { headers });
  }
}