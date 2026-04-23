# Tarea Individual C — Notificaciones Toast de eventos remotos

**Estudiante asignado:** ___________________________  
**Feature de Realtime:** Distinguir eventos propios vs eventos de otros clientes

---

## Qué vas a construir

Una notificación temporal (toast) que aparece en la esquina superior derecha cada vez que **otro cliente** agrega un evento. Si tú mismo agregas un evento, no ves el toast (ya lo ves en el feed).

```
┌─────────────────────────┐
│  ⚽  Gol                │  ← aparece en la esquina
│      min. 67            │     y desaparece en 3s
└─────────────────────────┘
```

---

## Concepto clave: distinguir eventos propios de ajenos

Sin autenticación, la única forma de saber si un evento lo insertó este cliente es guardar el `id` de la fila antes de que llegue el evento Realtime. El flujo es:

```
1. Usuario pulsa "Enviar" en el formulario
2. Supabase inserta la fila y devuelve su id
3. Guardamos ese id en un Set (localInsertIds)
4. Llega el evento Realtime con el mismo id
5. Está en el Set → es nuestro → no mostramos toast → lo borramos del Set
6. Si el id NO está en el Set → es de otro cliente → mostramos toast
```

---

## Archivos que debes crear o modificar

| Acción | Archivo |
|--------|---------|
| Crear | `src/components/ToastContainer.jsx` |
| Modificar | `src/App.jsx` (4 cambios) |
| Modificar | `src/components/NewEventForm.jsx` (1 cambio) |

---

## Archivo nuevo: `src/components/ToastContainer.jsx`

```jsx
import { useEffect } from 'react'

const ICONS = {
  'Gol':              '⚽',
  'Tarjeta amarilla': '🟨',
  'Tarjeta roja':     '🟥',
  'Falta':            '🚫',
  'Saque de esquina': '🚩',
}

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div style={styles.wrapper}>
      {toasts.map((t) => (
        <Toast key={t.toastId} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function Toast({ toast, onDismiss }) {
  // Auto-dismiss después de 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.toastId), 3000)
    return () => clearTimeout(timer)
  }, [toast.toastId, onDismiss])

  return (
    <div style={styles.toast} onClick={() => onDismiss(toast.toastId)}>
      <span style={styles.icon}>
        {ICONS[toast.event_type] ?? '📌'}
      </span>
      <div>
        <div style={styles.type}>{toast.event_type}</div>
        {toast.minute != null && (
          <div style={styles.detail}>min. {toast.minute}</div>
        )}
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    zIndex: 1000,
    pointerEvents: 'none',   // no bloquea clicks en la app
  },
  toast: {
    background: '#222',
    color: 'white',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    minWidth: '210px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
    cursor: 'pointer',
    pointerEvents: 'all',
  },
  icon:   { fontSize: '1.4rem' },
  type:   { fontWeight: 'bold', fontSize: '0.9rem' },
  detail: { fontSize: '0.75rem', color: '#aaa', marginTop: '1px' },
}
```

---

## Cambios en `src/App.jsx`

### Cambio 1 — Agregar imports (arriba del archivo)

```js
import { useEffect, useRef, useState } from 'react'   // agregar useRef
import ToastContainer from './components/ToastContainer'   // [C]
```

### Cambio 2 — Agregar estado y ref (junto a los otros useState, dentro del componente)

```js
const [toasts, setToasts]     = useState([])          // [C]
const localInsertIds          = useRef(new Set())      // [C] ids insertados por este cliente
```

### Cambio 3 — Modificar el handler INSERT en el useEffect de Realtime

Reemplaza el bloque `.on('postgres_changes', { event: 'INSERT' ... })` existente por este:

```js
.on(
  'postgres_changes',
  { event: 'INSERT', schema: 'public', table: 'match_events' },
  (payload) => {
    // Actualizar el feed (igual que antes)
    setEvents((prev) => {
      if (prev.some((e) => e.id === payload.new.id)) return prev
      return [payload.new, ...prev]
    })

    // [C] Solo mostrar toast si el evento lo insertó otro cliente
    if (localInsertIds.current.has(payload.new.id)) {
      localInsertIds.current.delete(payload.new.id)
    } else {
      setToasts((prev) => [
        ...prev,
        { ...payload.new, toastId: Date.now() },
      ])
    }
  },
)
```

### Cambio 4 — Renderizar en el return (antes del `<div>` principal o al final)

```jsx
{/* [C] Notificaciones — fuera del flujo normal porque usan position: fixed */}
<ToastContainer
  toasts={toasts}
  onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.toastId !== id))}
/>
```

---

## Cambio en `src/components/NewEventForm.jsx`

El formulario necesita devolver el `id` de la fila insertada para que `App.jsx` lo registre como "mío".

### Cambio 1 — Aceptar la prop `onInsert`

```jsx
// Antes:
export default function NewEventForm() {

// Después:
export default function NewEventForm({ onInsert }) {
```

### Cambio 2 — Pedir el id de vuelta después del insert y notificar

```js
// Antes:
await supabase.from('match_events').insert({
  event_type:  eventType,
  minute:      minute ? parseInt(minute, 10) : null,
  description: description.trim() || null,
})

// Después:
const { data } = await supabase
  .from('match_events')
  .insert({
    event_type:  eventType,
    minute:      minute ? parseInt(minute, 10) : null,
    description: description.trim() || null,
  })
  .select('id')   // pedir el id de la fila insertada
  .single()

// [C] Registrar el id antes de que llegue el evento Realtime
if (data?.id && onInsert) onInsert(data.id)
```

### Cambio 3 — Pasar la prop desde `App.jsx`

En el return de `App.jsx`, cambia la línea de `<NewEventForm />` por:

```jsx
<NewEventForm onInsert={(id) => localInsertIds.current.add(id)} />
```

---

## Cómo demostrar que funciona

1. Abre la app en dos navegadores (A y B).
2. Desde A, agrega un evento: el toast **no** aparece en A (es tuyo), sí aparece en B.
3. Desde B, agrega otro evento: el toast aparece en A, no en B.
4. El toast desaparece solo a los 3 segundos. También puedes cerrarlo con un click.

---

## Pregunta de reflexión

¿Por qué usamos `useRef` para `localInsertIds` en lugar de `useState`? ¿Qué pasaría si lo metiéramos en el estado?
