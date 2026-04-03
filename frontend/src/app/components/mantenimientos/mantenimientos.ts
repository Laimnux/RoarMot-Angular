import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotoService } from '../../services/moto.service';
import { AlertaService } from '../../services/alerta.service'; // Importante para las cards proactivas
import { DATA_MANTENIMIENTO, InfoMantenimiento } from '../../data/mantenimiento.data';
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
  private alertaService = inject(AlertaService);


  motos: any[] = [];
  motoSeleccionada: any = null;
  alertasMoto: any[] = []; // Para las nuevas cards proactivas
  kilometrajeActual: number = 0;
  porcentajeSaludGeneral: number = 100;
  baseUrl = environment.apiUrl;

  alertasActuales: InfoMantenimiento[] = [];
  indiceAlerta: number = 0;
  intervaloCarrusel: any;

  itemsManual: any[] = [];

  ngOnInit(): void {
    this.cargarMotos();
  }

  // IMPORTANTE: Limpiar el intervalo al salir
  ngOnDestroy(): void {
    if (this.intervaloCarrusel) {
      clearInterval(this.intervaloCarrusel);
    }
  }

  cargarMotos() {
    this.motoService.getMotos().subscribe({
      next: (data) => {
        this.motos = data;
        if (this.motos.length > 0) {
          this.seleccionarMoto(this.motos[0]);
        }
      },
      error: (err) => console.error('ERR_LOAD_MOTOS:', err)
    });
  }

  seleccionarMoto(moto: any) {
    if (!moto) return;
    this.motoSeleccionada = { ...moto };
    this.kilometrajeActual = moto.kilometraje || 0;
    
    // 1. Generar manual técnico basado en specs de Django
    this.generarManualDinamico(moto);
    
    // 2. Cargar alertas reales del GestorAlerta (Backend)
    this.cargarAlertas(moto.id_datosmoto);

    // NUEVO: Iniciar el carrusel de diagnóstico cada vez que se cambia de moto
    this.generarDiagnosticosDinamicos();

    // Manejo de imagen
    if (moto.imagen_moto) {
      this.motoSeleccionada.displayImage = moto.imagen_moto.startsWith('http') 
        ? moto.imagen_moto 
        : `${this.baseUrl}${moto.imagen_moto}`;
    } else {
      this.motoSeleccionada.displayImage = 'assets/motos/default_moto.jpg'; 
    }
  }

  cargarAlertas(idMoto: number) {
    this.alertaService.getAlertasByMoto(idMoto).subscribe({
      next: (data) => {
        this.alertasMoto = data;
        this.calcularSaludGlobal();
      }
    });
  }

  generarManualDinamico(moto: any) {
    // Ahora cada ítem consulta su intervalo específico basado en el cilindraje de la moto
    this.itemsManual = [
      { nombre: 'Aceite de Motor', intervalo: this.getIntervaloTecnico('Aceite de Motor', moto) },
      { nombre: 'Filtro de Aire', intervalo: this.getIntervaloTecnico('Filtro de Aire', moto) },
      { nombre: 'Kit de Arrastre', intervalo: this.getIntervaloTecnico('Kit de Arrastre', moto) },
      { nombre: 'Líquido de Frenos', intervalo: this.getIntervaloTecnico('Líquido de Frenos', moto) },
      { nombre: 'Cadena de Transmisión', intervalo: this.getIntervaloTecnico('Cadena de Transmisión', moto) },
      { nombre: 'Freno Trasero', intervalo: this.getIntervaloTecnico('Freno Trasero', moto) },
      { nombre: 'Líquido Refrigerante', intervalo: this.getIntervaloTecnico('Líquido Refrigerante', moto) },
      { nombre: 'Rines y Llantas', intervalo: this.getIntervaloTecnico('Rines y Llantas', moto) },
      { nombre: 'Embrague', intervalo: this.getIntervaloTecnico('Embrague', moto) },
      { nombre: 'Sistema Eléctrico', intervalo: this.getIntervaloTecnico('Sistema Eléctrico', moto) }
    ];
  }

  getIntervaloTecnico(pieza: string, moto: any): number {
    const cilindraje = moto.cilindraje || 0;
    let base = 10000;

    // Clasificación por rangos de cilindraje
    if (cilindraje <= 250) { // BAJO
      switch (pieza) {
        case 'Aceite de Motor': base = 3000; break;
        case 'Filtro de Aire': base = 6000; break;
        case 'Kit de Arrastre': base = 20000; break;
        case 'Freno Trasero': base = 12000; break;
        case 'Liquido de Frenos' : base = 20000; break; 
        case 'Cadena de Transmisión': base = 25000; break;
        case 'Sistema Eléctrico': base = 24000; break;
        case 'Líquido Refrigerante': base = 24000; break;
        case 'Rines y Llantas': base = 15000; break;
        case 'Embrague': base = 25000; break;
        default: base = 10000;
      }
    } else if (cilindraje > 250 && cilindraje <= 600) { // MEDIANO
      switch (pieza) {
        case 'Aceite de Motor': base = 5000; break;
        case 'Filtro de Aire': base = 10000; break;
        case 'Kit de Arrastre': base = 18000; break; 
        case 'Freno Trasero': base = 10000; break;
        case 'Cadena de Transmisión': base = 18000; break; // MÁS CORTO por mayor potencia
        case 'Sistema Eléctrico': base = 12000; break;
        case 'Líquido Refrigerante': base = 18000; break;
        case 'Rines y Llantas': base = 12000; break; // MÁS CORTO por deportividad
        case 'Liquido de Frenos' : base = 20000; break; // MÁS FRECUENTE por uso deportivo
        case 'Embrague': base = 20000; break;
        default: base = 12000;
      }
    } else { // ALTO (> 600cc)
      switch (pieza) {
        case 'Aceite de Motor': base = 8000; break;
        case 'Filtro de Aire': base = 12000; break;
        case 'Kit de Arrastre': base = 15000; break; // AJUSTADO (más desgaste por torque)
        case 'Freno Trasero': base = 8000; break; // MÁS FRECUENTE
        case 'Cadena de Transmisión': base = 18000; break; // MÁS CORTO por mayor potencia
        case 'Sistema Eléctrico': base = 20000; break;
        case 'Líquido Refrigerante': base = 18000; break;
        case 'Rines y Llantas': base = 12000; break; // MÁS CORTO por deportividad
        case 'Embrague': base = 20000; break;
        case 'Liquido de Frenos' : base = 15000; break; // MÁS FRECUENTE por uso deportivo
        default: base = 15000;
      }
    }

    // --- MANTENER LA PERSONALIZACIÓN EXTRA ---
    // Solo para el aceite, aplicamos factores de tipo de aceite y uso beneficio o no :D
    if (pieza === 'Aceite de Motor') {
      if (moto.tipo_aceite === 'SINTETICO') base *= 1.5;
      if (moto.tipo_aceite === 'MINERAL') base *= 0.7;
      if (moto.tipo_uso === 'URBANO') base *= 0.9;
      if (moto.tipo_uso === 'TURISMO') base *= 1.1; // NUEVO (viajes largos menos desgaste)
    }

    // 2. KIT DE ARRASTRE: Factor por uso urbano (más desgaste por arranques)
    if (pieza === 'Kit de Arrastre' && moto.tipo_uso === 'URBANO') {
      base *= 0.8; // 20% menos de vida útil en ciudad
    }
    
    // 3. FRENOS: Factor por uso deportivo
    if ((pieza === 'Freno Trasero' || pieza === 'Líquido de Frenos') && moto.tipo_uso === 'TURISMO') {
      base *= 0.9; // 10% menos si es turismo (más frenadas)
    }
    
    // 4. EMBRAGUE: Factor por uso urbano (más cambios)
    if (pieza === 'Embrague' && moto.tipo_uso === 'URBANO') {
      base *= 0.85; // 15% menos de vida útil en ciudad
    }

    return Math.round(base);
  }

  getCalculo(item: any) {
    const kmRecorridos = this.kilometrajeActual - (this.motoSeleccionada.km_ultimo_mantenimiento || 0);
    const restantes = item.intervalo - kmRecorridos;
    let porcentaje = (restantes / item.intervalo) * 100;
    porcentaje = Math.max(0, Math.min(100, porcentaje));

    return {
      restantes: restantes < 0 ? 0 : restantes,
      porcentaje: porcentaje,
      estado: restantes <= 200 ? 'critico' : restantes <= 600 ? 'preventivo' : 'optimo',
      vencido: restantes < 0
    };
  }

  calcularSaludGlobal() {
    let salud = 100;

    // 1. Penalización por Items Mecánicos (Enfoque en Aceite)
    this.itemsManual.forEach(item => {
      const calculo = this.getCalculo(item);
      
      if (item.nombre.includes('Aceite')) {
        // Si el aceite es crítico (<200km) o vencido, bajamos un 60% de golpe
        if (calculo.vencido) salud -= 70;
        else if (calculo.estado === 'critico') salud -= 50;
        else if (calculo.estado === 'preventivo') salud -= 20;
      } else {
        // Otros ítems penalizan menos (10% si están críticos)
        if (calculo.estado === 'critico') salud -= 10;
      }
    });

    // 2. Penalización por Alertas del Backend (GestorAlerta)
    const tieneCriticas = this.alertasMoto.some(a => a.nivel_prioridad === 'critico');
    if (tieneCriticas) salud -= 40;

    // 3. Penalización por Documentos (SOAT/Tecno)
    const soat = this.verificarVigencia(this.motoSeleccionada?.soat_moto);
    const tecno = this.verificarVigencia(this.motoSeleccionada?.tecnomecanica);
    
    if (soat.estado !== 'ok' || tecno.estado !== 'ok') salud -= 30;

    // Asegurar que el rango esté entre 0 y 100
    this.porcentajeSaludGeneral = Math.max(0, Math.min(100, salud));

    // RECOMENDACIÓN: Actualizar carrusel cuando la salud cambie (por si llegan alertas nuevas)
    this.generarDiagnosticosDinamicos();
  }

  verificarVigencia(fechaString: string) {
    if (!fechaString) return { estado: 'vencido', dias: 0 };
    const fechaDoc = new Date(fechaString);
    const hoy = new Date();
    const diffDays = Math.ceil((fechaDoc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return { 
      estado: diffDays <= 0 ? 'vencido' : diffDays <= 15 ? 'critico' : 'ok', 
      dias: diffDays 
    };
  }

  // 2. Crea la función que llena el carrusel
  generarDiagnosticosDinamicos() {
    const alertas: InfoMantenimiento[] = [];

    // 1. Revisar Documentos (SOAT / TECNO)
    const soat = this.verificarVigencia(this.motoSeleccionada?.soat_moto);
    if (soat.estado !== 'ok') {
      const info = DATA_MANTENIMIENTO.find(d => d.id === (soat.estado === 'vencido' ? 'soat_vencido' : 'soat_proximo'));
      if (info) alertas.push(info);
    }

    const tecno = this.verificarVigencia(this.motoSeleccionada?.tecnomecanica);
    if (tecno.estado !== 'ok') {
      const info = DATA_MANTENIMIENTO.find(d => d.id === (tecno.estado === 'vencido' ? 'tecnomecanica_vencida' : 'tecnomecanica_proxima'));
      if (info) alertas.push(info);
    }

    // 2. Revisar Ítems Mecánicos
    this.itemsManual.forEach(item => {
      const calc = this.getCalculo(item);
      if (calc.estado !== 'optimo') {
        const info = DATA_MANTENIMIENTO.find(d => d.pieza === item.nombre && d.estado === calc.estado);
        if (info) alertas.push(info);
      }
    });

    // 3. Estado por defecto si todo está perfecto
    if (alertas.length === 0) {
      const optimo = DATA_MANTENIMIENTO.find(d => d.id === 'aceite_optimo');
      if (optimo) alertas.push(optimo);
    }

    this.alertasActuales = alertas;
    this.iniciarCarrusel();
  }

  iniciarCarrusel() {
    // Limpiar intervalo previo para no duplicar procesos
    if (this.intervaloCarrusel) clearInterval(this.intervaloCarrusel);
    this.indiceAlerta = 0;
    
    if (this.alertasActuales.length > 1) {
      this.intervaloCarrusel = setInterval(() => {
        this.indiceAlerta = (this.indiceAlerta + 1) % this.alertasActuales.length;
      }, 8000);
    }
  }
}