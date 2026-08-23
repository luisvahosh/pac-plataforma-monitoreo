import { PrismaClient } from '@prisma/client';

// Semilla del Proyecto real: Plan de Acción Climática (PAC) de Medellín.
// Datos extraídos de los documentos base del proyecto (cronograma de ruta
// crítica y estructura por componente): 6 componentes estratégicos (C1-C6)
// más la fase de Preparación, y sus 18 entregables (P1-P18) con fechas reales
// de inicio, borrador técnico, revisión interna y entrega oficial.
//
// Ejecutar UNA sola vez (es idempotente: si ya existe un Proyecto, no hace nada):
//   npm run seed:pac

const prisma = new PrismaClient();

interface EntregableFuente {
  producto: string;
  descripcion: string;
  inicio: string; // ISO
  borrador: string;
  revision: string;
  entrega: string;
  responsable: string;
  hito?: string;
}

interface FaseFuente {
  codigo: string;
  nombre: string;
  descripcion: string;
  orden: number;
  entregables: EntregableFuente[];
}

// Fuente: cronograma_ruta_critica_PAC_Medellin.xlsx (hoja "Cronograma Maestro")
// y Documento estructura aplicativo PAC.xlsx.
const FASES: FaseFuente[] = [
  {
    codigo: 'PREP',
    nombre: 'Preparación',
    descripcion: 'Plan de trabajo, metodología, cronograma y acuerdos de trabajo del equipo consultor.',
    orden: 0,
    entregables: [
      {
        producto: 'POI / metodología',
        descripcion: 'Plan de trabajo, metodología, cronograma y acuerdos de trabajo',
        inicio: '2026-08-18',
        borrador: '2026-08-28',
        revision: '2026-09-01',
        entrega: '2026-09-04',
        responsable: 'Dirección / Coordinación',
        hito: 'Primer paquete contractual',
      },
    ],
  },
  {
    codigo: 'C1',
    nombre: 'Evidencia, Diagnóstico y Prospectiva Climática',
    descripcion:
      'Establecer la base empírica y científica que soporta la revisión, actualización y ajuste del Plan de Acción Climática.',
    orden: 1,
    entregables: [
      {
        producto: 'P1',
        descripcion:
          'Documento de caracterización socioeconómica, vulnerabilidad y brechas de equidad para la acción climática',
        inicio: '2026-08-18',
        borrador: '2026-09-11',
        revision: '2026-09-14',
        entrega: '2026-09-18',
        responsable: 'Equipo C1',
        hito: 'Hito C1 parcial',
      },
      {
        producto: 'P2',
        descripcion: 'Capítulo de diagnóstico y prospectiva climática consolidado',
        inicio: '2026-08-18',
        borrador: '2026-09-18',
        revision: '2026-09-21',
        entrega: '2026-09-25',
        responsable: 'Equipo C1',
        hito: 'HITO 1: C1 cerrado antes de Semana del Clima',
      },
    ],
  },
  {
    codigo: 'C2',
    nombre: 'Estructura Estratégica',
    descripcion:
      'Actualizar la estructura estratégica y programática del PAC, fortaleciendo su coherencia interna, su orientación a resultados y su alineación con los instrumentos nacionales, regionales y distritales vigentes.',
    orden: 2,
    entregables: [
      {
        producto: 'P3',
        descripcion: 'Capítulo de direccionamiento estratégico del PAC ajustado',
        inicio: '2026-09-07',
        borrador: '2026-10-09',
        revision: '2026-10-12',
        entrega: '2026-10-16',
        responsable: 'Equipo C2',
        hito: 'C2 estratégico',
      },
      {
        producto: 'P4',
        descripcion: 'Matriz de coherencia estratégica del Plan',
        inicio: '2026-09-14',
        borrador: '2026-10-09',
        revision: '2026-10-12',
        entrega: '2026-10-16',
        responsable: 'Equipo C2',
        hito: 'C2 cerrado',
      },
    ],
  },
  {
    codigo: 'C3',
    nombre: 'Identificación y Priorización de Medidas de Mitigación y Adaptación',
    descripcion:
      'Definir un portafolio articulado de medidas de mitigación y adaptación para el Distrito de Medellín, que oriente la hoja de ruta hacia la carbono-neutralidad y la adaptación climática al año 2050.',
    orden: 3,
    entregables: [
      {
        producto: 'P5',
        descripcion: 'Catálogo caracterizado de medidas de mitigación y adaptación',
        inicio: '2026-09-21',
        borrador: '2026-10-20',
        revision: '2026-10-21',
        entrega: '2026-10-23',
        responsable: 'Equipo C3',
        hito: 'Base para priorización',
      },
      {
        producto: 'P6',
        descripcion: 'Documento técnico de priorización de medidas mediante AHP/ANP',
        inicio: '2026-10-12',
        borrador: '2026-10-27',
        revision: '2026-10-28',
        entrega: '2026-10-30',
        responsable: 'Equipo C3',
        hito: 'Hito de integración transversal',
      },
      {
        producto: 'P7',
        descripcion: 'Hoja de ruta de descarbonización y resiliencia climática al 2050',
        inicio: '2026-10-19',
        borrador: '2026-11-03',
        revision: '2026-11-04',
        entrega: '2026-11-06',
        responsable: 'Equipo C3',
        hito: 'C3 cerrado',
      },
    ],
  },
  {
    codigo: 'C4',
    nombre: 'Integración de Ciencia, Tecnología e Innovación (CTeI)',
    descripcion:
      'Incorporar la vocación de Distrito Especial de Ciencia, Tecnología e Innovación como habilitador de la acción climática y la transición ecológica.',
    orden: 4,
    entregables: [
      {
        producto: 'P8',
        descripcion: 'Hoja de articulación con sistema CTeI, apropiación social y agenda de innovación',
        inicio: '2026-09-21',
        borrador: '2026-10-27',
        revision: '2026-10-28',
        entrega: '2026-10-30',
        responsable: 'Equipo C4',
        hito: 'C4 parcial',
      },
      {
        producto: 'P9',
        descripcion: 'Sistema de Gobierno de Datos Climáticos, indicadores y dashboard MERL',
        inicio: '2026-10-12',
        borrador: '2026-11-10',
        revision: '2026-11-11',
        entrega: '2026-11-13',
        responsable: 'Equipo C4',
        hito: 'Requiere integración técnica',
      },
      {
        producto: 'P10',
        descripcion: 'Asistente inteligente para consulta y trazabilidad de información climática',
        inicio: '2026-10-26',
        borrador: '2026-11-17',
        revision: '2026-11-18',
        entrega: '2026-11-20',
        responsable: 'Equipo C4',
        hito: 'C4 cerrado',
      },
    ],
  },
  {
    codigo: 'C5',
    nombre: 'Implementación, Financiamiento y Sistema MERL',
    descripcion:
      'Estructurar la arquitectura financiera, operativa y de gobernanza del PAC mediante mecanismos que faciliten su implementación efectiva y evaluación continua.',
    orden: 5,
    entregables: [
      {
        producto: 'P11',
        descripcion: 'Matriz de gestión de riesgos y barreras para la implementación',
        inicio: '2026-10-19',
        borrador: '2026-11-10',
        revision: '2026-11-11',
        entrega: '2026-11-13',
        responsable: 'Equipo C5',
        hito: 'C5 parcial',
      },
      {
        producto: 'P12',
        descripcion: 'Cartera priorizada de proyectos climáticos bancables',
        inicio: '2026-10-26',
        borrador: '2026-11-17',
        revision: '2026-11-18',
        entrega: '2026-11-20',
        responsable: 'Equipo C5',
        hito: 'C5 parcial',
      },
      {
        producto: 'P13',
        descripcion: 'Plan financiero y estrategia de movilización de recursos',
        inicio: '2026-11-02',
        borrador: '2026-11-24',
        revision: '2026-11-25',
        entrega: '2026-11-27',
        responsable: 'Equipo C5',
        hito: 'C5 cerrado',
      },
      {
        producto: 'P14',
        descripcion: 'Documento técnico de formulación del Sistema MERL',
        inicio: '2026-10-19',
        borrador: '2026-11-24',
        revision: '2026-11-25',
        entrega: '2026-11-27',
        responsable: 'Equipo C5',
        hito: 'C5 cerrado',
      },
    ],
  },
  {
    codigo: 'C6',
    nombre: 'Participación, Gobernanza y Comunicación',
    descripcion:
      'Fortalecer la gobernanza climática mediante mecanismos de participación, apropiación social y divulgación de los resultados del proceso de actualización.',
    orden: 6,
    entregables: [
      {
        producto: 'P15',
        descripcion: 'Memoria del proceso participativo y estrategia de comunicación y divulgación',
        inicio: '2026-09-01',
        borrador: '2026-11-24',
        revision: '2026-11-25',
        entrega: '2026-11-30',
        responsable: 'Equipo C6',
        hito: 'Producto acumulativo 2026',
      },
      {
        producto: 'P16',
        descripcion: 'Versión ciudadana del PAC',
        inicio: '2026-10-19',
        borrador: '2026-12-02',
        revision: '2026-12-03',
        entrega: '2026-12-04',
        responsable: 'Equipo C6',
        hito: 'C6 — cierre de versión ciudadana',
      },
      {
        producto: 'P17',
        descripcion: 'Publicación digital del PAC actualizado',
        inicio: '2026-10-26',
        borrador: '2026-12-04',
        revision: '2026-12-07',
        entrega: '2026-12-08',
        responsable: 'Equipo C6',
        hito: 'C6 — publicación digital',
      },
      {
        producto: 'P18',
        descripcion: 'Documento divulgativo de la Evaluación de Riesgos Climáticos',
        inicio: '2026-10-01',
        borrador: '2026-12-02',
        revision: '2026-12-03',
        entrega: '2026-12-10',
        responsable: 'Equipo C6',
        hito: 'C6 — fecha máxima 10/12/2026',
      },
    ],
  },
];

