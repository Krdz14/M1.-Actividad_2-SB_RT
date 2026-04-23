# Tarea Individual B — Usuarios conectados en vivo (Presence)

**Estudiante asignado:** ___________________________  
**Feature de Realtime:** Supabase Presence

---

## Qué vas a construir

Un indicador en la parte superior de la app que muestra cuántos usuarios están viendo el partido en este momento:

```
● 3 usuarios conectados
```

El número sube cuando alguien abre la app y baja cuando cierra la pestaña. Todo ocurre en tiempo real sin tocar la base de datos.

---

## Concepto clave: Presence

Presence es una funcionalidad de Supabase Realtime distinta a `postgres_changes`. En lugar de escuchar cambios en la base de datos, permite que los clientes **anuncien su presencia** en un canal y vean quién más está conectado.

```
Cliente A se une al canal → canal tiene {A}
Cliente B se une al canal → canal tiene {A, B}
Cliente A cierra pestaña  → canal tiene {B}
```

Cada cliente llama a `channel.track(datos)` para anunciar que está presente. Supabase se encarga de limpiar automáticamente cuando un cliente se desconecta.

---

## Archivos que debes crear o modificar

| Acción | Archivo |
|--------|---------|
| Crear | `src/components/PresenceIndicator.jsx` |
| Modificar | `src/App.jsx` (2 cambios pequeños) |

---

## Archivo nuevo: `src/components/PresenceIndicator.jsx`

Crea este archivo completo:

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function PresenceIndicator() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Canal dedicado a presence, separado del canal de datos del partido
    const channel = supabase.channel('match-presence')

    channel
      .on('presence', { event: 'sync' }, () => {
        // presenceState() devuelve un objeto donde cada key es un cliente
        const state = channel.presenceState()
        setCount(Object.keys(state).length)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Anunciarse en el canal; el objeto puede tener cualquier dato
          await channel.track({ joined_at: new Date().toISOString() })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div style={styles.badge}>
      <span style={styles.dot} />
      {count === 0
        ? 'Conectando...'
        : `${count} ${count === 1 ? 'usuario conectado' : 'usuarios conectados'}`}
    </div>
  )
}

const styles = {
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '999px',
    padding: '0.3rem 0.8rem',
    fontSize: '0.82rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    border: '1px solid #c8e6c9',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#4caf50',
    flexShrink: 0,
  },
}
```

---

## Cambios en `src/App.jsx`

### Cambio 1 — Agregar el import (arriba del archivo)

```js
import PresenceIndicator from './components/PresenceIndicator'   // [B]
```

### Cambio 2 — Renderizar el componente (en el return, antes del `<Scoreboard>`)

```jsx
<PresenceIndicator />    {/* [B] */}
<Scoreboard ... />
```

---

## Cómo demostrar que funciona

1. Abre la app en un navegador → verás "1 usuario conectado".
2. Abre una segunda pestaña o un segundo navegador → ambos muestran "2 usuarios conectados".
3. Cierra una de las pestañas → el contador baja a 1 en el cliente restante.

---

## Pregunta de reflexión

Presence usa WebSocket, no la base de datos. Si el servidor reinicia o la conexión se cae, ¿qué pasaría con el contador? ¿Por qué Presence no es adecuado para guardar quién visitó la página históricamente?
