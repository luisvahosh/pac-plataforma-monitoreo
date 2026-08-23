import { PrismaClient } from '@prisma/client';

// Enriquecimiento del Proyecto PAC ya sembrado (ver seed-pac.ts) con datos
// adicionales de los documentos base que no se incluyeron en la siembra
// inicial: dependencias entre entregables, tramos de pago, tareas reales
// (Estructura por Entregable), equipo real (Perfiles Propuesta ITM) y
// asignación de responsables por entregable (Asignación por Entregable).
//
// A diferencia de seed-pac.ts, este script es de ACTUALIZACIÓN en línea:
// nunca borra ni recrea Fase/Actividad (evita perder Avances/Evidencias/
// Hitos ya vinculados por cascada) y es seguro de volver a ejecutar
// (upsert / findFirst-then-create en todo lo que crea filas nuevas).
//
// Ejecutar:
//   npm run enriquecer:pac

const prisma = new PrismaClient();

// ─── Equipo real (hoja "Perfiles Propuesta ITM") ────────────────────
// Correos PROVISIONALES (el documento fuente no trae correos reales);
// un administrador debe reemplazarlos por los reales desde el panel
// (editar usuario → correo) antes de poner las cuentas en producción.
const DOMINIO_PROVISIONAL = 'centrodepensamientoitm.cloud';

const PERSONAS = {
  mariaJose: { nombre: 'María José Suárez', email: `maria.suarez@${DOMINIO_PROVISIONAL}` },
  paolaRuiz: { nombre: 'Paola Andrea Ruiz Franco', email: `paola.ruiz@${DOMINIO_PROVISIONAL}` },
  julianaValencia: { nombre: 'Juliana Valencia', email: `juliana.valencia@${DOMINIO_PROVISIONAL}` },
  jeinerCastellanos: {
    nombre: 'Jeiner de Jesús Castellanos Barliza',
    email: `jeiner.castellanos@${DOMINIO_PROVISIONAL}`,
  },
  marcosArango: { nombre: 'Marcos Arango Tamayo', email: `marcos.arango@${DOMINIO_PROVISIONAL}` },
  dianaRios: { nombre: 'Diana Carolina Ríos Echeverri', email: `diana.rios@${DOMINIO_PROVISIONAL}` },
  harlemAcevedo: { nombre: 'Harlem Acevedo Agudelo', email: `harlem.acevedo@${DOMINIO_PROVISIONAL}` },
  vanessaGarcia: { nombre: 'Vanessa García Leoz', email: `vanessa.garcia@${DOMINIO_PROVISIONAL}` },
  alejandroSilva: { nombre: 'Alejandro Silva Cortés', email: `alejandro.silva@${DOMINIO_PROVISIONAL}` },
  guillermoPenagos: { nombre: 'Guillermo Penagos', email: `guillermo.penagos@${DOMINIO_PROVISIONAL}` },
  luisVahos: { nombre: 'Luis Eduardo Vahos Hernández', email: `luis.vahos@${DOMINIO_PROVISIONAL}` },
  leonOrrego: { nombre: 'León Darío Orrego Espejo', email: `leon.orrego@${DOMINIO_PROVISIONAL}` },
  danielGonzalez: { nombre: 'Daniel González Montoya', email: `daniel.gonzalez@${DOMINIO_PROVISIONAL}` },
  sebastianCartagena: { nombre: 'Sebastián Cartagena', email: `sebastian.cartagena@${DOMINIO_PROVISIONAL}` },
  lilianaRestrepo: { nombre: 'Liliana Restrepo', email: `liliana.restrepo@${DOMINIO_PROVISIONAL}` },
} as const;

type ClavePersona = keyof typeof PERSONAS;

// ─── Datos por entregable (hojas "Cronograma", "Estructura por
// Entregable" e "Asignación por Entregable"). La columna "Tareas
// principales" de "Estructura por Entregable" está diligenciada solo en
// la fila del primer ID de cada componente (P1, P3, P5, P8, P11, P15):
// son las subactividades de ESE entregable puntual, no de todo el
// componente — por eso solo esos 6 productos tienen `tareasPrincipales`.
interface DatosEntregable {
  producto: string;
  insumos: string;
  tareasPrincipales?: string;
  apoyo: ClavePersona[];
  responsables: ClavePersona[];
  dependeDe: string[]; // códigos de producto de los que depende
  tramoPago: string;
  tramoPagoPorcentaje: number;
}

