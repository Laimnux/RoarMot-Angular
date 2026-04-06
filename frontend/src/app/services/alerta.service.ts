// frontend/src/app/services/alerta.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  // Reemplazamos la IP local por la variable del environment
  private apiUrl = `${environment.apiUrl}/api/alertas/`;

  constructor(private http: HttpClient) { }

  // Obtenemos las alertas de una moto específica
  getAlertasByMoto(motoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?moto_id=${motoId}`);
  }
}