import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// IMPORTANTE: Agregamos Router a las importaciones
import { RouterOutlet, Router } from '@angular/router'; 
import { Paso1Component } from './paso1/paso1';
import { Paso2Component } from './paso2/paso2';
import { Paso3Component } from './paso3/paso3';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  // Agregamos CommonModule para las directivas como ngIf/ngClass
  imports: [CommonModule, RouterOutlet], 
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  // Las propiedades deben ir antes del constructor por buena práctica
  imagenDinamica: string = 'assets/image/auth/motoAtar.webp';

  // OBJETO RECOLECTOR: Fuente única de verdad
  datosRegistro = {
    rol: '',
    email: '',
    codigoVerificacion: '',
    nombre: '',
    apellido: '',
    telefono: '',
    nombreEmpresa: '',
    password: ''
  };

  // Constructor corregido
  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  onComponentActivate(component: any) {
    // --- LÓGICA DEL PASO 1 ---
    if (component instanceof Paso1Component) {
      component.rolSeleccionado.subscribe((nuevoRol: string) => {
        this.datosRegistro.rol = nuevoRol;
        this.onRolCambiado(nuevoRol);
      });

      component.emailEnviado.subscribe((email: string) => {
        this.datosRegistro.email = email;
        console.log('Paso 1 Guardado:', this.datosRegistro.email);
      });
    }

    // --- LÓGICA DEL PASO 2 ---
    if (component instanceof Paso2Component) {
      this.onRolCambiado(this.datosRegistro.rol);
      
      component.codigoEnviado.subscribe((codigo: string) => {
        this.datosRegistro.codigoVerificacion = codigo;
        console.log('Paso 2 Guardado:', this.datosRegistro.codigoVerificacion);
      });
    }

    // --- LÓGICA DEL PASO 3 ---
    if (component instanceof Paso3Component) {
      component.rol = this.datosRegistro.rol;

      component.registroFinalizado.subscribe((datosPerfil: any) => {
        this.datosRegistro = {
          ...this.datosRegistro,
          ...datosPerfil
        };

        console.log('REGISTRO COMPLETO PARA DJANGO:', this.datosRegistro);
        this.enviarBackend();
      });
    }
  }

  onRolCambiado(nuevoRol: string) {
    if (nuevoRol === 'vendedor') {
      this.imagenDinamica = 'assets/image/auth/tienda2.webp';
    } else {
      this.imagenDinamica = 'assets/image/auth/motoAtar.webp';
    }
  }

  enviarBackend() {
      // Creamos un objeto limpio para enviar, mapeando 'nombreEmpresa' a 'nombre_empresa'
    const payload = {
      ...this.datosRegistro,
      nombre_empresa: this.datosRegistro.nombreEmpresa // <--- Mapeo clave
    };
    console.log('Iniciando envío a Django...', payload);

    this.authService.registrarUsuario(payload).subscribe({
      next: (respuesta) => {
        console.log('Respuesta de Django:', respuesta);
        alert('¡Registro exitoso! Bienvenido a ROARMOT.');
        
        // Redirección al Dashboard tras el éxito
        this.router.navigate(['/dashboard']); 
      },
      error: (err) => {
        console.error('Error al conectar con Django:', err);
        alert('Hubo un error en el registro. Inténtalo de nuevo.');
      }
    });
  }
}