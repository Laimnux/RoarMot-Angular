import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotoService } from '../../services/moto.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-mantenimientos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mantenimientos.html',
  styleUrl: './mantenimientos.css'
})
export class Mantenimientos implements OnInit {
  private motoService = inject(MotoService);

  motos: any[] = [];
  motoSeleccionada: any = null;
  kilometrajeActual: number = 0;
  baseUrl = environment.apiUrl;

  // El manual ahora es una función o se actualiza dinámicamente
  itemsManual: any[] = [];

  ngOnInit(): void {
    this.cargarMotos();
  }

  cargarMotos() {
    this.motoService.getMotos().subscribe({
      next: (data) => {
        this.motos = data;
        if (this.motos.length > 0) {
          const index = this.motoSeleccionada 
            ? this.motos.findIndex(m => m.id_datosmoto === this.motoSeleccionada.id_datosmoto)
            : 0;
          this.seleccionarMoto(this.motos[index !== -1 ? index : 0]);
        }
      },
      error: (err) => console.error('ERR_LOAD_MOTOS:', err)
    });
  }

  seleccionarMoto(moto: any) {
    if (!moto) return;
    this.motoSeleccionada = { ...moto };
    this.kilometrajeActual = moto.kilometraje || 0;
    
    // Al seleccionar moto, recalculamos el manual basado en sus specs técnicos
    this.generarManualDinamico(moto);

    if (moto.imagen_moto) {
      this.motoSeleccionada.displayImage = moto.imagen_moto.startsWith('http') 
        ? moto.imagen_moto 
        : `${this.baseUrl}${moto.imagen_moto}`;
    } else {
      this.motoSeleccionada.displayImage = 'assets/motos/default_moto.jpg'; 
    }
  }

  // --- NUEVA LÓGICA DE INGENIERÍA DINÁMICA ---
  generarManualDinamico(moto: any) {
    // Calculamos el intervalo real del aceite usando tu nueva función
    const intervaloAceite = this.calcularIntervaloPersonalizado(moto);

    this.itemsManual = [
      { nombre: 'Aceite de Motor', intervalo: intervaloAceite, icono: 'fa-oil-can' },
      { nombre: 'Filtro de Aceite', intervalo: intervaloAceite, icono: 'fa-filter' }, // Sincronizado con aceite
      { nombre: 'Filtro de Aire', intervalo: 10000, icono: 'fa-wind' },
      { nombre: 'Bujía (Revisión)', intervalo: 7000, icono: 'fa-bolt' },
      { nombre: 'Líquido de Frenos', intervalo: 12000, icono: 'fa-tint' }
    ];
  }

  calcularIntervaloPersonalizado(moto: any): number {
    if (!moto) return 3000;

    // 1. Base por Cilindraje
    let intervaloBase = 5000;
    if (moto.cilindraje < 250) intervaloBase = 3000;
    else if (moto.cilindraje > 600) intervaloBase = 10000;

    // 2. Factor de Uso - desgaste extra 
    let factorUso = 1.0;
    switch (moto.tipo_uso) {
      case 'URBANO': factorUso = 0.8; break;
      case 'TURISMO': factorUso = 1.2; break; // Un poco más generoso en carretera
      case 'MIXTO': factorUso = 1.0; break;
    }

    // 3. Factor de Aceite
    let factorAceite = 1.0;
    if (moto.tipo_aceite === 'MINERAL') factorAceite = 0.7;
    if (moto.tipo_aceite === 'SINTETICO') factorAceite = 1.3;

    return Math.round(intervaloBase * factorUso * factorAceite);
  }

  getCalculo(item: any) {
    if (!this.motoSeleccionada) {
      return { restantes: item.intervalo, porcentaje: 100, estado: 'optimo' };
    }

    // 1. Calculamos cuánto se ha recorrido REALMENTE desde que se hizo el mantenimiento
    const kmDesdeElCambio = this.kilometrajeActual - (this.motoSeleccionada.km_ultimo_mantenimiento || 0);
    
    // 2. Kilómetros que faltan para el siguiente cambio
    const restantes = item.intervalo - kmDesdeElCambio;
    
    // 3. Porcentaje de vida útil (asegurando rango 0-100)
    let porcentaje = (restantes / item.intervalo) * 100;
    porcentaje = Math.max(0, Math.min(100, porcentaje)); 

    // 4. Determinación de estados según umbrales de seguridad
    let estado: 'critico' | 'preventivo' | 'optimo' = 'optimo';
    
    if (restantes <= 200) {
      estado = 'critico'; // Rojo: ¡Cambio inmediato!
    } else if (restantes <= 600) {
      estado = 'preventivo'; // Amarillo: Prepárate para el cambio
    }

    return {
      restantes: restantes < 0 ? 0 : restantes,
      porcentaje: porcentaje,
      estado: estado,
      vencido: restantes < 0 // Bandera por si quieres mostrar un mensaje de "VENCIDO"
    };
  }

  verificarVigencia(fechaString: string) {
    if (!fechaString) return { estado: 'vencido', dias: 0 };
    const fechaDoc = new Date(fechaString);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diffTime = fechaDoc.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { estado: diffDays <= 0 ? 'vencido' : 'ok', dias: diffDays };
  }
}