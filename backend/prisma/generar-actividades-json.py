# -*- coding: utf-8 -*-
"""Genera backend/prisma/actividades-pac.json desde el Excel oficial de
actividades, personas y pesos del PAC.

Uso (con openpyxl instalado):
    python backend/prisma/generar-actividades-json.py

Si el .xlsx está bloqueado por Excel/OneDrive, ciérralo o cópialo antes.

Fuente oficial (reemplaza a Propuesta_asignacion_actividades_PAC.xlsx):
    Documentosbase/PAC_actividades_personas_y_pesos.xlsx
      - Hoja "Entregables": nombre y componente de cada Entregable (P1..Pn).
      - Hoja "Actividades": Actividad (nivel 3, BD Subactividad) por
        Entregable, con su código, etapa, descripción, peso en el
        entregable (suma 100 % por entregable) y criterios de evidencia.
      - Hoja "Asignaciones": persona/rol/peso EXACTO de cada colaborador
        dentro de cada Actividad (suma 100 % por actividad).
"""
import openpyxl
import json
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.normpath(
    os.path.join(AQUI, '..', '..', 'Documentosbase', 'PAC_actividades_personas_y_pesos.xlsx')
)
OUT = os.path.join(AQUI, 'actividades-pac.json')

HEADER_ROW_IDX = 4  # fila 5 (0-indexed) en las 3 hojas usadas


def leer_hoja(ws):
    filas = list(ws.iter_rows(values_only=True))
    header = filas[HEADER_ROW_IDX]
    idx = {h: i for i, h in enumerate(header) if h}
    datos = [r for r in filas[HEADER_ROW_IDX + 1 :] if r and r[0]]
    return idx, datos


def limpio(v):
    if v is None:
        return None
    s = str(v).strip()
    return s if s else None


def main():
    wb = openpyxl.load_workbook(SRC, data_only=True)

    # ── Entregables: nombre + componente ──────────────────────────────
    idxE, filasE = leer_hoja(wb['Entregables'])
    entregables_meta = {}
    orden = []
    for r in filasE:
        codigo = r[idxE['Entregable']]
        entregables_meta[codigo] = {
            'codigo': codigo,
            'componente': r[idxE['Componente']],
            'nombre': limpio(r[idxE['Nombre entregable']]),
        }
        orden.append(codigo)

    # ── Asignaciones: peso exacto por persona y actividad ─────────────
    idxA, filasA = leer_hoja(wb['Asignaciones'])
    asignaciones_por_actividad = {}  # (entregable, codigoActividad) -> [ {nombre, rol, pesoPorcentaje} ]
    for r in filasA:
        key = (r[idxA['Entregable']], r[idxA['Código actividad']])
        peso = r[idxA['Peso en actividad']]
        asignaciones_por_actividad.setdefault(key, []).append(
            {
                'nombre': limpio(r[idxA['Persona / equipo']]),
                'rol': limpio(r[idxA['Rol']]),
                'pesoPorcentaje': round(float(peso) * 100, 4) if peso else 0.0,
            }
        )

    # ── Actividades: una por Entregable+Código, con su peso y detalle ──
    idxAct, filasAct = leer_hoja(wb['Actividades'])
    entregables = {}
    for r in filasAct:
        entCod = r[idxAct['Entregable']]
        compCod = r[idxAct['Componente']]
        actCod = r[idxAct['Código actividad']]
        peso = r[idxAct['Peso en entregable']]

        if entCod not in entregables:
            meta = entregables_meta.get(entCod, {'codigo': entCod, 'componente': compCod, 'nombre': None})
            entregables[entCod] = {
                'codigo': entCod,
                'componente': meta['componente'] or compCod,
                'nombre': meta['nombre'],
                'actividades': [],
            }

        key = (entCod, actCod)
        entregables[entCod]['actividades'].append(
            {
                'codigo': actCod,
                'etapa': limpio(r[idxAct['Tipo / etapa']]),
                'descripcion': limpio(r[idxAct['Actividad']]),
                'pesoPorcentaje': round(float(peso) * 100, 4) if peso else 0.0,
                'criterio': limpio(r[idxAct['Criterios de evidencia de referencia']]),
                'asignaciones': asignaciones_por_actividad.get(key, []),
            }
        )

    out = {
        'generadoDe': 'PAC_actividades_personas_y_pesos.xlsx',
        'nota': 'Generado por generar-actividades-json.py (no editar a mano).',
        'entregables': [entregables[k] for k in orden if k in entregables],
    }

    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    total_act = sum(len(e['actividades']) for e in out['entregables'])
    total_asig = sum(len(a['asignaciones']) for e in out['entregables'] for a in e['actividades'])
    print(
        f'OK: {len(out["entregables"])} entregables, {total_act} actividades, '
        f'{total_asig} asignaciones -> {OUT}'
    )


if __name__ == '__main__':
    main()