// Peso de cada Fase proporcional al número de entregables (decisión provisional
// y ajustable por un Administrador desde el panel; RN-02 exige que sumen 100 %).
function pesosPorNumeroDeEntregables(fases: FaseFuente[]): Map<string, number> {
  const total = fases.reduce((acc, f) => acc + f.entregables.length, 0);
  const pesos = new Map<string, number>();
  let acumulado = 0;
  fases.forEach((f, i) => {
    const esUltima = i === fases.length - 1;
    const peso = esUltima
      ? Math.round((100 - acumulado) * 100) / 100
      : Math.round((f.entregables.length / total) * 100);
    pesos.set(f.codigo, peso);
    acumulado += peso;
  });
  return pesos;
}

async function main(): Promise<void> {
  const existente = await prisma.proyecto.findFirst();
  if (existente) {
    // eslint-disable-next-line no-console
    console.log(`Ya existe un Proyecto ("${existente.nombre}"). No se crea ninguno nuevo.`);
    return;
  }

  const proyecto = await prisma.proyecto.create({
    data: {
      nombre: 'Plan de Acción Climática (PAC) de Medellín',
      objetivos:
        'Actualización del Plan de Acción Climática del Distrito de Medellín, con base en evidencia técnica, ' +
        'alineación estratégica, priorización de medidas de mitigación y adaptación, integración de ciencia, ' +
        'tecnología e innovación, estructuración financiera y de gobernanza (Sistema MERL), y participación ' +
        'ciudadana, hacia la carbono-neutralidad y la resiliencia climática al año 2050.',
      fechaInicio: new Date('2026-08-18'),
      fechaFin: new Date('2026-12-10'),
    },
  });

  const pesos = pesosPorNumeroDeEntregables(FASES);

  for (const faseFuente of FASES) {
    const fase = await prisma.fase.create({
      data: {
        proyectoId: proyecto.id,
        nombre: `${faseFuente.codigo !== 'PREP' ? faseFuente.codigo + ' — ' : ''}${faseFuente.nombre}`,
        descripcion: faseFuente.descripcion,
        pesoPorcentaje: pesos.get(faseFuente.codigo) ?? 0,
        orden: faseFuente.orden,
      },
    });

    for (const e of faseFuente.entregables) {
      const actividad = await prisma.actividad.create({
        data: {
          faseId: fase.id,
          nombre: `${e.producto} — ${e.descripcion}`,
          descripcion: `Responsable líder: ${e.responsable}`,
          fechaInicioPlan: new Date(e.inicio),
          fechaFinPlan: new Date(e.entrega),
        },
      });

      await prisma.hito.create({
        data: { actividadId: actividad.id, nombre: 'Borrador técnico', fechaObjetivo: new Date(e.borrador) },
      });
      await prisma.hito.create({
        data: { actividadId: actividad.id, nombre: 'Revisión interna', fechaObjetivo: new Date(e.revision) },
      });
      if (e.hito) {
        await prisma.hito.create({
          data: { actividadId: actividad.id, nombre: `Entrega oficial — ${e.hito}`, fechaObjetivo: new Date(e.entrega) },
        });
      }
    }
  }

  const sumaPesos = [...pesos.values()].reduce((a, b) => a + b, 0);
  // eslint-disable-next-line no-console
  console.log(
    `Proyecto "${proyecto.nombre}" creado: ${FASES.length} fases, ` +
      `${FASES.reduce((a, f) => a + f.entregables.length, 0)} actividades. Suma de pesos: ${sumaPesos}%.`,
  );
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
