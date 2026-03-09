import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8000/api/users';

  private usuarioSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('user_session') || 'null'));
  usuarioActual$ = this.usuarioSubject.asObservable();

  constructor() { }

  registrarUsuario(datos: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register/`, datos);
  }

  loginUsuario(credenciales: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login/`, credenciales).pipe(
      tap((response: any) => {
        // Según tu consola, Django responde con { mensaje: '...', usuario: {...} }
        if (response && response.usuario && response.token) {
          // Guardamos SOLO el objeto usuario interno
          this.guardarSesion(response.usuario, response.token);
        }
      })
    );
  }

  private guardarSesion(usuario: any, token: string) {
  localStorage.setItem('user_session', JSON.stringify(usuario));
  localStorage.setItem('auth_token', token); // <-- Guardamos la llave
  localStorage.setItem('isLoggedIn', 'true');
  this.usuarioSubject.next(usuario); 
}

  logout() {
    localStorage.removeItem('user_session');
    localStorage.removeItem('auth_token'); // ¡No olvides borrar el token al salir!
    localStorage.removeItem('isLoggedIn');
    this.usuarioSubject.next(null);
  }
}