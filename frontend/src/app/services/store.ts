import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.apiUrl;
    this.myApiUrl = '/api/vendedor/store/';
  }

  // Obtener todos los productos para la tienda
  getStoreProducts(search?: string): Observable<Producto[]> {
    let params = new HttpParams();
    if (search) {
      params = params.append('search', search);
    }
    return this.http.get<Producto[]>(`${this.myAppUrl}${this.myApiUrl}`, { params });
  }

  // AGREGA ESTO AQUÍ PARA QUITAR EL ERROR EN PRODUCT-DETAIL.TS
  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.myAppUrl}${this.myApiUrl}${id}/`);
  }
}