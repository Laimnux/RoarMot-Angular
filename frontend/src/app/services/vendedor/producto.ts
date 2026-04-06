import { Injectable, inject } from '@angular/core'; // Usando inject para consistencia
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  
  // URL base para el catálogo y gestión
  private apiUrl = 'http://localhost:8000/api/vendedor/productos/';

  constructor() { }

  /**
   * 1. OBTENER TODO EL INVENTARIO
   */
  getProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * --- MÉTODOS CRÍTICOS PARA EL DETALLE DEL PRODUCTO ---
   */

  /**
   * OBTENER UN PRODUCTO POR ID
   * Este es el que usa ProductDetailComponent para cargar la ficha técnica
   */
  obtenerProductoPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${id}/`);
  }

  /**
   * OBTENER PRODUCTOS POR CATEGORÍA
   * Se usa para la sección de "COMPLEMENTOS TÉCNICOS" (Relacionados)
   */
  obtenerProductosPorCategoria(categoriaId: number): Observable<any[]> {
    // Asumiendo que tu backend de Django soporta filtrado por query params
    return this.http.get<any[]>(`${this.apiUrl}?categoria=${categoriaId}`);
  }

  /**
   * --- GESTIÓN DE ESCRITURA (POST, PATCH, PUT, DELETE) ---
   */

  guardarProducto(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  patchProducto(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}${id}/`, data);
  }

  actualizarProducto(id: number, data: any, nuevasImagenes?: File[]): Observable<any> {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    if (nuevasImagenes && nuevasImagenes.length > 0) {
      nuevasImagenes.forEach(file => {
        formData.append('imagenes', file, file.name);
      });
    }
    return this.http.put(`${this.apiUrl}${id}/`, formData);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  /**
   * --- GESTIÓN DE GALERÍA Y PORTADA ---
   */

  eliminarImagen(imgId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}eliminar-imagen/${imgId}/`);
  }

  setPortada(productoId: number, imgId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}${productoId}/set_portada/`, { imagen_id: imgId });
  }

  /**
   * --- PROMOCIONES ---
   */
  establecerPromocion(id: number, datos: {en_oferta: boolean, porcentaje_descuento: number}) {
    const urlLimpia = this.apiUrl.replace(/\/+$/, '');
    return this.http.post(`${urlLimpia}/${id}/establecer_promocion/`, datos);
  }
}