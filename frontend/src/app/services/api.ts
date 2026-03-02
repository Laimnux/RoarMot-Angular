import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService{
  // Esta es la dirección de nuestro controlador en Django
  private url = 'http://localhost:8000/api/index/';

  constructor(private http: HttpClient) { }

  // Esta función va y trae los ddatos del Backend
  getMensaje(): Observable<any> {
    return this.http.get(this.url);
  }
}
