import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService{
  // Reemplazamos el texto fijo por la variable del environment
  private url = `${environment.apiUrl}/api/index/`;

  constructor(private http: HttpClient) { }

  // Esta función va y trae los ddatos del Backend
  getMensaje(): Observable<any> {
    return this.http.get(this.url);
  }
}