const ENTREGABLES: DatosEntregable[] = [
  {
    producto: 'P1',
    insumos:
      'Inventarios de emisiones de GEI; insumos del soporte técnico proporcionado por el Grupo de Liderazgo Climático de Ciudades C40; Evaluación de Riesgos Climáticos; datos DANE/POT + insumo de equidad territorial; Evaluación de Necesidades de Inclusión Social y Grupos Vulnerables (doc. #8 del directorio)',
    tareasPrincipales:
      '● Consolidación y análisis de la serie histórica de inventarios de emisiones de GEI con base en información suministrada por la Secretaría de Medio Ambiente\n' +
      '● Consolidación y análisis de las trayectorias de emisiones al 2030, 2040 y 2050, considerando entre otros insumos los resultados del soporte técnico proporcionado por parte del Grupo de Liderazgo Climático de Ciudades C40\n' +
      '● Integración de los resultados de la Evaluación de Riesgos Climáticos actualizada.\n' +
      '● Caracterización socioeconómica del territorio con enfoque diferencial, de equidad y justicia climática que permita la identificación y priorización de comunidades, grupos poblacionales y/o sectores más vulnerables ante las amenazas identificadas\n' +
      '● Descripción de factores estructurales que condicionan la vulnerabilidad y la capacidad adaptativa del Distrito.',
    apoyo: ['paolaRuiz'],
    responsables: ['julianaValencia', 'harlemAcevedo', 'jeinerCastellanos', 'marcosArango', 'sebastianCartagena'],
    dependeDe: [],
    tramoPago: 'Pago 2',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P2',
    insumos:
      'Inventarios de emisiones GEI (doc. #26 del directorio, serie 2015-2023); insumo técnico C40 (Pathways); Evaluación de Riesgos Climáticos (ERC U de A)',
    apoyo: ['paolaRuiz'],
    responsables: ['julianaValencia', 'harlemAcevedo', 'jeinerCastellanos', 'marcosArango', 'sebastianCartagena'],
    dependeDe: ['P1'],
    tramoPago: 'Pago 2',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P3',
    insumos:
      'Plan de Acción Climática vigente (Decreto 942/2021); 33 acciones/7 sectores clasificados por la U de A (Evaluación, Cap. 2) como inventario base; Matriz de relacionamiento PDD 2024-2027 (Anexo 8 de la Evaluación)',
    tareasPrincipales:
      '● Revisión y reformulación de objetivos estratégicos y sectoriales del Plan de Acción Climática bajo criterios SMART (específicos, medibles, realizables, realistas y temporales).\n' +
      '● Actualización de la teoría de cambio y la cadena de valor del instrumento.\n' +
      '● Revisión y depuración de acciones con dificultades de implementación derivadas de restricciones competenciales o de gobernanza\n' +
      '● Diseño e incorporación de medidas de gestión, medios de implementación, proyectos o instrumentos de implementación para el cumplimiento de los objetivos SMART y las acciones sectoriales\n' +
      '● Incorporación transversal de los enfoques de resiliencia, biodiversidad, economía circular y transición energética en el marco estratégico del plan.',
    apoyo: ['mariaJose'],
    responsables: [
      'paolaRuiz',
      'julianaValencia',
      'jeinerCastellanos',
      'marcosArango',
      'dianaRios',
      'harlemAcevedo',
      'vanessaGarcia',
      'alejandroSilva',
      'luisVahos',
      'leonOrrego',
      'danielGonzalez',
      'sebastianCartagena',
    ],
    dependeDe: ['P2'],
    tramoPago: 'Pago 3',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P4',
    insumos: 'Hallazgos del Capítulo 1 de la Evaluación (coherencia interna); Matriz de relacionamiento PDD (Anexo 8)',
    apoyo: ['mariaJose'],
    responsables: [
      'paolaRuiz',
      'julianaValencia',
      'jeinerCastellanos',
      'marcosArango',
      'dianaRios',
      'harlemAcevedo',
      'vanessaGarcia',
      'alejandroSilva',
      'luisVahos',
      'leonOrrego',
      'danielGonzalez',
      'sebastianCartagena',
    ],
    dependeDe: ['P2'],
    tramoPago: 'Pago 3',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P5',
    insumos:
      'Acciones de Alto Impacto (HIA) promovidas por el Grupo de Liderazgo Climático de Ciudades C40; metas y políticas nacionales y recomendaciones del C40; catálogo de medidas del directorio (docs. #6, #12, #13, #27, #28)',
    tareasPrincipales:
      '● Integración de las Acciones de Alto Impacto (High Impact Actions – HIA) promovidas por el Grupo de Liderazgo Climático de Ciudades C40, en coherencia con evidencia y evaluación de pertinencia y oportunidad para el Distrito\n' +
      '● Identificación y caracterización del inventario de acciones y medidas planteadas para el Plan de Acción Climática, mediante la estandarización y estructuración de metas, clasificación de opciones tecnológicas, potencial de reducción de emisiones basadas en consumo, Soluciones basadas en la Naturaleza (SbN) y medidas político-institucionales de mitigación y adaptación aplicables a los sectores priorizados del Distrito (Transporte, Residuos, Energía, Agricultura Silvicultura, Gestión del Riesgo, entre otros), garantizando su alineación con instrumentos de mayor jerarquía, metas y políticas nacionales y las recomendaciones del Grupo de Liderazgo Climático de Ciudades C40.\n' +
      '● Estimación cuantitativa del potencial de reducción de emisiones de Gases de Efecto Invernadero (expresado en ton CO2e) por medida y sector frente a la Línea Base (Business as Usual - BaU).\n' +
      '● Valoración cuali-cuantitativa del aporte directo de cada medida a la reducción de la vulnerabilidad y el aumento de la resiliencia climática del territorio.\n' +
      '● Territorialización de medidas priorizadas con base en la caracterización socioeconómica y el análisis sectorial y de factores estructurales.\n' +
      '● Diseño y aplicación de un modelo de análisis multicriterio basado en el Proceso de Redes Analíticas (ANP) para la priorización del portafolio que permita evaluar cómo las alternativas de mitigación impactan y potencian la capacidad de adaptación (co-beneficios de doble vía) y cómo interactúan con criterios socioeconómicos clave del Distrito (equidad de género, generación de empleo verde, salud pública/calidad del aire por reducción de PM 2.5 y viabilidad institucional).\n' +
      '● Modelación de escenarios y trayectorias de descarbonización y resiliencia para la implementación en el corto, mediano y largo plazo a partir de los resultados del modelo ANP, definiendo la hoja de ruta técnica e institucional de manera conjunta y con consideración de las herramientas proporcionadas por el Grupo de Liderazgo Climático de Ciudades C40',
    apoyo: ['marcosArango'],
    responsables: ['dianaRios', 'alejandroSilva', 'vanessaGarcia', 'jeinerCastellanos', 'harlemAcevedo'],
    dependeDe: ['P3', 'P4'],
    tramoPago: 'Pago 3',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P6',
    insumos:
      'Catálogo de medidas (P5); costeo preliminar; documento de Cobeneficios de la acción climática urbana (doc. #11 del directorio)',
    apoyo: ['marcosArango'],
    responsables: ['dianaRios', 'alejandroSilva', 'vanessaGarcia', 'jeinerCastellanos', 'harlemAcevedo'],
    dependeDe: ['P5'],
    tramoPago: 'Pago 3',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P7',
    insumos:
      'Resultado de P6; ROAD MAP existente (doc. #18 del directorio) como precedente directo; documento de armonización con instrumentos distritales',
    apoyo: ['marcosArango'],
    responsables: ['dianaRios', 'alejandroSilva', 'vanessaGarcia', 'jeinerCastellanos', 'harlemAcevedo'],
    dependeDe: ['P6'],
    tramoPago: 'Pago 3',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P8',
    insumos: 'Política Distrital de CTeI para la Sostenibilidad; Plan Decenal de CTeI; diagnóstico consolidado (P2)',
    tareasPrincipales:
      '● Armonización del PAC con la Política Distrital de CTeI para la Sostenibilidad y el Plan Decenal de CTeI.\n' +
      '● Identificación de retos climáticos susceptibles de ser abordados mediante innovación y tecnologías emergentes.\n' +
      '● Definición de mecanismos de articulación con el sistema de CTeI.\n' +
      '● Diseño de estrategias para la apropiación social del conocimiento climático.\n' +
      '● Identificación de oportunidades para el uso de tecnologías de Cuarta Revolución Industrial en la gestión climática.\n' +
      '● Desarrollo de herramientas para la integración del PAC con la estrategia del Plan Maestro Distrito Inteligente, relacionadas con plataformas de seguimiento de datos y asistentes inteligentes para la consulta de información.',
    apoyo: ['sebastianCartagena'],
    responsables: ['danielGonzalez', 'luisVahos', 'leonOrrego', 'mariaJose', 'julianaValencia', 'harlemAcevedo', 'lilianaRestrepo'],
    dependeDe: ['P2'],
    tramoPago: 'Pago 3',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P9',
    insumos:
      'Medidas priorizadas (P6); batería de indicadores; Seguimiento PAC-20240104 (doc. #24 del directorio — metodología e indicadores existentes)',
    apoyo: ['sebastianCartagena'],
    responsables: ['danielGonzalez', 'luisVahos', 'leonOrrego', 'mariaJose', 'julianaValencia', 'harlemAcevedo', 'lilianaRestrepo'],
    dependeDe: ['P6', 'P14'],
    tramoPago: 'Pago 3',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P10',
    insumos: 'Sistema de Gobierno de Datos Climáticos (P9)',
    apoyo: ['sebastianCartagena'],
    responsables: ['danielGonzalez', 'luisVahos', 'leonOrrego', 'mariaJose', 'julianaValencia', 'harlemAcevedo', 'lilianaRestrepo'],
    dependeDe: ['P9'],
    tramoPago: 'Pago 3',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P11',
    insumos:
      'Diagnóstico de Oportunidades de Inversión Climática del Distrito (doc. #16 del directorio); Evaluación de Riesgos Climáticos (ERC); medidas priorizadas (P6)',
    tareasPrincipales:
      '● Identificación de análisis de barreras, riesgos y gestión de la implementación. Incluye la identificación de los cuellos de botella normativos, técnicos, institucionales, políticos o de apropiación social que puedan ralentizar la ejecución de las medidas prioritarias formulando las respectivas estrategias de mitigación del riesgo.\n' +
      '● Estimación de los requerimientos de inversión (CAPEX), costos operativos (OPEX) y la viabilidad física e institucional de las medidas priorizadas para el corto y mediano plazo.\n' +
      '● Estructuración de la Cartera de Proyectos Climáticos bajo criterios de Viabilidad y Bancabilidad. La viabilidad se fundamenta en el análisis previo de barreras y sus estrategias de mitigación. La bancabilidad se determina mediante el perfilamiento financiero del costeo detallado, garantizando una articulación orgánica con el Diagnóstico de Oportunidades de Inversión Climática del Distrito para facilitar el enganche con fuentes de recursos.\n' +
      '● Diseño de la Estrategia de Financiamiento y Movilización de Recursos\n' +
      '● Estructuración del marco institucional y operativo del Sistema MERL (Monitoreo, Evaluación, Reporte y Aprendizaje) para el seguimiento del plan, definiendo la gobernanza y la interoperabilidad de datos climáticos entre las secretarías del Distrito, entes descentralizados, Área Metropolitana del Valle de Aburrá (AMVA), considerando los avances metodológicos señalados en el documento de Evaluación\n' +
      '● Revisión, ajuste y concertación de la batería de indicadores de gestión, resultados e impactos climáticos y socioeconómicos (reducción neta de GEI, inversión ejecutada, población con resiliencia aumentada), garantizando la articulación técnica con el sistema de Monitoreo a nivel nacional e instrumentos regionales.\n' +
      '● Diseño de protocolos de reporte, seguimiento y actualización del plan. Incluye el desarrollo de las guías metodológicas, periodicidad, flujos de información y asignación de responsabilidades institucionales para asegurar que el sistema MERL actúe como un eje de actualización dinámica y mejora continua del PAC',
    apoyo: ['marcosArango', 'paolaRuiz'],
    responsables: ['alejandroSilva', 'dianaRios', 'julianaValencia', 'vanessaGarcia', 'danielGonzalez', 'luisVahos', 'leonOrrego'],
    dependeDe: ['P6'],
    tramoPago: 'Pago 4',
    tramoPagoPorcentaje: 10,
  },
  {
    producto: 'P12',
    insumos:
      'Matriz de riesgos y barreras (P11); medidas priorizadas (P6); Diagnóstico de Oportunidades de Inversión Climática (doc. #16); proyectos de inversión 2021-2023 (doc. #20)',
    apoyo: ['marcosArango', 'paolaRuiz'],
    responsables: ['alejandroSilva', 'dianaRios', 'julianaValencia', 'vanessaGarcia', 'danielGonzalez', 'luisVahos', 'leonOrrego'],
    dependeDe: ['P11', 'P6'],
    tramoPago: 'Pago 4',
    tramoPagoPorcentaje: 10,
  },
  {
    producto: 'P13',
    insumos:
      'Cartera priorizada de proyectos (P12); CFF-Parques del Río Norte como precedente de estructuración financiera (doc. #29 del directorio)',
    apoyo: ['marcosArango', 'paolaRuiz'],
    responsables: ['alejandroSilva', 'dianaRios', 'julianaValencia', 'vanessaGarcia', 'danielGonzalez', 'luisVahos', 'leonOrrego'],
    dependeDe: ['P12'],
    tramoPago: 'Pago 4',
    tramoPagoPorcentaje: 10,
  },
  {
    producto: 'P14',
    insumos:
      'Medidas priorizadas (P6); Seguimiento PAC-20240104 (doc. #24, línea base de indicadores existente); reportes CDP/ICLEI (doc. #19)',
    apoyo: ['marcosArango', 'paolaRuiz'],
    responsables: ['alejandroSilva', 'dianaRios', 'julianaValencia', 'vanessaGarcia', 'danielGonzalez', 'luisVahos', 'leonOrrego'],
    dependeDe: ['P6'],
    tramoPago: 'Pago 4',
    tramoPagoPorcentaje: 10,
  },
  {
    producto: 'P15',
    insumos: 'Transversal — recoge insumos de todos los componentes a medida que avanzan',
    tareasPrincipales:
      '● Diseño e implementación de espacios de participación con actores institucionales, comunitarios, académicos y productivos.\n' +
      '● Validación técnica y social de los resultados del proceso.\n' +
      '● Elaboración de materiales de comunicación y divulgación.\n' +
      '● Diagramación y publicación de los documentos finales.',
    apoyo: ['paolaRuiz', 'mariaJose'],
    responsables: ['sebastianCartagena', 'lilianaRestrepo'],
    dependeDe: [],
    tramoPago: 'Pago 4',
    tramoPagoPorcentaje: 10,
  },
  {
    producto: 'P16',
    insumos: 'Direccionamiento estratégico (P3); Hoja de ruta 2050 (P7); Memoria participativa (P15)',
    apoyo: ['paolaRuiz', 'mariaJose'],
    responsables: ['sebastianCartagena', 'lilianaRestrepo'],
    dependeDe: ['P3', 'P7', 'P15'],
    tramoPago: 'Pago 4',
    tramoPagoPorcentaje: 10,
  },
  {
    producto: 'P17',
    insumos:
      'Direccionamiento estratégico (P3); Priorización (P6); Hoja de ruta (P7); Plan financiero (P13); Sistema MERL (P14)',
    apoyo: ['paolaRuiz', 'mariaJose'],
    responsables: ['lilianaRestrepo', 'danielGonzalez', 'luisVahos', 'leonOrrego'],
    dependeDe: ['P3', 'P6', 'P7', 'P13', 'P14'],
    tramoPago: 'Pago 4',
    tramoPagoPorcentaje: 10,
  },
  {
    producto: 'P18',
    insumos: 'Evaluación de Riesgos Climáticos (ERC U de A); equipo del Museo de Ciencia; material de divulgación',
    apoyo: ['paolaRuiz', 'mariaJose'],
    responsables: ['sebastianCartagena', 'lilianaRestrepo'],
    dependeDe: [],
    tramoPago: 'Pago 4',
    tramoPagoPorcentaje: 10,
  },
];

