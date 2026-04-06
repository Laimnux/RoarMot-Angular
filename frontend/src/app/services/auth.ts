import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  // 2. CORRECCIÓN: Usar la variable del environment para la API y las imágenes
  private baseUrl = `${environment.apiUrl}/api/users`;
  private serverUrl = environment.apiUrl;

  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.obtenerSesionInicial());
  usuarioActual$ = this.usuarioSubject.asObservable();

  constructor() { }

  private transformarDatos(u: any): Usuario {
    const actual = this.usuarioSubject.value;
    
    // --- LÓGICA PARA LA IMAGEN ---
    let urlImagen = u.url_imagen_perfil || actual?.url_imagen_perfil;

    // Si la URL viene del backend como "/media/..." (relativa)
    // la convertimos en absoluta: "http://localhost:8000/media/..."
    if (urlImagen && !urlImagen.startsWith('http') && !urlImagen.startsWith('data:')) {
      urlImagen = `${this.serverUrl}${urlImagen}`;
    }

    return {
      id: u.id || actual?.id,
      nombre: u.nombre || actual?.nombre || 'Motero',
      apellido: u.apellido || actual?.apellido || '',
      email: u.email || actual?.email,
      tipo_documento: u.tipo_documento || actual?.tipo_documento,
      numero_usuario: u.numero_usuario || actual?.numero_usuario,
      telefono: u.telefono || actual?.telefono,
      rol_id: u.rol_id || actual?.rol_id,
      nombre_empresa: u.nombre_empresa || actual?.nombre_empresa,
      url_imagen_perfil: urlImagen, // <--- Usamos la URL procesada
      
      direccion: u.direccion !== undefined ? u.direccion : actual?.direccion, 
      ciudad: u.ciudad !== undefined ? u.ciudad : actual?.ciudad,
      departamento: u.departamento !== undefined ? u.departamento : actual?.departamento,
      codigo_postal: u.codigo_postal !== undefined ? u.codigo_postal : actual?.codigo_postal,
      notas: u.notas !== undefined ? u.notas : actual?.notas
    };
  }

  private obtenerSesionInicial(): Usuario | null {
    const data = sessionStorage.getItem('user_session');
    return data ? JSON.parse(data) : null;
  }

  verificarEmail(email: string): Observable<{ disponible: boolean }> {
    return this.http.get<{ disponible: boolean }>(`${this.baseUrl}/verificar-email/${email}/`);
  }

  registrarUsuario(datos: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register/`, datos);
  }

  loginUsuario(credenciales: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login/`, credenciales).pipe(
      tap((response: any) => {
        if (response && response.usuario && response.token) {
          const usuarioLimpio = this.transformarDatos(response.usuario);
          this.guardarSesion(usuarioLimpio, response.token);
        }
      })
    );
  }

  actualizarEstadoUsuario(datosRaw: any) {
    const usuarioLimpio = this.transformarDatos(datosRaw);
    sessionStorage.setItem('user_session', JSON.stringify(usuarioLimpio));
    this.usuarioSubject.next(usuarioLimpio);
  }

  private guardarSesion(usuario: Usuario, token: string) {
    sessionStorage.setItem('user_session', JSON.stringify(usuario));
    sessionStorage.setItem('auth_token', token); 
    sessionStorage.setItem('isLoggedIn', 'true');
    this.usuarioSubject.next(usuario); 
  }

  logout() {
    sessionStorage.removeItem('user_session');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('isLoggedIn');
    this.usuarioSubject.next(null);
    window.location.href = '/login'; 
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('auth_token') || sessionStorage.getItem('isLoggedIn') === 'true';
  }

  get usuarioActualValue() {
    return this.usuarioSubject.value;
  }
}