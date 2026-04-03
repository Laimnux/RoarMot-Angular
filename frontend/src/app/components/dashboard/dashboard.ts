import { Component, OnInit, OnDestroy, ViewChild, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { MotoComponent } from '../moto/moto';
import { MotoService } from '../../services/moto.service';
import { AlertaService } from '../../services/alerta.service';
import { TIPS_MOTEROS } from '../../data/tips.data'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MotoComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  @ViewChild(MotoComponent) motoComp!: MotoComponent;
  
  motos: any[] = [];
  alertas: any[] = []; 
  porcentajeSalud: number = 100; // El Dashboard solo muestra este valor

  tips = TIPS_MOTEROS;
  tipActualIndex: number = 0;
  animarTip: boolean = true;
  private intervalTips: any;

  private motoService = inject(MotoService);
  private alertaService = inject(AlertaService);
  private router = inject(Router); 

  ngOnInit(): void {
    this.obtenerMotos();
    this.iniciarCicloTips();
  }

  ngOnDestroy(): void {
    if (this.intervalTips) clearInterval(this.intervalTips);
  }

  // --- MÉTODOS DE TIPS (Sin cambios) ---
  iniciarCicloTips() {
    this.intervalTips = setInterval(() => this.siguienteTip(), 8000);
  }

  siguienteTip() {
    this.animarTip = false; 
    setTimeout(() => {
      this.tipActualIndex = (this.tipActualIndex + 1) % this.tips.length;
      this.animarTip = true; 
    }, 500); 
  }

  // --- MÉTODOS DE MOTOS Y DIAGNÓSTICO ---
  obtenerMotos() {
    this.motoService.getMotos().subscribe({
      next: (data) => {
        this.motos = data;
        if (this.motos.length > 0) {
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

  /**
   * RECTIFICACIÓN: El Dashboard ahora es un "Lector".
   * Recibe las alertas ya procesadas y actualiza la salud visual.
   */
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
    // Lógica visual basada en la prioridad que viene del backend/mantenimiento
    if (this.alertas.some(alerta => alerta.nivel_prioridad?.toLowerCase() === 'critico')) {
      this.porcentajeSalud = 30;
    } else if (this.alertas.length > 0) {
      this.porcentajeSalud = 70;
    } else {
      this.porcentajeSalud = 100;
    }
  }

  getTituloEstado(): string {
    if (this.porcentajeSalud <= 30) return '¡Acción Requerida!';
    if (this.porcentajeSalud < 100) return 'Atención Próxima';
    return 'Sistema al Día';
  }

  getMensajePreventivo(): string {
    if (this.alertas.length > 0) {
      // Simplemente mostramos la descripción que ya viene procesada
      return this.alertas[0].descripcion || 'Revisión pendiente detectada.';
    }
    return 'Todos tus sistemas están operando correctamente.';
  }

  // --- ELIMINADOS MÉTODOS DE CÁLCULO DE FECHAS (getDiasRestantes, getInfoResiduo) ---
  // El Dashboard ya no calcula, solo muestra.

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

  @HostListener('document:mouseout')
  onMouseOut() { 
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