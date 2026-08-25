import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

// Enriquecimiento del Proyecto PAC ya sembrado (ver seed-pac.ts) con la
// "Propuesta de asignación de actividades" (Documentosbase/
// Propuesta_asignacion_actividades_PAC.xlsx, exportada a actividades-pac.json):
//
//   Componente (Fase) → Entregable (Actividad) → Actividad (Subactividad) → Integrante
//
// El porcentaje NACE en la Actividad (Subactividad) con su peso y se propaga:
//   - Entregable  = suma ponderada de sus Actividades por peso (suman 100 %).
//   - Componente  = promedio simple de sus Entregables.
//   - Total PAC   = suma ponderada de los Componentes por su peso (nº de entregables).
//
// Además siembra dos niveles de asignación:
//   1) AsignacionComponente  — distribución % de responsabilidad por Componente (suma 100 %).
//   2) AsignacionSubactividad — responsable(s) específico(s) de cada Actividad.
//
// A diferencia de seed-pac.ts, este script es de ACTUALIZACIÓN en línea:
// nunca borra ni recrea Fase/Actividad (evita perder Avances/Evidencias/
// Hitos), y es seguro de volver a ejecutar (upsert por claves estables:
// Subactividad.codigo "P1-A01", (fase,usuario), (subactividad,usuario)).
//
// Ejecutar:
//   npm run enriquecer:pac

const prisma = new PrismaClient();

// ─── Equipo real (hoja "Perfiles") ──────────────────────────────────
// Correos PROVISIONALES; un administrador los reemplaza por los reales desde
// el panel (Usuarios → editar) antes de que las personas activen su cuenta.
const DOMINIO_PROVISIONAL = 'centrodepensamientoitm.cloud';

// Clave interna → { nombre EXACTO como aparece en actividades-pac.json, correo }.
const PERSONAS = {
  mariaJose: { nombre: 'María José Suárez', email: `maria.suarez@${DOMINIO_PROVISIONAL}` },
  paolaRuiz: { nombre: 'Paola Andrea Ruiz Franco', email: `paola.ruiz@${DOMINIO_PROVISIONAL}` },
  julianaValencia: { nombre: 'Juliana Valencia', email: `juliana.valencia@${DOMINIO_PROVISIONAL}` },
  jeinerCastellanos: {
    nombre: 'Jeiner de Jesús Castellanos Barliza',
    email: `jeiner.castellanos@${DOMINIO_PROVISIONAL}`,
  },
  marcosArango: { nombre: 'Marcos Arango Tamayo', email: `marcos.arango@${DOMINIO_PROVISIONAL}` },
  dianaRios: {
    nombre: 'Diana Carolina Ríos Echeverri',
    email: `diana.rios@${DOMINIO_PROVISIONAL}`,
  },
  harlemAcevedo: {
    nombre: 'Harlem Acevedo Agudelo',
    email: `harlem.acevedo@${DOMINIO_PROVISIONAL}`,
  },
  vanessaGarcia: { nombre: 'Vanessa García Leoz', email: `vanessa.garcia@${DOMINIO_PROVISIONAL}` },
  alejandroSilva: {
    nombre: 'Alejandro Silva Cortés',
    email: `alejandro.silva@${DOMINIO_PROVISIONAL}`,
  },
  guillermoPenagos: {
    nombre: 'Guillermo Penagos',
    email: `guillermo.penagos@${DOMINIO_PROVISIONAL}`,
  },
  luisVahos: { nombre: 'Luis Eduardo Vahos Hernández', email: `luis.vahos@${DOMINIO_PROVISIONAL}` },
  leonOrrego: { nombre: 'León Darío Orrego Espejo', email: `leon.orrego@${DOMINIO_PROVISIONAL}` },
  danielGonzalez: {
    nombre: 'Daniel González Montoya',
    email: `daniel.gonzalez@${DOMINIO_PROVISIONAL}`,
  },
  sebastianCartagena: {
    nombre: 'Sebastián Cartagena',
    email: `sebastian.cartagena@${DOMINIO_PROVISIONAL}`,
  },
  lilianaRestrepo: { nombre: 'Liliana Restrepo', email: `liliana.restrepo@${DOMINIO_PROVISIONAL}` },
  // Revisora final institucional (5 %). Nombre completo por confirmar; correo
  // provisional a reemplazar por el real de la Secretaría de Medio Ambiente.
  juanaSma: {
    nombre: 'Juana — Secretaría de Medio Ambiente',
    email: `juana.sma@${DOMINIO_PROVISIONAL}`,
  },
} as const;

