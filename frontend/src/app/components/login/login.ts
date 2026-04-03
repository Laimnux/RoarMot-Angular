import { Component, inject } from '@angular/core'; // Usamos inject para modernizar
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification.service'; // <-- Importamos tu nuevo servicio

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], 
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  // Inyectamos todo lo necesario
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notify = inject(NotificationService);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], 
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  //  Volvemos a home page
  irAHome() {
    this.router.navigate(['/']); // Navega a la página inicial
  }
  
  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Intentando login en Roarmot...', this.loginForm.value);

      this.authService.loginUsuario(this.loginForm.value).subscribe({
        next: (respuesta) => {
          // Nota: El AuthService ya guarda el token y el usuario en el localStorage por ti
          console.log('Login exitoso:', respuesta);
          
          // Notificación personalizada con el nombre que viene de Django
          this.notify.show(`¡Bienvenido de nuevo, ${respuesta.usuario.nombre}!`, 'success');
          
          // Redirección al Dashboard
          this.router.navigate(['/dashboard']); 
        },
        error: (err) => {
          console.error('Error en el login:', err);
          // Notificación de error elegante
          this.notify.show('Credenciales incorrectas. Verifica tu correo y contraseña.', 'error');
        }
      });
    } else {
      this.notify.show('Por favor, rellena todos los campos correctamente.', 'info');
    }
  }

}