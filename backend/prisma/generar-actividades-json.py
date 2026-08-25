# -*- coding: utf-8 -*-
"""Genera backend/prisma/actividades-pac.json desde el Excel de la Propuesta de
asignación de actividades. Reproducible; no editar el JSON a mano.

Uso (con openpyxl instalado):
    python backend/prisma/generar-actividades-json.py

Si el .xlsx está bloqueado por Excel/OneDrive, ciérralo o cópialo antes.
"""
import openpyxl, re, json, datetime, os

AQUI = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.normpath(os.path.join(
    AQUI, '..', '..', 'Documentosbase', 'Propuesta_asignacion_actividades_PAC.xlsx'))
OUT = os.path.join(AQUI, 'actividades-pac.json')

# Nombres canónicos del equipo (hoja "Perfiles"), 15 + Juana. Deben coincidir
# EXACTO con PERSONAS[*].nombre en enriquecer-pac.ts.
CANON = [
    'María José Suárez', 'Paola Andrea Ruiz Franco', 'Juliana Valencia',
    'Jeiner de Jesús Castellanos Barliza', 'Marcos Arango Tamayo',
    'Diana Carolina Ríos Echeverri', 'Harlem Acevedo Agudelo', 'Vanessa García Leoz',
    'Alejandro Silva Cortés', 'Guillermo Penagos', 'Luis Eduardo Vahos Hernández',
    'León Darío Orrego Espejo', 'Daniel González Montoya', 'Sebastián Cartagena',
    'Liliana Restrepo', 'Juana — Secretaría de Medio Ambiente',
]
canon_set = set(CANON)


def split_names(cell):
    if not cell:
        return []
    parts = re.split(r'\s+y\s+|,\s*', str(cell).strip())
    return [p.strip() for p in parts if p.strip()]


def fecha(v):
    if isinstance(v, (datetime.datetime, datetime.date)):
        return v.strftime('%Y-%m-%d')
    return None


def main():
    wb = openpyxl.load_workbook(SRC, data_only=True)
    ws = wb['Asignación detallada']
    rows = list(ws.iter_rows(values_only=True))
    hi = next(i for i, r in enumerate(rows) if r and r[0] == 'Comp.')
    data = [r for r in rows[hi + 1:] if r and r[0]]

    entregables, orden = {}, []
    for r in data:
        comp, _cn, idEnt, entNom, idAct, etapa, actEsp, resp, apoyo, peso, fi, ff, crit = r[:13]
        if idEnt not in entregables:
            entregables[idEnt] = {'codigo': idEnt, 'componente': comp,
                                  'nombre': entNom, 'actividades': []}
            orden.append(idEnt)
        rk, ak, at = [], [], []
        for n in split_names(resp):
            (rk if n in canon_set else at).append(n)
        for n in split_names(apoyo):
            (ak if n in canon_set else at).append(n)
        entregables[idEnt]['actividades'].append({
            'codigo': idAct, 'etapa': etapa, 'descripcion': actEsp,
            'responsables': rk, 'apoyos': ak, 'apoyosTexto': [t for t in at if t],
            'pesoPorcentaje': round(float(peso) * 100, 2),
            'fechaInicio': fecha(fi), 'fechaFin': fecha(ff),
            'criterio': (str(crit).strip() if crit else None),
        })

    out = {
        'generadoDe': 'Propuesta_asignacion_actividades_PAC.xlsx',
        'nota': 'Generado por generar-actividades-json.py (no editar a mano).',
        'entregables': [entregables[k] for k in orden],
    }
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f'OK: {len(out["entregables"])} entregables, '
          f'{sum(len(e["actividades"]) for e in out["entregables"])} actividades -> {OUT}')


if __name__ == '__main__':
    main()
