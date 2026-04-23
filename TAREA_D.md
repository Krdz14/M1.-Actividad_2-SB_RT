# Tarea Individual D — Panel de estadísticas en vivo

**Estudiante asignado:** ___________________________  
**Feature de Realtime:** Estado derivado del stream de `INSERT`

---

## Qué vas a construir

Un panel que muestra contadores calculados a partir de los eventos del partido. Los números se actualizan automáticamente cada vez que llega un nuevo evento vía Realtime, sin ninguna consulta extra a la base de datos.

```
┌───────────────────────────────────────────────────┐
│ ESTADÍSTICAS DEL PARTIDO                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │
│  │   3    │ │   2    │ │   1    │ │   4    │     │
│  │ Goles  │ │T. Amar.│ │T. Roja │ │ Faltas │     │
│  └────────┘ └────────┘ └────────┘ └────────┘     │
└───────────────────────────────────────────────────┘
```

---

## Concepto clave: estado derivado

Las estadísticas **no son estado independiente**: se calculan a partir del array `events` que ya existe en `App.jsx`. No necesitas ninguna consulta extra a Supabase. Cada vez que `events` cambia (por carga inicial o por Realtime), React re-renderiza y los contadores reflejan el nuevo total automáticamente.

```
events (estado en App) ──→ StatsPanel calcula contadores ──→ UI
                              (filter + length, sin useState)
```

---

## Archivos que debes crear o modificar

| Acción | Archivo |
|--------|---------|
| Crear | `src/components/StatsPanel.jsx` |
| Modificar | `src/App.jsx` (2 cambios pequeños) |

---

## Archivo nuevo: `src/components/StatsPanel.jsx`

```jsx
// Definición de los contadores que quieres mostrar.
// Agrega o quita entradas para personalizar el panel.
const STATS = [
  { key: 'Gol',              label: 'Goles',       color: '#27ae60' },
  { key: 'Tarjeta amarilla', label: 'T. Amarillas', color: '#f39c12' },
  { key: 'Tarjeta roja',     label: 'T. Rojas',     color: '#e74c3c' },
  { key: 'Falta',            label: 'Faltas',       color: '#8e44ad' },
  { key: 'Saque de esquina', label: 'Córners',      color: '#2980b9' },
]

export default function StatsPanel({ events }) {
  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>Estadísticas del partido</h3>

      <div style={styles.grid}>
        {STATS.map(({ key, label, color }) => {
          // El cálculo ocurre aquí, en cada render. No necesita estado propio.
          const count = events.filter((e) => e.event_type === key).length

          return (
            <div
              key={key}
              style={{ ...styles.card, borderTop: `3px solid ${color}` }}
            >
              <span style={styles.count}>{count}</span>
              <span style={styles.label}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  panel: {
    background: '#fafafa',
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  title: {
    margin: '0 0 0.75rem',
    fontSize: '0.82rem',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  grid: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  card: {
    background: 'white',
    borderRadius: '6px',
    padding: '0.6rem 0.8rem',
    textAlign: 'center',
    flex: '1 1 70px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  count: {
    display: 'block',
    fontSize: '1.6rem',
    fontWeight: 'bold',
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  },
  label: {
    display: 'block',
    fontSize: '0.68rem',
    color: '#999',
    marginTop: '3px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
}
```

---

## Cambios en `src/App.jsx`

### Cambio 1 — Agregar el import (arriba del archivo)

```js
import StatsPanel from './components/StatsPanel'   // [D]
```

### Cambio 2 — Renderizar el componente (en el return, entre `<Scoreboard>` y `<NewEventForm>`)

```jsx
<Scoreboard ... />
<StatsPanel events={events} />    {/* [D] */}
<NewEventForm />
<EventFeed events={events} />
```

No necesitas cambiar ninguna otra lógica: el componente recibe `events` como prop y calcula todo por sí solo.

---

## Cómo demostrar que funciona

1. Abre la app: los contadores parten desde los eventos ya cargados de la base de datos.
2. Agrega un evento de tipo "Gol" desde cualquier cliente → el contador de Goles sube en todos los navegadores conectados.
3. Agrega una "Tarjeta amarilla" → solo ese contador sube; los demás no cambian.
4. Reinicia el marcador: los contadores de `StatsPanel` **no** se reinician (correcto: ellos cuentan eventos registrados, no el marcador).

---

## Reto adicional (opcional)

¿Puedes mostrar los goles separados por equipo? Necesitarás agregar un campo `team` al formulario y a la tabla `match_events`. Piensa qué cambios implicaría eso en el SQL.

---

## Pregunta de reflexión

Este componente no tiene ningún `useState` propio. ¿En qué se diferencia eso de un componente que suscribe sus propios datos directamente? ¿Cuándo conviene cada enfoque?
