import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  // Asegúrate de que esta URL coincida exactamente con tu endpoint de Django
  private apiUrl = 'http://localhost:8000/api/vendedor/productos/';

  constructor(private http: HttpClient) { }

  /**
   * 1. OBTENER TODO EL INVENTARIO
   */
  getProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * 2. REGISTRO INICIAL (POST)
   * Se usa para crear un producto desde cero. 
   * Recibe FormData para soportar la subida de la imagen inicial.
   */
  guardarProducto(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  /**
   * 3. EDICIÓN PARCIAL (PATCH) - CRUCIAL PARA INLINE EDITING
   * Se usa para actualizar campos rápidos (nombre, precio, stock) sin enviar imágenes.
   * Envía un JSON simple, lo que es mucho más ligero para el servidor.
   */
  patchProducto(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}${id}/`, data);
  }

  /**
   * 4. ACTUALIZACIÓN TOTAL O CON IMAGEN (PUT)
   * Se usa cuando necesitas cambiar la foto del producto o editar muchos campos a la vez.
   */
  actualizarProducto(id: number, data: any, nuevasImagenes?: File []): Observable<any> {
    const formData = new FormData();
    
    // Agregamos los campos de texto al FormData
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    // Si hay una nueva imagen, la adjuntamos
    if (nuevasImagenes && nuevasImagenes.length > 0) {
      nuevasImagenes.forEach(file => {
        formData.append('imagenes', file, file.name);
      });
      
    }
    return this.http.put(`${this.apiUrl}${id}/`, formData);
  }

  /**
   * 5. ELIMINAR PRODUCTO
   */
  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  // --- NUEVOS MÉTODOS PARA GESTIÓN DE GALERÍA ---

  /** * 5. ELIMINAR IMAGEN ESPECÍFICA 
   * Asumiendo que crearás un endpoint en Django para borrar de la tabla ProductoImagen
   */
  eliminarImagen(imgId: number): Observable<any> {
    // Apuntamos a un endpoint específico de imágenes, por ejemplo:
    // http://localhost:8000/api/vendedor/productos/eliminar-imagen/ID/
    return this.http.delete(`${this.apiUrl}eliminar-imagen/${imgId}/`);
  }

  /** * 6. ESTABLECER COMO PORTADA
   * Envía la instrucción para que esta imagen sea 'es_principal'
   */
  setPortada(productoId: number, imgId: number): Observable<any> {
    // Enviamos un PATCH al producto para decirle qué ID de imagen es la nueva portada
    return this.http.patch(`${this.apiUrl}${productoId}/set_portada/`, { imagen_id: imgId });
  }
}