import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // Importamos Router y RouterLink
import { AuthService } from '../../services/auth'; // Ajusta la ruta a tu servicio

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], 
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, // Inyectamos el servicio
    private router: Router             // Para redireccionar tras el login
  ) {
    this.loginForm = this.fb.group({
      // Usamos 'email' para que coincida con lo que espera Django: request.data.get('email')
      email: ['', [Validators.required, Validators.email]], 
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
  if (this.loginForm.valid) {
    console.log('Intentando login...', this.loginForm.value);

    this.authService.loginUsuario(this.loginForm.value).subscribe({
      next: (respuesta) => {
        console.log('Login exitoso:', respuesta);
        
        // --- MEJORA: Persistencia de sesión ---
        // Guardamos los datos del usuario como un string JSON
        localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
        
        // También es buena idea guardar una bandera de autenticación
        localStorage.setItem('isLoggedIn', 'true');

        alert(`¡Bienvenido de nuevo, ${respuesta.usuario.nombre}!`);
        
        // Redirección al Dashboard de Roarmot
        this.router.navigate(['/dashboard']); 
      },
      error: (err) => {
        console.error('Error en el login:', err);
        alert('Credenciales incorrectas. Intenta de nuevo.');
      }
    });
  }
}
}