// ─── Metadatos por entregable (hojas "Cronograma"): insumos, dependencias y
// tramos de pago. NO los trae la Propuesta de asignación y siguen vigentes. ─
interface MetaEntregable {
  producto: string;
  insumos: string;
  dependeDe: string[];
  tramoPago: string;
  tramoPagoPorcentaje: number;
}

const META: MetaEntregable[] = [
  {
    producto: 'P1',
    insumos:
      'Inventarios de emisiones de GEI; soporte técnico C40; Evaluación de Riesgos Climáticos; datos DANE/POT + equidad territorial; Evaluación de Necesidades de Inclusión Social y Grupos Vulnerables',
    dependeDe: [],
    tramoPago: 'Pago 2',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P2',
    insumos:
      'Inventarios de emisiones GEI (serie 2015-2023); insumo técnico C40 (Pathways); Evaluación de Riesgos Climáticos (ERC U de A)',
    dependeDe: ['P1'],
    tramoPago: 'Pago 2',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P3',
    insumos:
      'Plan de Acción Climática vigente (Decreto 942/2021); 33 acciones/7 sectores (Evaluación, Cap. 2); Matriz de relacionamiento PDD 2024-2027 (Anexo 8)',
    dependeDe: ['P2'],
    tramoPago: 'Pago 3',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P4',
    insumos:
      'Hallazgos del Capítulo 1 de la Evaluación (coherencia interna); Matriz de relacionamiento PDD (Anexo 8)',
    dependeDe: ['P2'],
    tramoPago: 'Pago 3',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P5',
    insumos:
      'Acciones de Alto Impacto (HIA) C40; metas y políticas nacionales; catálogo de medidas del directorio',
    dependeDe: ['P3', 'P4'],
    tramoPago: 'Pago 3',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P6',
    insumos:
      'Catálogo de medidas (P5); costeo preliminar; documento de Cobeneficios de la acción climática urbana',
    dependeDe: ['P5'],
    tramoPago: 'Pago 3',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P7',
    insumos:
      'Resultado de P6; ROAD MAP existente como precedente directo; armonización con instrumentos distritales',
    dependeDe: ['P6'],
    tramoPago: 'Pago 3',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P8',
    insumos:
      'Política Distrital de CTeI para la Sostenibilidad; Plan Decenal de CTeI; diagnóstico consolidado (P2)',
    dependeDe: ['P2'],
    tramoPago: 'Pago 3',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P9',
    insumos:
      'Medidas priorizadas (P6); batería de indicadores; Seguimiento PAC-20240104 (metodología e indicadores)',
    dependeDe: ['P6', 'P14'],
    tramoPago: 'Pago 3',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P10',
    insumos: 'Sistema de Gobierno de Datos Climáticos (P9)',
    dependeDe: ['P9'],
    tramoPago: 'Pago 3',
    tramoPagoPorcentaje: 35,
  },
  {
    producto: 'P11',
    insumos:
      'Diagnóstico de Oportunidades de Inversión Climática; Evaluación de Riesgos Climáticos; medidas priorizadas (P6)',
    dependeDe: ['P6'],
    tramoPago: 'Pago 4',
    tramoPagoPorcentaje: 10,
  },
  {
    producto: 'P12',
    insumos:
      'Matriz de riesgos y barreras (P11); medidas priorizadas (P6); Diagnóstico de Oportunidades de Inversión; proyectos 2021-2023',
    dependeDe: ['P11', 'P6'],
    tramoPago: 'Pago 4',
    tramoPagoPorcentaje: 10,
  },
  {
    producto: 'P13',
    insumos:
      'Cartera priorizada de proyectos (P12); CFF-Parques del Río Norte como precedente de estructuración financiera',
    dependeDe: ['P12'],
    tramoPago: 'Pago 4',
    tramoPagoPorcentaje: 10,
  },
  {
    producto: 'P14',
    insumos:
      'Medidas priorizadas (P6); Seguimiento PAC-20240104 (línea base de indicadores); reportes CDP/ICLEI',
    dependeDe: ['P6'],
    tramoPago: 'Pago 4',
    tramoPagoPorcentaje: 10,
  },
  {
    producto: 'P15',
    insumos: 'Transversal — recoge insumos de todos los componentes a medida que avanzan',
    dependeDe: [],
    tramoPago: 'Pago 4',
    tramoPagoPorcentaje: 10,
  },
  {
    producto: 'P16',
    insumos:
      'Direccionamiento estratégico (P3); Hoja de ruta 2050 (P7); Memoria participativa (P15)',
    dependeDe: ['P3', 'P7', 'P15'],
    tramoPago: 'Pago 4',
    tramoPagoPorcentaje: 10,
  },
  {
    producto: 'P17',
    insumos:
      'Direccionamiento estratégico (P3); Priorización (P6); Hoja de ruta (P7); Plan financiero (P13); Sistema MERL (P14)',
    dependeDe: ['P3', 'P6', 'P7', 'P13', 'P14'],
    tramoPago: 'Pago 4',
    tramoPagoPorcentaje: 10,
  },
  {
    producto: 'P18',
    insumos:
      'Evaluación de Riesgos Climáticos (ERC U de A); equipo del Museo de Ciencia; material de divulgación',
    dependeDe: [],
    tramoPago: 'Pago 4',
    tramoPagoPorcentaje: 10,
  },
];