const REVISOR: ClavePersona = 'guillermoPenagos';
const NOTA_REVISOR =
  'Revisor final (aval): Guillermo Penagos — Consultor Experto en Planeación Climática, Política Pública y ' +
  'Equidad Territorial; da el aval final antes de enviar a la Secretaría.';

// Los 3 hitos maestros del proyecto (hoja "Resumen Ejecutivo Cronograma"),
// enganchados a la actividad de cierre de su alcance (fechas coincidentes
// con la "Entrega oficial" de esa actividad en el Cronograma Maestro).
const HITOS_MAESTROS: { nombre: string; fechaObjetivo: string; productoCierre: string }[] = [
  { nombre: 'HITO 1 — Componente 1 (C1) cerrado', fechaObjetivo: '2026-09-25', productoCierre: 'P2' },
  { nombre: 'HITO 2 — Componentes 1 a 5 (C1-C5) cerrados', fechaObjetivo: '2026-11-27', productoCierre: 'P14' },
  { nombre: 'HITO 3 — Todos los componentes (C1-C6) entregados', fechaObjetivo: '2026-12-10', productoCierre: 'P18' },
];

/** Reparte un porcentaje entre N nombres, ajustando el último para que la suma sea exacta. */
function repartir(pctTotal: number, n: number): number[] {
  if (n === 0) return [];
  const base = Math.round((pctTotal / n) * 100) / 100;
  const pesos = new Array(n).fill(base) as number[];
  const suma = pesos.reduce((a, b) => a + b, 0);
  pesos[n - 1] = Math.round((pesos[n - 1] + (pctTotal - suma)) * 100) / 100;
  return pesos;
}

