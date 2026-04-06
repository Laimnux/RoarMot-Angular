import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth';
import { Usuario } from '../../models/usuario.model';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  usuario: Usuario = {} as Usuario;
  misPedidos: any[] = [];
  
  // Control de estados de edición para cada campo
  editando: any = {
    nombre: false,
    telefono: false,
    direccion: false,
    ciudad: false,
    departamento: false,
    codigo_postal: false,
    notas: false
  };

  private pedidoService = inject(PedidoService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.usuarioActual$.subscribe({
      next: (u) => {
        if (u) {
          this.usuario = { ...u };
          this.cargarHistorialPedidos();
        }
      }
    });
    this.cargarDatosDesdeServidor();
  }

  cargarDatosDesdeServidor() {
    this.pedidoService.obtenerPerfil().subscribe({
      next: (res) => {
        this.authService.actualizarEstadoUsuario(res);
      },
      error: (err) => console.error('Error API:', err)
    });
  }

  /**
   * MÉTODO CLAVE: Guarda un solo campo de texto
   * @param campo Nombre del campo en el modelo
   * @param valor Nuevo valor a guardar
   */
  guardarCampo(campo: string, valor: any) {
    const dataParcial = { [campo]: valor };

    this.pedidoService.actualizarPerfil(dataParcial).subscribe({
      next: (res) => {
        this.authService.actualizarEstadoUsuario(res.usuario);
        this.editando[campo] = false; // Cerramos el input y volvemos al texto
        this.notificationService.show(`${campo} actualizado`, 'success');
      },
      error: () => {
        this.notificationService.show('Error al actualizar', 'error');
        this.editando[campo] = false;
      }
    });
  }

  /**
   * ACTUALIZACIÓN INSTANTÁNEA DE FOTO
   * Se dispara apenas el usuario elige el archivo
   */
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    // 1. Previsualización rápida para el usuario
    const reader = new FileReader();
    reader.onload = (e: any) => this.usuario.url_imagen_perfil = e.target.result;
    reader.readAsDataURL(file);

    // 2. Envío inmediato al servidor
    const formData = new FormData();
    formData.append('url_imagen_perfil', file);

    this.pedidoService.actualizarPerfilConFoto(formData).subscribe({
      next: (res) => {
        this.authService.actualizarEstadoUsuario(res.usuario);
        this.notificationService.show('Imagen de piloto actualizada', 'success');
      },
      error: (err) => {
        console.error(err);
        this.notificationService.show('Error al subir imagen', 'error');
      }
    });
  }

  // Helper para activar edición desde el lápiz
  activarEdicion(campo: string) {
    this.editando[campo] = true;
  }

  // 3. Nuevo método para obtener los pedidos del usuario
  cargarHistorialPedidos() {
    this.pedidoService.obtenerPedidos().subscribe({
      next: (pedidos) => {
        // Si la API devuelve un objeto con una lista, asegúrate de asignar la lista
        this.misPedidos = pedidos; 
        console.log('Suministros detectados para el piloto:', pedidos);
      },
      error: (err) => {
        console.error('Error al recuperar historial:', err);
        this.notificationService.show('No se pudo sincronizar el historial', 'error');
      }
    });
  }
}