// ─── Actividades por entregable (generado desde el Excel) ────────────
interface ActividadFuente {
  codigo: string;
  etapa: string;
  descripcion: string;
  responsables: string[]; // nombres canónicos (usuarios conocidos)
  apoyos: string[]; // nombres canónicos (usuarios conocidos)
  apoyosTexto: string[]; // roles sin cuenta (texto libre)
  pesoPorcentaje: number;
  fechaInicio: string | null;
  fechaFin: string | null;
  criterio: string | null;
}
interface EntregableFuente {
  codigo: string;
  componente: string;
  nombre: string;
  actividades: ActividadFuente[];
}
interface ActividadesJson {
  entregables: EntregableFuente[];
}

const DATOS = JSON.parse(
  readFileSync(join(__dirname, 'actividades-pac.json'), 'utf-8'),
) as ActividadesJson;

// Los 3 hitos maestros del proyecto (hoja "Resumen Ejecutivo Cronograma").
const HITOS_MAESTROS: { nombre: string; fechaObjetivo: string; productoCierre: string }[] = [
  {
    nombre: 'HITO 1 — Componente 1 (C1) cerrado',
    fechaObjetivo: '2026-09-25',
    productoCierre: 'P2',
  },
  {
    nombre: 'HITO 2 — Componentes 1 a 5 (C1-C5) cerrados',
    fechaObjetivo: '2026-11-27',
    productoCierre: 'P14',
  },
  {
    nombre: 'HITO 3 — Todos los componentes (C1-C6) entregados',
    fechaObjetivo: '2026-12-10',
    productoCierre: 'P18',
  },
];

