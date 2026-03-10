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

  private usuarioSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('user_session') || 'null'));
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
    localStorage.setItem('user_session', JSON.stringify(usuario));
    localStorage.setItem('auth_token', token); 
    localStorage.setItem('isLoggedIn', 'true');
    this.usuarioSubject.next(usuario); 
  }

  logout() {
    localStorage.removeItem('user_session');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('isLoggedIn');
    this.usuarioSubject.next(null);
  }
}