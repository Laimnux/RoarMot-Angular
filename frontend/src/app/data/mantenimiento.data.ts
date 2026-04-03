export interface InfoMantenimiento {
  id: string;
  pieza: string;
  estado: 'critico' | 'preventivo' | 'optimo';
  titulo: string;
  mensaje: string;
  recomendacion?: string; // Recomendación adicional
  tiempoEstimado?: string; // Tiempo estimado de reparación
  costoEstimado?: string; // Costo estimado (opcional)
}

export const DATA_MANTENIMIENTO: InfoMantenimiento[] = [
   // ==================== ACEITE DE MOTOR ====================
  {
    id: 'aceite_critico',
    pieza: 'Aceite de Motor',
    estado: 'critico',
    titulo: 'ALERTA DE LUBRICACIÓN CRÍTICA',
    mensaje: 'El aceite ha perdido su viscosidad. El roce entre metales generará un calor excesivo que puede soldar los pistones. ¡Cambio inmediato!',
    recomendacion: 'Cambio de aceite y filtro URGENTE. No rodar más de 50 km.',
    tiempoEstimado: '30-45 minutos',
    costoEstimado: '$80.000 - $150.000'
  },
  {
    id: 'aceite_preventivo',
    pieza: 'Aceite de Motor',
    estado: 'preventivo',
    titulo: 'VISCOSIDAD EN LÍMITE',
    mensaje: 'El aceite está empezando a degradarse. Un cambio a tiempo evita que se formen lodos internos que tapan los conductos del motor.',
    recomendacion: 'Programa cambio de aceite en los próximos 500 km',
    tiempoEstimado: '30 minutos',
    costoEstimado: '$80.000 - $150.000'
  },
  {
    id: 'aceite_optimo',
    pieza: 'Aceite de Motor',
    estado: 'optimo',
    titulo: 'ACEITE EN CONDICIONES ÓPTIMAS',
    mensaje: 'La lubricación es adecuada. El motor está protegido contra el desgaste prematuro.',
    recomendacion: 'Revisa nivel cada 500 km',
    tiempoEstimado: '-',
    costoEstimado: '-'
  },

  // ==================== FILTRO DE AIRE ====================
  {
    id: 'filtro_aire_critico',
    pieza: 'Filtro de Aire',
    estado: 'critico',
    titulo: 'ASFIXIA DEL MOTOR',
    mensaje: 'El filtro está completamente saturado. La mezcla aire-combustible es incorrecta, aumentando el consumo y el desgaste.',
    recomendacion: 'Reemplazo inmediato del filtro de aire',
    tiempoEstimado: '15-20 minutos',
    costoEstimado: '$25.000 - $50.000'
  },
  {
    id: 'filtro_aire_preventivo',
    pieza: 'Filtro de Aire',
    estado: 'preventivo',
    titulo: 'FLUJO DE AIRE REDUCIDO',
    mensaje: 'El filtro acumula suciedad que afecta la combustión. El motor pierde potencia y aumenta el consumo.',
    recomendacion: 'Limpieza o cambio en los próximos 1.000 km',
    tiempoEstimado: '15 minutos',
    costoEstimado: '$25.000 - $50.000'
  },
  {
    id: 'filtro_aire_optimo',
    pieza: 'Filtro de Aire',
    estado: 'optimo',
    titulo: 'FILTRO EN PERFECTO ESTADO',
    mensaje: 'La admisión de aire es óptima. La combustión es eficiente.',
    recomendacion: 'Inspección cada 2.000 km',
    tiempoEstimado: '-',
    costoEstimado: '-'
  },

  // ==================== KIT DE ARRASTRE (CADENA, PIÑONES) ====================
  {
    id: 'arrastre_critico',
    pieza: 'Kit de Arrastre',
    estado: 'critico',
    titulo: 'RIESGO DE ROTURA DE CADENA',
    mensaje: 'La cadena y piñones están desgastados. Un tirón brusco puede romper la cadena, bloquear la rueda y causar una caída grave.',
    recomendacion: 'Reemplazo URGENTE del kit completo',
    tiempoEstimado: '1-2 horas',
    costoEstimado: '$150.000 - $300.000'
  },
  {
    id: 'arrastre_preventivo',
    pieza: 'Kit de Arrastre',
    estado: 'preventivo',
    titulo: 'DESGASTE PROGRESIVO',
    mensaje: 'La cadena presenta holgura y los piñones empiezan a picarse. Si no actúas, el desgaste será más rápido.',
    recomendacion: 'Ajuste y lubricación. Planificar cambio en 2.000 km',
    tiempoEstimado: '30 minutos',
    costoEstimado: '$150.000 - $300.000'
  },
  {
    id: 'arrastre_optimo',
    pieza: 'Kit de Arrastre',
    estado: 'optimo',
    titulo: 'TRANSMISIÓN EFICIENTE',
    mensaje: 'La cadena y piñones están en buen estado. La transmisión de potencia es directa.',
    recomendacion: 'Lubricar cada 500 km',
    tiempoEstimado: '-',
    costoEstimado: '-'
  },

  // ==================== LÍQUIDO DE FRENOS ====================
  {
    id: 'frenos_critico',
    pieza: 'Líquido de Frenos',
    estado: 'critico',
    titulo: 'FALLO DE PRESIÓN HIDRÁULICA',
    mensaje: 'El líquido ha absorbido humedad. En una frenada larga, podría hervir y dejarte sin presión en la manigueta. Riesgo de accidente alto.',
    recomendacion: 'Cambio URGENTE de líquido de frenos y purga del sistema',
    tiempoEstimado: '45-60 minutos',
    costoEstimado: '$60.000 - $120.000'
  },
  {
    id: 'frenos_preventivo',
    pieza: 'Líquido de Frenos',
    estado: 'preventivo',
    titulo: 'HUMEDAD EN EL SISTEMA',
    mensaje: 'El líquido empieza a perder sus propiedades hidráulicas. El punto de ebullición ha disminuido.',
    recomendacion: 'Cambiar líquido en los próximos 3 meses',
    tiempoEstimado: '45 minutos',
    costoEstimado: '$60.000 - $120.000'
  },
  {
    id: 'frenos_optimo',
    pieza: 'Líquido de Frenos',
    estado: 'optimo',
    titulo: 'FRENOS EN PERFECTO ESTADO',
    mensaje: 'El líquido está en condiciones óptimas. La respuesta de frenado es inmediata.',
    recomendacion: 'Revisión visual cada 5.000 km',
    tiempoEstimado: '-',
    costoEstimado: '-'
  },

  // ==================== PASTILLAS DE FRENO ====================
  {
    id: 'pastillas_critico',
    pieza: 'Pastillas de Freno',
    estado: 'critico',
    titulo: 'FRENOS METAL CON METAL',
    mensaje: 'Las pastillas están gastadas. El frenado es peligroso y estás dañando los discos.',
    recomendacion: 'Cambio URGENTE de pastillas. Revisar discos.',
    tiempoEstimado: '30-45 minutos',
    costoEstimado: '$80.000 - $180.000'
  },
  {
    id: 'pastillas_preventivo',
    pieza: 'Pastillas de Freno',
    estado: 'preventivo',
    titulo: 'DESGASTE AVANZADO',
    mensaje: 'Las pastillas tienen menos del 30% de vida útil. La distancia de frenado aumentó.',
    recomendacion: 'Programar cambio en los próximos 1.000 km',
    tiempoEstimado: '30 minutos',
    costoEstimado: '$80.000 - $180.000'
  },
  {
    id: 'pastillas_optimo',
    pieza: 'Pastillas de Freno',
    estado: 'optimo',
    titulo: 'FRENOS EN CONDICIONES',
    mensaje: 'El espesor de las pastillas es correcto. El frenado es seguro.',
    recomendacion: 'Revisión cada 5.000 km',
    tiempoEstimado: '-',
    costoEstimado: '-'
  },

  // ==================== NEUMÁTICOS ====================
  {
    id: 'neumatico_critico',
    pieza: 'Neumáticos',
    estado: 'critico',
    titulo: 'RIESGO DE REVENTÓN',
    mensaje: 'El dibujo está por debajo del límite legal (1.6mm). En lluvia, el riesgo de aquaplaning es altísimo.',
    recomendacion: 'Cambio URGENTE de neumáticos. Verificar presión.',
    tiempoEstimado: '30-45 minutos',
    costoEstimado: '$200.000 - $500.000'
  },
  {
    id: 'neumatico_preventivo',
    pieza: 'Neumáticos',
    estado: 'preventivo',
    titulo: 'DESGASTE IRREGULAR',
    mensaje: 'El dibujo está llegando al testigo de desgaste. La adherencia disminuye.',
    recomendacion: 'Planificar cambio en los próximos 2.000 km',
    tiempoEstimado: '30 minutos',
    costoEstimado: '$200.000 - $500.000'
  },
  {
    id: 'neumatico_optimo',
    pieza: 'Neumáticos',
    estado: 'optimo',
    titulo: 'NEUMÁTICOS EN BUEN ESTADO',
    mensaje: 'El dibujo es profundo y la presión es correcta. Agarre óptimo.',
    recomendacion: 'Revisar presión cada 15 días',
    tiempoEstimado: '-',
    costoEstimado: '-'
  },

  // ==================== BUJÍA ====================
  {
    id: 'bujia_critico',
    pieza: 'Bujía',
    estado: 'critico',
    titulo: 'FALLO DE IGNICIÓN',
    mensaje: 'La bujía está en mal estado. El motor falla, consume más y contamina. Puede dañar la bobina.',
    recomendacion: 'Cambio URGENTE de bujía',
    tiempoEstimado: '15-20 minutos',
    costoEstimado: '$15.000 - $40.000'
  },
  {
    id: 'bujia_preventivo',
    pieza: 'Bujía',
    estado: 'preventivo',
    titulo: 'ELECTRODOS DESGASTADOS',
    mensaje: 'La chispa ya no es óptima. El rendimiento del motor ha disminuido.',
    recomendacion: 'Cambio en los próximos 2.000 km',
    tiempoEstimado: '15 minutos',
    costoEstimado: '$15.000 - $40.000'
  },
  {
    id: 'bujia_optimo',
    pieza: 'Bujía',
    estado: 'optimo',
    titulo: 'IGNICIÓN EFICIENTE',
    mensaje: 'La bujía está en buen estado. La combustión es completa.',
    recomendacion: 'Inspección cada 5.000 km',
    tiempoEstimado: '-',
    costoEstimado: '-'
  },

  // ==================== REFRIGERANTE ====================
  {
    id: 'refrigerante_critico',
    pieza: 'Refrigerante',
    estado: 'critico',
    titulo: 'RIESGO DE RECALENTAMIENTO',
    mensaje: 'El refrigerante está contaminado o bajo nivel. El motor puede sobrecalentarse y dañar la junta.',
    recomendacion: 'Cambio URGENTE de refrigerante y revisión de fugas',
    tiempoEstimado: '30-45 minutos',
    costoEstimado: '$40.000 - $80.000'
  },
  {
    id: 'refrigerante_preventivo',
    pieza: 'Refrigerante',
    estado: 'preventivo',
    titulo: 'PROPIEDADES DEGRADADAS',
    mensaje: 'El anticongelante ha perdido efectividad. El sistema de enfriamiento no protege contra la corrosión.',
    recomendacion: 'Cambiar refrigerante en los próximos 3 meses',
    tiempoEstimado: '30 minutos',
    costoEstimado: '$40.000 - $80.000'
  },
  {
    id: 'refrigerante_optimo',
    pieza: 'Refrigerante',
    estado: 'optimo',
    titulo: 'TEMPERATURA CONTROLADA',
    mensaje: 'El nivel y concentración del refrigerante son correctos.',
    recomendacion: 'Revisar nivel cada mes',
    tiempoEstimado: '-',
    costoEstimado: '-'
  },

  // ==================== BATERÍA ====================
  {
    id: 'bateria_critico',
    pieza: 'Batería',
    estado: 'critico',
    titulo: 'RIESGO DE NO ARRANQUE',
    mensaje: 'La batería está descargada o sulfatada. Puede dejarte varado en cualquier momento.',
    recomendacion: 'Reemplazo URGENTE de batería',
    tiempoEstimado: '20-30 minutos',
    costoEstimado: '$120.000 - $250.000'
  },
  {
    id: 'bateria_preventivo',
    pieza: 'Batería',
    estado: 'preventivo',
    titulo: 'CARGA BAJA',
    mensaje: 'La batería tiene más de 2 años o presenta baja carga. El arranque puede fallar en frío.',
    recomendacion: 'Prueba de carga. Planificar cambio si es necesario',
    tiempoEstimado: '20 minutos',
    costoEstimado: '$120.000 - $250.000'
  },
  {
    id: 'bateria_optimo',
    pieza: 'Batería',
    estado: 'optimo',
    titulo: 'SISTEMA ELÉCTRICO ESTABLE',
    mensaje: 'La batería mantiene carga adecuada. El arranque es confiable.',
    recomendacion: 'Revisar bornes y limpieza cada 6 meses',
    tiempoEstimado: '-',
    costoEstimado: '-'
  },

  // ==================== SOAT (SEGURO) ====================
  {
    id: 'soat_vencido',
    pieza: 'SOAT',
    estado: 'critico',
    titulo: 'INMOVILIZACIÓN INMINENTE',
    mensaje: 'Circular sin SOAT es causal de inmovilización en patios y una multa de 30 SMLDV. Tu patrimonio y movilidad están en riesgo.',
    recomendacion: 'Renovar SOAT URGENTE en cualquier aseguradora autorizada',
    tiempoEstimado: '15-30 minutos',
    costoEstimado: '$450.000 - $650.000'
  },
  {
    id: 'soat_proximo',
    pieza: 'SOAT',
    estado: 'preventivo',
    titulo: 'SOAT POR VENCER',
    mensaje: 'Tu seguro obligatorio vence pronto. Si vence, no podrás transitar y no estarás protegido en caso de accidente.',
    recomendacion: 'Renovar antes del vencimiento para evitar multas',
    tiempoEstimado: '15 minutos',
    costoEstimado: '$450.000 - $650.000'
  },
  {
    id: 'soat_vigente',
    pieza: 'SOAT',
    estado: 'optimo',
    titulo: 'SOAT VIGENTE',
    mensaje: 'Tu seguro obligatorio está al día. Estás protegido y puedes transitar legalmente.',
    recomendacion: 'Renovar 30 días antes del vencimiento',
    tiempoEstimado: '-',
    costoEstimado: '-'
  },

  // ==================== TECNOMECÁNICA ====================
  {
    id: 'tecnomecanica_vencida',
    pieza: 'Tecnomecánica',
    estado: 'critico',
    titulo: 'REVISIÓN TÉCNICA VENCIDA',
    mensaje: 'La revisión técnico-mecánica está vencida. Multa, inmovilización y riesgo de accidente por fallos no detectados.',
    recomendacion: 'Agendar cita URGENTE en centro de diagnóstico',
    tiempoEstimado: '1-2 horas',
    costoEstimado: '$150.000 - $200.000'
  },
  {
    id: 'tecnomecanica_proxima',
    pieza: 'Tecnomecánica',
    estado: 'preventivo',
    titulo: 'REVISIÓN PRÓXIMA',
    mensaje: 'La revisión técnico-mecánica vence pronto. Agenda tu cita para evitar multas.',
    recomendacion: 'Agendar cita en los próximos 30 días',
    tiempoEstimado: '1-2 horas',
    costoEstimado: '$150.000 - $200.000'
  },
  {
    id: 'tecnomecanica_vigente',
    pieza: 'Tecnomecánica',
    estado: 'optimo',
    titulo: 'REVISIÓN AL DÍA',
    mensaje: 'Tu vehículo ha pasado la revisión técnico-mecánica. Estás legal y seguro.',
    recomendacion: 'Programar próxima cita con anticipación',
    tiempoEstimado: '-',
    costoEstimado: '-'
  },
  // ==================== CADENA DE TRANSMISIÓN ====================
  {
    id: 'cadena_critico',
    pieza: 'Cadena de Transmisión',
    estado: 'critico',
    titulo: 'RIESGO DE ROTURA O DESTRABE',
    mensaje: 'Holgura excesiva (>35mm) o eslabones rígidos. Una cadena rota puede bloquear la rueda trasera y causar pérdida de control total.',
    recomendacion: 'DETENCIÓN INMEDIATA. Ajustar tensión a 25-35mm. Si tiene eslabones duros o dañados, reemplazar kit completo.',
    costoEstimado: '$20.000 - $35.000 (ajuste) / $180.000 - $350.000 (kit completo)',
    tiempoEstimado: '20 min ajuste / 1.5 horas kit completo'
  },
  {
    id: 'cadena_preventivo',
    pieza: 'Cadena de Transmisión',
    estado: 'preventivo',
    titulo: 'MANTENIMIENTO DE CADENA',
    mensaje: 'La cadena ha superado los 500km sin lubricación o la tensión está en el límite superior.',
    recomendacion: 'Limpiar con cepillo y desengrasante, lubricar con aceite específico para O-ring, ajustar tensión a 25-30mm.',
    costoEstimado: '$15.000 - $25.000',
    tiempoEstimado: '20 min'
  },
  {
    id: 'cadena_optimo',
    pieza: 'Cadena de Transmisión',
    estado: 'optimo',
    titulo: 'TRANSMISIÓN SUAVE',
    mensaje: 'La cadena está correctamente tensada y lubricada. La transmisión de potencia es eficiente.',
    recomendacion: 'Lubricar cada 500km. Revisar tensión cada 1,000km.',
    costoEstimado: '-',
    tiempoEstimado: '-'
  },

  // ==================== FRENO TRASERO ====================
  {
    id: 'freno_trasero_critico',
    pieza: 'Freno Trasero',
    estado: 'critico',
    titulo: 'FRENO TRASERO SIN EFICACIA',
    mensaje: 'Pastillas gastadas al límite (<1mm) o líquido de frenos contaminado. La distancia de frenado aumentó 50%.',
    recomendacion: 'CAMBIO URGENTE: Reemplazar pastillas y revisar disco. Purga completa del sistema hidráulico.',
    costoEstimado: '$80.000 - $150.000',
    tiempoEstimado: '45 min'
  },
  {
    id: 'freno_trasero_preventivo',
    pieza: 'Freno Trasero',
    estado: 'preventivo',
    titulo: 'DESGASTE PROGRESIVO',
    mensaje: 'El espesor de pastillas es <3mm. El indicador de desgaste comenzará a chirriar pronto.',
    recomendacion: 'Programar cambio en los próximos 1,000km. Verificar nivel de líquido en el depósito.',
    costoEstimado: '$45.000 - $85.000',
    tiempoEstimado: '30 min'
  },
  {
    id: 'freno_trasero_optimo',
    pieza: 'Freno Trasero',
    estado: 'optimo',
    titulo: 'FRENO TRASERO OPERATIVO',
    mensaje: 'Pastillas con espesor adecuado (>4mm). Respuesta de frenado correcta.',
    recomendacion: 'Revisión visual cada 5,000km. Cambiar líquido cada 2 años.',
    costoEstimado: '-',
    tiempoEstimado: '-'
  },

  // ==================== LÍQUIDO REFRIGERANTE ====================
  {
    id: 'refrigerante_critico',
    pieza: 'Líquido Refrigerante',
    estado: 'critico',
    titulo: 'RIESGO DE RECALENTAMIENTO INMINENTE',
    mensaje: 'Nivel por debajo del mínimo o refrigerante con óxido/contaminación. El motor puede dañar la junta de culata si se recalienta.',
    recomendacion: 'NO RODAR. Revisar fugas en radiador, mangueras y bomba de agua. Completar con refrigerante 50/50 etilenglicol.',
    costoEstimado: '$40.000 - $65.000 (cambio) / $150.000 - $300.000 (si hay daño)',
    tiempoEstimado: '25 min cambio / 2-4 horas si hay daño'
  },
  {
    id: 'refrigerante_preventivo',
    pieza: 'Líquido Refrigerante',
    estado: 'preventivo',
    titulo: 'NIVEL BAJO DE REFRIGERANTE',
    mensaje: 'El nivel está cerca del mínimo. Pequeña pérdida por evaporación o micro fuga.',
    recomendacion: 'Completar nivel con refrigerante etilenglicol. Inspeccionar visualmente fugas.',
    costoEstimado: '$15.000 - $25.000',
    tiempoEstimado: '10 min'
  },
  {
    id: 'refrigerante_optimo',
    pieza: 'Líquido Refrigerante',
    estado: 'optimo',
    titulo: 'TEMPERATURA CONTROLADA',
    mensaje: 'Nivel correcto y refrigerante en buen estado. El sistema de enfriamiento opera eficientemente.',
    recomendacion: 'Revisar nivel cada 15 días. Cambiar cada 24,000km o 2 años.',
    costoEstimado: '-',
    tiempoEstimado: '-'
  },

  // ==================== RINES Y LLANTAS ====================
  {
    id: 'llantas_critico',
    pieza: 'Rines y Llantas',
    estado: 'critico',
    titulo: 'RIESGO DE REVENTÓN',
    mensaje: 'Dibujo inferior a 0.8mm, cortes profundos o deformaciones en la pared lateral. En frenado o curva, el riesgo de accidente es altísimo.',
    recomendacion: 'CAMBIO URGENTE. No rodar más de 50km a baja velocidad hacia el taller más cercano.',
    costoEstimado: '$280.000 - $550.000 (par)',
    tiempoEstimado: '45 min'
  },
  {
    id: 'llantas_preventivo',
    pieza: 'Rines y Llantas',
    estado: 'preventivo',
    titulo: 'NEUMÁTICOS EN LÍMITE',
    mensaje: 'Dibujo entre 1.0-1.5mm o presión incorrecta (por encima/debajo del PSI recomendado). La adherencia disminuye en lluvia.',
    recomendacion: 'Planificar cambio en 1,000-2,000km. Mantener presión de 28-32 PSI según carga.',
    costoEstimado: '$280.000 - $550.000 (par)',
    tiempoEstimado: '15 min (presión) / 45 min (cambio)'
  },
  {
    id: 'llantas_optimo',
    pieza: 'Rines y Llantas',
    estado: 'optimo',
    titulo: 'ADHERENCIA ÓPTIMA',
    mensaje: 'Dibujo profundo (>2mm), presión correcta y sin daños visibles.',
    recomendacion: 'Revisar presión cada 15 días. Rotar neumáticos cada 5,000km.',
    costoEstimado: '-',
    tiempoEstimado: '-'
  },

  // ==================== EMBRAGUE / CLUTCH ====================
  {
    id: 'embrague_critico',
    pieza: 'Embrague',
    estado: 'critico',
    titulo: 'EMBRAGUE PATINANDO',
    mensaje: 'El motor sube de revoluciones pero la moto no acelera. Las placas están desgastadas o el cable está mal ajustado.',
    recomendacion: 'Reemplazar kit de embrague (discos, placas, resortes). Verificar cable y manigueta.',
    costoEstimado: '$180.000 - $350.000',
    tiempoEstimado: '1.5 - 2 horas'
  },
  {
    id: 'embrague_preventivo',
    pieza: 'Embrague',
    estado: 'preventivo',
    titulo: 'JUEGO DE EMBRAGUE INCORRECTO',
    mensaje: 'El juego libre en la manigueta es menor a 2mm o mayor a 5mm. El embrague puede desgastarse prematuramente.',
    recomendacion: 'Ajustar tornillo de la manigueta para dejar juego de 3-4mm. Lubricar cable.',
    costoEstimado: '$10.000 - $15.000',
    tiempoEstimado: '10 min'
  },
  {
    id: 'embrague_optimo',
    pieza: 'Embrague',
    estado: 'optimo',
    titulo: 'SISTEMA DE TRANSMISIÓN OK',
    mensaje: 'Juego libre correcto (3-4mm) y respuesta suave en la manigueta.',
    recomendacion: 'Lubricar cable cada 6 meses. Evitar mantener la manigueta presionada en semáforos.',
    costoEstimado: '-',
    tiempoEstimado: '-'
  },

  // ==================== SISTEMA ELÉCTRICO (BATERÍA) ====================
  {
    id: 'bateria_critico',
    pieza: 'Sistema Eléctrico',
    estado: 'critico',
    titulo: 'FALLA ELÉCTRICA INMINENTE',
    mensaje: 'La batería tiene voltaje <11.5V o bornes sulfatados. La moto puede dejar de arrancar en cualquier momento.',
    recomendacion: 'Reemplazar batería si tiene más de 2 años. Limpiar y ajustar bornes.',
    costoEstimado: '$120.000 - $250.000',
    tiempoEstimado: '20 min'
  },
  {
    id: 'bateria_preventivo',
    pieza: 'Sistema Eléctrico',
    estado: 'preventivo',
    titulo: 'CARGA DE BATERÍA BAJA',
    mensaje: 'El arranque es más lento de lo normal. La batería está perdiendo capacidad de retención.',
    recomendacion: 'Realizar carga completa con cargador inteligente. Probar voltaje en reposo (debe ser >12.5V).',
    costoEstimado: '$15.000 - $25.000 (carga)',
    tiempoEstimado: '15 min diagnóstico / 4-6 horas carga'
  },
  {
    id: 'bateria_optimo',
    pieza: 'Sistema Eléctrico',
    estado: 'optimo',
    titulo: 'SISTEMA ELÉCTRICO ESTABLE',
    mensaje: 'Batería con voltaje correcto (12.6-12.8V) y arranque inmediato.',
    recomendacion: 'Revisar voltaje cada 3 meses. Limpiar bornes anualmente.',
    costoEstimado: '-',
    tiempoEstimado: '-'
  }
];