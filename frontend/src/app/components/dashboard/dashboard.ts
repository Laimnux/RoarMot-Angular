import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { MotoComponent } from '../moto/moto';
import { MotoService } from '../../services/moto.service';
import { AlertaService } from '../../services/alerta.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MotoComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  @ViewChild(MotoComponent) motoComp!: MotoComponent;
  
  // Variables de datos
  motos: any[] = [];
  alertas: any[] = []; 
  porcentajeSalud: number = 100; 

  // Inyección de servicios
  private motoService = inject(MotoService);
  private alertaService = inject(AlertaService);
  private router = inject(Router); 

  ngOnInit(): void {
    this.obtenerMotos();
  }

  obtenerMotos() {
    this.motoService.getMotos().subscribe({
      next: (data) => {
        this.motos = data;
        if (this.motos.length > 0) {
          this.seleccionarMoto(this.motos[0]);
        }
      },
      error: (err) => console.error('Error en la comunicación con la API:', err)
    });
  }

  seleccionarMoto(moto: any) {
    if (this.motoComp) {
      this.motoComp.isEditing = false;
      this.motoComp.verDetalleMoto(moto);
    }
    
    if (moto.id_datosmoto) {
      this.cargarAlertas(moto.id_datosmoto);
    }
  }

  cargarAlertas(idMoto: number) {
    this.alertaService.getAlertasByMoto(idMoto).subscribe({
      next: (data) => {
        this.alertas = data;
        this.actualizarSalud(); 
        console.log('Alertas actualizadas:', data);
      },
      error: (err) => console.error('Error cargando alertas', err)
    });
  }

  // --- LÓGICA DEL SEMÁFORO CORREGIDA ---

  actualizarSalud() {
    if (this.tieneAlertasCriticas()) {
      this.porcentajeSalud = 30; // ROJO
    } else if (this.tieneAlertasPendientes()) {
      this.porcentajeSalud = 70; // AMARILLO
    } else {
      this.porcentajeSalud = 100; // VERDE
    }
    
    // DEBUG: Verificar qué está pasando
    console.log('Salud actualizada:', {
      porcentaje: this.porcentajeSalud,
      alertasCriticas: this.tieneAlertasCriticas(),
      alertasPendientes: this.tieneAlertasPendientes(),
      totalAlertas: this.alertas.length
    });
  }

  tieneAlertasCriticas(): boolean {
    return this.alertas.some(alerta => alerta.nivel_prioridad === 'critico');
  }

  tieneAlertasPendientes(): boolean {
    // CORREGIDO: Excluye las críticas para que sean mutuamente excluyentes
    return this.alertas.length > 0 && !this.tieneAlertasCriticas();
  }

  getTituloEstado(): string {
    if (this.tieneAlertasCriticas()) return '¡Acción Requerida!';
    if (this.tieneAlertasPendientes()) return 'Atención Próxima';
    return 'Sistema al Día';
  }

  getMensajePreventivo(): string {
    if (this.alertas.length > 0) {
      const principal = this.alertas[0]; 
      
      if (principal.titulo?.toLowerCase().includes('soat')) {
        return `Tu SOAT está en nivel ${principal.nivel_prioridad}. ${principal.descripcion || ''}`;
      }
      if (principal.titulo?.toLowerCase().includes('tecno')) {
        return `Revisión técnica necesaria. ${principal.descripcion || ''}`;
      }
      
      return principal.descripcion || 'Alerta pendiente'; 
    }
    return 'Todos tus documentos y sistemas están operando correctamente.';
  }

  getDescripcionEstado(): string {
    if (this.tieneAlertasCriticas()) return 'Tienes documentos o mantenimientos vencidos.';
    if (this.tieneAlertasPendientes()) return 'Se aproximan fechas de mantenimiento.';
    return 'Tu moto se encuentra en óptimas condiciones.';
  }

  // --- PROPIEDADES COMPUTADAS PARA LOS ESTILOS (OPCIONAL PERO RECOMENDADO) ---

  get colorClaseTexto(): string {
    if (this.porcentajeSalud < 40) {
      return 'text-rose-600 drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]';
    } else if (this.porcentajeSalud >= 40 && this.porcentajeSalud < 80) {
      return 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.7)]';
    } else {
      return 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]';
    }
  }

  get colorClaseBarra(): string {
    if (this.porcentajeSalud < 40) {
      return 'bg-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.8)]';
    } else if (this.porcentajeSalud >= 40 && this.porcentajeSalud < 80) {
      return 'bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.8)]';
    } else {
      return 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]';
    }
  }

  get borderClase(): string {
    if (this.tieneAlertasCriticas()) return 'border-red-600';
    if (this.tieneAlertasPendientes()) return 'border-yellow-500';
    return 'border-emerald-500';
  }

  get bgBlurClase(): string {
    if (this.tieneAlertasCriticas()) return 'bg-red-600';
    if (this.tieneAlertasPendientes()) return 'bg-yellow-500';
    return 'bg-emerald-500';
  }

  irAMantenimientos() {
    console.log("Navegando a vista detallada...");
    // this.router.navigate(['/mantenimientos']); 
  }

  // --- GESTIÓN DE INTERFAZ ---

  onBtnMasClick() {
    if (this.motoComp) {
      this.motoComp.nuevaMoto();
      this.alertas = []; 
      this.porcentajeSalud = 100;
    }
  }

  onMotoRegistrada(moto: any) {
    this.obtenerMotos(); 
  }
}