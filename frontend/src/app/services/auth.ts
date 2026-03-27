import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  // Centralizamos la URL para no repetir "api/users" en cada método
  private baseUrl = 'http://localhost:8000/api/users';

  private usuarioSubject = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem('user_session') || 'null'));
  usuarioActual$ = this.usuarioSubject.asObservable();

  constructor() { }

  // NUEVO: Método para verificar disponibilidad antes de avanzar en el registro
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
          this.guardarSesion(response.usuario, response.token);
        }
      })
    );
  }

  private guardarSesion(usuario: any, token: string) {
    // CAMBIO: Todo a sessionStorage
    sessionStorage.setItem('user_session', JSON.stringify(usuario));
    sessionStorage.setItem('auth_token', token); 
    sessionStorage.setItem('isLoggedIn', 'true');
    this.usuarioSubject.next(usuario); 
  }

  logout() {
    // CAMBIO: Limpiar sessionStorage
    sessionStorage.removeItem('user_session');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('isLoggedIn');
    this.usuarioSubject.next(null);
    
    // Tip: Si quieres ser radical para evitar rastros:
    // sessionStorage.clear();
    window.location.href = '/login'; 
  }

  // --- MÉTODO A AGREGAR ---
  isLoggedIn(): boolean {
    // Retorna true si existe el token o la bandera de login en sessionStorage
    return !!sessionStorage.getItem('auth_token') || sessionStorage.getItem('isLoggedIn') === 'true';
  }
  // Dentro de tu AuthService
  get usuarioActualValue() {
    return this.usuarioSubject.value;
  }

}