/** Reparte un porcentaje entre N ítems, ajustando el último para que sume exacto. */
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

  // ── 1) Crear/actualizar las personas del equipo (incluida Juana) ──
  const rolColaborador = await prisma.rol.findUnique({ where: { nombre: 'colaborador' } });
  if (!rolColaborador)
    throw new Error('No existe el rol "colaborador". Ejecuta primero las migraciones/seed base.');

  const usuarioIdPorNombre = new Map<string, string>();
  for (const persona of Object.values(PERSONAS)) {
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
    usuarioIdPorNombre.set(persona.nombre, usuario.id);
  }
  console.log(
    `Equipo: ${usuarioIdPorNombre.size} cuentas (correos provisionales @${DOMINIO_PROVISIONAL}).`,
  );

  const idDe = (nombre: string): string | undefined => usuarioIdPorNombre.get(nombre);

  // ── 2) Localizar cada Actividad P1..P18 (Entregable) por prefijo de nombre ─
  const actividades = await prisma.actividad.findMany({
    where: { fase: { proyectoId: proyecto.id } },
  });
  const actividadIdPorProducto = new Map<string, string>();
  for (const e of DATOS.entregables) {
    const act = actividades.find((a) => a.nombre.startsWith(`${e.codigo} — `));
    if (!act) {
      console.warn(`Aviso: no se encontró la Actividad (Entregable) para ${e.codigo}; se omite.`);
      continue;
    }
    actividadIdPorProducto.set(e.codigo, act.id);
  }

  // ── 3) Descripción + tramo de pago del Entregable ─────────────────
  for (const meta of META) {
    const actividadId = actividadIdPorProducto.get(meta.producto);
    if (!actividadId) continue;
    const descripcion = `Insumos de entrada necesarios: ${meta.insumos}`;
    await prisma.actividad.update({
      where: { id: actividadId },
      data: {
        descripcion,
        tramoPago: meta.tramoPago,
        tramoPagoPorcentaje: meta.tramoPagoPorcentaje,
      },
    });
  }
  console.log('Entregables: insumos y tramo de pago actualizados.');

  // ── 4) Actividades (Subactividades) por entregable ────────────────
  // Limpieza previa: quitar subactividades heredadas (sin código, de la versión
  // anterior "Tareas principales") SOLO si no tienen avances registrados.
  let legadoBorrado = 0;
  let legadoConservado = 0;
  for (const e of DATOS.entregables) {
    const actividadId = actividadIdPorProducto.get(e.codigo);
    if (!actividadId) continue;
    const codigosValidos = new Set(e.actividades.map((a) => a.codigo));
    const existentes = await prisma.subactividad.findMany({ where: { actividadId } });
    for (const sub of existentes) {
      if (sub.codigo && codigosValidos.has(sub.codigo)) continue; // se actualiza abajo
      const conAvances =
        (await prisma.avanceSubactividad.count({ where: { subactividadId: sub.id } })) > 0;
      if (conAvances) {
        legadoConservado += 1;
        continue; // no destruir avances reales
      }
      await prisma.subactividad.delete({ where: { id: sub.id } });
      legadoBorrado += 1;
    }
  }
  if (legadoBorrado || legadoConservado) {
    console.log(
      `Subactividades heredadas: ${legadoBorrado} eliminadas (sin avances)` +
        (legadoConservado
          ? `, ${legadoConservado} conservadas por tener avances (revisar a mano).`
          : '.'),
    );
  }

  // Upsert de cada Actividad por (actividadId, codigo) y su responsable(s).
  let creadas = 0;
  let actualizadas = 0;
  for (const e of DATOS.entregables) {
    const actividadId = actividadIdPorProducto.get(e.codigo);
    if (!actividadId) continue;

    for (const [i, a] of e.actividades.entries()) {
      const nota = a.apoyosTexto.length ? `Apoyos: ${a.apoyosTexto.join('; ')}` : null;
      const datos = {
        etapa: a.etapa,
        descripcion: a.descripcion,
        orden: i,
        pesoPorcentaje: a.pesoPorcentaje,
        fechaInicioPlan: a.fechaInicio ? new Date(a.fechaInicio) : null,
        fechaFinPlan: a.fechaFin ? new Date(a.fechaFin) : null,
        criterioTerminado: a.criterio,
        nota,
      };
      const existente = await prisma.subactividad.findFirst({
        where: { actividadId, codigo: a.codigo },
      });
      const sub = existente
        ? ((actualizadas += 1),
          await prisma.subactividad.update({ where: { id: existente.id }, data: datos }))
        : ((creadas += 1),
          await prisma.subactividad.create({ data: { actividadId, codigo: a.codigo, ...datos } }));

      // Responsable(s) de la Actividad (AsignacionSubactividad, informativa).
      // Responsables comparten el 85 %; apoyos con cuenta, el 15 %. Sin apoyos,
      // los responsables comparten el 100 %.
      const respIds = a.responsables.map(idDe).filter((x): x is string => !!x);
      const apoyoIds = a.apoyos.map(idDe).filter((x): x is string => !!x);
      const pesos = new Map<string, number>();
      if (respIds.length && apoyoIds.length) {
        repartir(85, respIds.length).forEach((p, k) =>
          pesos.set(respIds[k], (pesos.get(respIds[k]) ?? 0) + p),
        );
        repartir(15, apoyoIds.length).forEach((p, k) =>
          pesos.set(apoyoIds[k], (pesos.get(apoyoIds[k]) ?? 0) + p),
        );
      } else if (respIds.length) {
        repartir(100, respIds.length).forEach((p, k) =>
          pesos.set(respIds[k], (pesos.get(respIds[k]) ?? 0) + p),
        );
      } else if (apoyoIds.length) {
        repartir(100, apoyoIds.length).forEach((p, k) =>
          pesos.set(apoyoIds[k], (pesos.get(apoyoIds[k]) ?? 0) + p),
        );
      }

      // Sincronizar: quitar asignaciones de usuarios ya no listados.
      const vigentes = new Set(pesos.keys());
      const prev = await prisma.asignacionSubactividad.findMany({
        where: { subactividadId: sub.id },
      });
      for (const p of prev) {
        if (!vigentes.has(p.usuarioId)) {
          await prisma.asignacionSubactividad.delete({ where: { id: p.id } });
        }
      }
      for (const [usuarioId, peso] of pesos) {
        await prisma.asignacionSubactividad.upsert({
          where: { subactividadId_usuarioId: { subactividadId: sub.id, usuarioId } },
          update: { pesoTrabajoPorcentaje: peso },
          create: { subactividadId: sub.id, usuarioId, pesoTrabajoPorcentaje: peso },
        });
      }
    }

    // El avance del Entregable se deriva de sus Actividades (suma ponderada);
    // recalcular el caché por si el script corre tras haber avances.
    const subs = await prisma.subactividad.findMany({ where: { actividadId } });
    const sumaPesos = subs.reduce((acc, s) => acc + s.pesoPorcentaje, 0);
    const avance =
      subs.length === 0
        ? 0
        : sumaPesos === 0
          ? subs.reduce((acc, s) => acc + s.avancePorcentaje, 0) / subs.length
          : subs.reduce((acc, s) => acc + (s.pesoPorcentaje / sumaPesos) * s.avancePorcentaje, 0);
    await prisma.actividad.update({
      where: { id: actividadId },
      data: { avancePorcentaje: avance },
    });
  }
  console.log(
    `Actividades: ${creadas} creadas, ${actualizadas} actualizadas (con peso, fechas y criterio).`,
  );

  // ── 5) Asignación por Componente (Fase): distribución % que suma 100 ─
  // Cada Actividad reparte su peso: 85 % a responsables, 15 % a apoyos con
  // cuenta; se acumula por Componente y se normaliza a 100 %.
  const fases = await prisma.fase.findMany({ where: { proyectoId: proyecto.id } });
  const faseIdPorCodigo = new Map<string, string>();
  for (const f of fases) {
    const cod = f.nombre.split(' — ')[0];
    faseIdPorCodigo.set(cod, f.id);
  }

  const creditoPorComponente = new Map<string, Map<string, number>>(); // comp → (usuarioId → crédito)
  for (const e of DATOS.entregables) {
    const acc = creditoPorComponente.get(e.componente) ?? new Map<string, number>();
    for (const a of e.actividades) {
      const respIds = a.responsables.map(idDe).filter((x): x is string => !!x);
      const apoyoIds = a.apoyos.map(idDe).filter((x): x is string => !!x);
      const sumar = (id: string, v: number) => acc.set(id, (acc.get(id) ?? 0) + v);
      if (respIds.length && apoyoIds.length) {
        respIds.forEach((id) => sumar(id, (a.pesoPorcentaje * 0.85) / respIds.length));
        apoyoIds.forEach((id) => sumar(id, (a.pesoPorcentaje * 0.15) / apoyoIds.length));
      } else if (respIds.length) {
        respIds.forEach((id) => sumar(id, a.pesoPorcentaje / respIds.length));
      } else if (apoyoIds.length) {
        apoyoIds.forEach((id) => sumar(id, a.pesoPorcentaje / apoyoIds.length));
      }
    }
    creditoPorComponente.set(e.componente, acc);
  }

  let asignacionesComp = 0;
  for (const [comp, creditos] of creditoPorComponente) {
    const faseId = faseIdPorCodigo.get(comp);
    if (!faseId) {
      console.warn(
        `Aviso: no se encontró la Fase para el componente ${comp}; se omite su asignación.`,
      );
      continue;
    }
    const total = [...creditos.values()].reduce((a, b) => a + b, 0);
    if (total === 0) continue;
    const entradas = [...creditos.entries()];
    // Normalizar a 100 con redondeo a 2 decimales, ajustando el último.
    let acumulado = 0;
    const normalizados = entradas.map(([usuarioId, v], i) => {
      const pct =
        i === entradas.length - 1
          ? Math.round((100 - acumulado) * 100) / 100
          : Math.round((v / total) * 100 * 100) / 100;
      acumulado += pct;
      return { usuarioId, pct };
    });

    const vigentes = new Set(normalizados.map((n) => n.usuarioId));
    const prev = await prisma.asignacionComponente.findMany({ where: { faseId } });
    for (const p of prev) {
      if (!vigentes.has(p.usuarioId)) {
        await prisma.asignacionComponente.delete({ where: { id: p.id } });
      }
    }
    for (const n of normalizados) {
      await prisma.asignacionComponente.upsert({
        where: { faseId_usuarioId: { faseId, usuarioId: n.usuarioId } },
        update: { pesoPorcentaje: n.pct },
        create: { faseId, usuarioId: n.usuarioId, pesoPorcentaje: n.pct },
      });
      asignacionesComp += 1;
    }
  }
  console.log(
    `Asignación por Componente: ${asignacionesComp} participaciones (suma 100 % por componente).`,
  );

  // ── 6) Dependencias entre entregables ─────────────────────────────
  let dependenciasCreadas = 0;
  for (const meta of META) {
    const actividadId = actividadIdPorProducto.get(meta.producto);
    if (!actividadId) continue;
    for (const codigoDep of meta.dependeDe) {
      const dependeDeId = actividadIdPorProducto.get(codigoDep);
      if (!dependeDeId) continue;
      await prisma.dependenciaActividad.upsert({
        where: { actividadId_dependeDeId: { actividadId, dependeDeId } },
        update: {},
        create: { actividadId, dependeDeId },
      });
      dependenciasCreadas += 1;
    }
  }
  console.log(`Dependencias entre entregables: ${dependenciasCreadas} relaciones aseguradas.`);

  // ── 7) Hitos maestros del proyecto ────────────────────────────────
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

  console.log(
    '\nListo. Recuerda: los correos del equipo (incluida Juana) son PROVISIONALES — ' +
      'reemplázalos por los reales desde el panel (Usuarios → editar) antes de que activen su cuenta.',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