async function main(): Promise<void> {
  const proyecto = await prisma.proyecto.findFirst();
  if (!proyecto) {
    throw new Error('No existe ningún Proyecto todavía. Ejecuta primero "npm run seed:pac".');
  }

  // ── 1) Crear/actualizar las 15 personas reales del equipo ─────────
  const usuarioIdPorClave = new Map<ClavePersona, string>();
  const rolColaborador = await prisma.rol.findUnique({ where: { nombre: 'colaborador' } });
  if (!rolColaborador) throw new Error('No existe el rol "colaborador". Ejecuta primero las migraciones/seed base.');

  for (const [clave, persona] of Object.entries(PERSONAS) as [ClavePersona, (typeof PERSONAS)[ClavePersona]][]) {
    const usuario = await prisma.usuario.upsert({
      where: { email: persona.email },
      update: {},
      create: {
        nombre: persona.nombre,
        email: persona.email,
        rolId: rolColaborador.id,
        estado: 'pendiente_activacion',
      },
    });
    usuarioIdPorClave.set(clave, usuario.id);
  }
  console.log(`Equipo real: ${usuarioIdPorClave.size} cuentas (correos provisionales @${DOMINIO_PROVISIONAL}).`);

  // ── 2) Revertir cualquier "Tareas principales" que una versión anterior
  // de este script haya anexado a la Fase: las tareas son subactividades
  // del entregable puntual (P1, P3, P5, P8, P11, P15), no del componente
  // completo, así que ahora viven en la descripción de esa Actividad (paso 4).
  const fases = await prisma.fase.findMany({ where: { proyectoId: proyecto.id } });
  for (const fase of fases) {
    if (!fase.descripcion?.includes('\n\nTareas principales:\n')) continue;
    const base = fase.descripcion.split('\n\nTareas principales:\n')[0];
    await prisma.fase.update({ where: { id: fase.id }, data: { descripcion: base } });
  }
  console.log('Fases: descripción restaurada (sin tareas principales; ahora van en la Actividad correspondiente).');

  // ── 3) Localizar cada Actividad P1..P18 por su prefijo de nombre ──
  const actividades = await prisma.actividad.findMany({ where: { fase: { proyectoId: proyecto.id } } });
  const actividadIdPorProducto = new Map<string, string>();
  for (const e of ENTREGABLES) {
    const act = actividades.find((a) => a.nombre.startsWith(`${e.producto} — `));
    if (!act) {
      console.warn(`Aviso: no se encontró la Actividad para ${e.producto}; se omite.`);
      continue;
    }
    actividadIdPorProducto.set(e.producto, act.id);
  }

  // ── 4) Actualizar descripción real + tramo de pago de cada Actividad ─
  for (const e of ENTREGABLES) {
    const actividadId = actividadIdPorProducto.get(e.producto);
    if (!actividadId) continue;
    const apoyoNombres = e.apoyo.map((c) => PERSONAS[c].nombre).join(', ');
    const responsablesNombres = e.responsables.map((c) => PERSONAS[c].nombre).join(', ');
    const descripcion = [
      ...(e.tareasPrincipales ? [`Tareas principales (subactividades):\n${e.tareasPrincipales}`] : []),
      `Apoyo de componente: ${apoyoNombres}`,
      `Responsables principales: ${responsablesNombres}`,
      NOTA_REVISOR,
      `Insumos de entrada necesarios: ${e.insumos}`,
    ].join('\n\n');

    await prisma.actividad.update({
      where: { id: actividadId },
      data: { descripcion, tramoPago: e.tramoPago, tramoPagoPorcentaje: e.tramoPagoPorcentaje },
    });
  }
  console.log('Actividades: descripción real (equipo + insumos) y tramo de pago actualizados.');

  // ── 5) Dependencias entre actividades (segunda pasada: ya existen todas) ─
  let dependenciasCreadas = 0;
  for (const e of ENTREGABLES) {
    const actividadId = actividadIdPorProducto.get(e.producto);
    if (!actividadId) continue;
    for (const codigoDep of e.dependeDe) {
      const dependeDeId = actividadIdPorProducto.get(codigoDep);
      if (!dependeDeId) {
        console.warn(`Aviso: ${e.producto} depende de ${codigoDep}, pero esa actividad no se encontró.`);
        continue;
      }
      await prisma.dependenciaActividad.upsert({
        where: { actividadId_dependeDeId: { actividadId, dependeDeId } },
        update: {},
        create: { actividadId, dependeDeId },
      });
      dependenciasCreadas += 1;
    }
  }
  console.log(`Dependencias entre actividades: ${dependenciasCreadas} relaciones aseguradas.`);

  // ── 6) Asignaciones (peso: 15% apoyo, 70% responsables, 15% revisor) ─
  for (const e of ENTREGABLES) {
    const actividadId = actividadIdPorProducto.get(e.producto);
    if (!actividadId) continue;

    const pesosPorUsuario = new Map<string, number>();
    const acumular = (clave: ClavePersona, peso: number) => {
      const usuarioId = usuarioIdPorClave.get(clave);
      if (!usuarioId) return;
      pesosPorUsuario.set(usuarioId, (pesosPorUsuario.get(usuarioId) ?? 0) + peso);
    };

    const pesosApoyo = repartir(15, e.apoyo.length);
    e.apoyo.forEach((clave, i) => acumular(clave, pesosApoyo[i]));

    const pesosResp = repartir(70, e.responsables.length);
    e.responsables.forEach((clave, i) => acumular(clave, pesosResp[i]));

    acumular(REVISOR, 15);

    for (const [usuarioId, peso] of pesosPorUsuario) {
      await prisma.asignacion.upsert({
        where: { actividadId_usuarioId: { actividadId, usuarioId } },
        update: { pesoTrabajoPorcentaje: peso },
        create: { actividadId, usuarioId, pesoTrabajoPorcentaje: peso },
      });
    }
  }
  console.log('Asignaciones: responsables reales vinculados a cada actividad con su peso de trabajo.');

  // ── 7) Hitos maestros del proyecto ─────────────────────────────────
  for (const hito of HITOS_MAESTROS) {
    const actividadId = actividadIdPorProducto.get(hito.productoCierre);
    if (!actividadId) continue;
    const existente = await prisma.hito.findFirst({ where: { actividadId, nombre: hito.nombre } });
    if (existente) continue;
    await prisma.hito.create({
      data: { actividadId, nombre: hito.nombre, fechaObjetivo: new Date(hito.fechaObjetivo) },
    });
  }
  console.log('Hitos maestros del proyecto (3): asegurados en su actividad de cierre.');

  console.log('\nListo. Recuerda: los correos del equipo son PROVISIONALES — reemplázalos por los reales desde el panel (Usuarios → editar) antes de que las personas activen su cuenta.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
