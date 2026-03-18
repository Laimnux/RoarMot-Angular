import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:8000/api/vendedor/productos/';

  constructor(private http: HttpClient) { }

  // 1. Obtener todos los productos del vendedor logueado
  getProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // 2. Obtener un solo producto por ID
  getProducto(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${id}/`);
  }

  // 3. Guardar Producto (Recibe el FormData completo del componente)
  guardarProducto(formData: FormData): Observable<any> {
    // Cuando enviamos FormData, Angular/HttpClient configura 
    // automáticamente el 'Content-Type' como 'multipart/form-data'
    return this.http.post(this.apiUrl, formData);
  }

  // 4. Actualizar Producto
  actualizarProducto(id: number, data: any, imagen?: File): Observable<any> {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    if (imagen) {
      formData.append('imagen', imagen, imagen.name);
    }

    return this.http.put(`${this.apiUrl}${id}/`, formData);
  }

  // 5. Eliminar Producto
  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}