import { Component, OnInit, ViewChild, inject, HostListener } from '@angular/core';
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
  
  motos: any[] = [];
  alertas: any[] = []; 
  porcentajeSalud: number = 100; 

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
          // Un pequeño delay asegura que el ViewChild ya esté listo
          setTimeout(() => this.seleccionarMoto(this.motos[0]), 100);
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
      },
      error: (err) => console.error('Error cargando alertas', err)
    });
  }

  actualizarSalud() {
    if (this.tieneAlertasCriticas()) {
      this.porcentajeSalud = 30;
    } else if (this.tieneAlertasPendientes()) {
      this.porcentajeSalud = 70;
    } else {
      this.porcentajeSalud = 100;
    }
  }

  tieneAlertasCriticas(): boolean {
    return this.alertas.some(alerta => alerta.nivel_prioridad?.toLowerCase() === 'critico');
  }

  tieneAlertasPendientes(): boolean {
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
      return principal.descripcion || 'Alerta pendiente'; 
    }
    return 'Todos tus documentos y sistemas están operando correctamente.';
  }

  // --- LÓGICA DE DÍAS (Sincronizada con el HTML) ---

  getDiasRestantes(fechaVencimiento: string): number {
    if (!fechaVencimiento) return 0;
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    
    hoy.setHours(0, 0, 0, 0);
    vencimiento.setHours(0, 0, 0, 0);

    const diffTime = vencimiento.getTime() - hoy.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  getInfoResiduo(alerta: any): string {
    const dias = this.getDiasRestantes(alerta.fecha_vencimiento);
    
    if (dias > 30) {
      const meses = Math.floor(dias / 30);
      return meses === 1 ? 'Vigente por 1 mes' : `Vigente por ${meses} meses`;
    } else if (dias > 1) {
      return `Faltan ${dias} días`;
    } else if (dias === 1) {
      return 'Vence mañana';
    } else if (dias === 0) {
      return 'Vence hoy';
    } else {
      return `Vencido hace ${Math.abs(dias)} días`;
    }
  }

  // --- TOOLTIP Y NAVEGACIÓN ---

  @HostListener('document:mouseover', ['$event'])
  onMouseOver(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const trigger = target.closest('[data-tooltip]');
    if (trigger) {
      const tooltip = document.getElementById('roar-tooltip');
      const text = document.getElementById('roar-tooltip-text');
      const mensaje = trigger.getAttribute('data-tooltip');

      if (tooltip && text && mensaje) {
        text.innerText = mensaje;
        tooltip.classList.remove('hidden');
        const rect = trigger.getBoundingClientRect();
        tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
        tooltip.style.top = `${rect.top - 10}px`;
      }
    }
  }

  @HostListener('document:mouseout', ['$event'])
  onMouseOut(event: MouseEvent) { // Corregido parámetro
    const tooltip = document.getElementById('roar-tooltip');
    if (tooltip) tooltip.classList.add('hidden');
  }

  irAMantenimientos() {
    this.router.navigate(['/app/mantenimientos']);
  }

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