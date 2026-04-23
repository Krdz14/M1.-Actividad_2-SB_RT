# Tarea Individual A — Historial de cambios del marcador

**Estudiante asignado:** ___________________________  
**Feature de Realtime:** Acumulación de eventos `UPDATE` en memoria

---

## Qué vas a construir

Un bloque debajo del marcador que muestra un registro cronológico de cada vez que el marcador cambió, con la hora exacta del cambio:

```
Historial del marcador
──────────────────────────────────
  1 - 0    18:34:12
  1 - 1    18:41:05
  2 - 1    18:55:47
```

La lista solo crece mientras el cliente está abierto. Un cliente que llega tarde no verá los cambios anteriores (eso es correcto: el historial vive en memoria, no en la base de datos).

---

## Archivos que debes crear o modificar

| Acción | Archivo |
|--------|---------|
| Crear | `src/components/ScoreHistory.jsx` |
| Modificar | `src/App.jsx` (3 cambios pequeños) |

---

## Archivo nuevo: `src/components/ScoreHistory.jsx`

Crea este archivo completo:

```jsx
export default function ScoreHistory({ history }) {
  if (history.length === 0) return null

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Historial del marcador</h3>
      <ul style={styles.list}>
        {history.map((entry, i) => (
          <li key={i} style={styles.item}>
            <span style={styles.score}>
              {entry.home} - {entry.away}
            </span>
            <span style={styles.time}>
              {new Date(entry.at).toLocaleTimeString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const styles = {
  container: {
    background: '#f0f4f8',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  title: {
    margin: '0 0 0.6rem',
    fontSize: '0.85rem',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.35rem 0',
    borderBottom: '1px solid #dde3ea',
    fontSize: '0.9rem',
  },
  score: {
    fontWeight: 'bold',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.05em',
  },
  time: { color: '#888', fontSize: '0.8rem' },
}
```

---

## Cambios en `src/App.jsx`

Aplica los tres cambios marcados con `// [A]` en el código:

### Cambio 1 — Agregar el import del nuevo componente (arriba del archivo)

```js
import ScoreHistory from './components/ScoreHistory'   // [A]
```

### Cambio 2 — Agregar el estado del historial (dentro del componente, junto a los otros useState)

```js
const [scoreHistory, setScoreHistory] = useState([])   // [A]
```

### Cambio 3 — Acumular el historial dentro del handler de Realtime UPDATE

Busca el bloque `.on('postgres_changes', { event: 'UPDATE', ...` y modifícalo así:

```js
.on(
  'postgres_changes',
  { event: 'UPDATE', schema: 'public', table: 'match_state' },
  (payload) => {
    setMatch(payload.new)
    // [A] Cada UPDATE agrega una entrada al historial en memoria
    setScoreHistory((prev) => [
      {
        home: payload.new.home_score,
        away: payload.new.away_score,
        at: new Date().toISOString(),
      },
      ...prev,
    ])
  },
)
```

### Cambio 4 — Renderizar el componente (en el return, debajo de `<Scoreboard .../>`)

```jsx
<ScoreHistory history={scoreHistory} />    {/* [A] */}
```

---

## Cómo demostrar que funciona

1. Abre la app en dos navegadores.
2. Desde uno, pulsa "+1 Local" varias veces.
3. Ambos navegadores deben mostrar el historial creciendo en tiempo real.
4. Abre un tercer navegador: verá el marcador actual pero el historial estará vacío (correcto, no hay persistencia).

---

## Pregunta de reflexión

¿Qué habría que cambiar si quisieras que el historial persista aunque el usuario recargue? ¿Qué tabla y qué política RLS necesitarías?
