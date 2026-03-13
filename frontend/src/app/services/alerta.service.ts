// frontend/src/app/services/alerta.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  private apiUrl = 'http://127.0.0.1:8000/api/alertas/';

  constructor(private http: HttpClient) { }

  // Obtenemos las alertas de una moto específica
  getAlertasByMoto(motoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?moto_id=${motoId}`);
  }
}