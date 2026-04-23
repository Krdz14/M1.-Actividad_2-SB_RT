# Laboratorio: Panel de Partido en Vivo con Supabase Realtime

**Asignatura:** Desarrollo Web Avanzado  
**Duración estimada:** 90 minutos  
**Modalidad:** Trabajo en equipo + implementación individual

---

## Objetivo

Construir una mini-aplicación web donde varios usuarios conectados vean actualizaciones en tiempo real de un partido deportivo simulado. La sincronización ocurre mediante **Supabase Realtime sobre cambios en Postgres**, sin polling ni recarga manual.

Al finalizar podrás explicar:

- Cómo funciona una suscripción Realtime sobre Postgres Changes.
- Por qué la carga inicial y la suscripción deben coexistir.
- Cómo prevenir duplicados entre datos precargados y eventos en vivo.
- Cómo limpiar correctamente una suscripción en React.

---

## Roles

| Rol | Cantidad | Responsabilidad |
|-----|----------|-----------------|
| **Administrador de Backend** | 1 por equipo | Crea y configura el proyecto en Supabase Cloud |
| **Desarrollador Frontend** | El resto del equipo | Implementa el cliente React y lo conecta al backend |

> El Administrador de Backend solo configura el backend. Luego también puede implementar su propio cliente frontend.

---

## PARTE DE EQUIPO — Configuración del Backend (Administrador)

> Esta parte la realiza **una sola persona** por equipo. El resultado es compartido con todos los compañeros.

### Paso 1 — Crear el proyecto en Supabase Cloud

1. Ingresa a [supabase.com](https://supabase.com) y crea una cuenta o inicia sesión.
2. Crea un **New Project**. Elige un nombre, región y contraseña de base de datos.
3. Espera a que el proyecto termine de inicializarse (~1-2 minutos).
4. Ve a **Project Settings → API** y anota:
   - **Project URL** → será `VITE_SUPABASE_URL`
   - **anon / public** key → será `VITE_SUPABASE_ANON_KEY`

> **IMPORTANTE:** Comparte únicamente la **anon key** (también llamada "publishable key") con tus compañeros. **Nunca compartas la `service_role` key**: esta clave bypasea RLS y tiene permisos administrativos completos. No debe aparecer nunca en código frontend.

---

### Paso 2 — Ejecutar el SQL de configuración

1. En el panel de Supabase, ve a **SQL Editor → New query**.
2. Copia el contenido completo del archivo `sql/setup.sql` y pégalo en el editor.
3. Ejecuta el script. Verifica que no aparezcan errores.

El script hace cuatro cosas:

| Sección | Qué hace |
|---------|----------|
| **Tablas** | Crea `match_state` (marcador) y `match_events` (feed de eventos) |
| **RLS** | Activa Row Level Security y crea políticas mínimas para el rol `anon` |
| **Realtime** | Agrega ambas tablas a la publicación de Supabase Realtime |
| **Semillas** | Inserta un partido inicial con marcador 0-0 y tres eventos de ejemplo |

> **Decisión de diseño:** Se usan dos tablas en lugar de una. Esto permite que los estudiantes observen claramente dos patrones distintos: `UPDATE` en `match_state` (el marcador cambia) e `INSERT` en `match_events` (llega un nuevo evento). Una sola tabla complicaría la lógica del cliente sin aportar valor pedagógico.

---

### Paso 3 — Verificar Realtime en el dashboard

1. Ve a **Database → Replication** en el panel de Supabase.
2. Confirma que `match_state` y `match_events` aparecen habilitadas bajo la publicación `supabase_realtime`.

> Si no aparecen, el `ALTER PUBLICATION` del script puede haber encontrado un conflicto. En ese caso, habilitarlas manualmente desde el toggle del dashboard.

---

### Paso 4 — Compartir las variables con el equipo

Envía a tus compañeros (por el chat del equipo o de forma presencial) únicamente:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## PARTE INDIVIDUAL — Implementación del Frontend

> Esta parte la realiza **cada integrante del equipo** en su propia máquina.

### Paso 1 — Crear el proyecto Vite

Si recibes el repositorio ya creado, salta al Paso 2.

Si vas a crearlo desde cero:

```bash
npm create vite@latest live-match-panel -- --template react
cd live-match-panel
```

### Paso 2 — Instalar dependencias

```bash
npm install @supabase/supabase-js
```

O si partes del repositorio entregado:

```bash
npm install
```

### Paso 3 — Configurar variables de entorno

Crea el archivo `.env.local` en la raíz del proyecto (nunca lo subas a Git):

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

Reemplaza los valores con los que te compartió el Administrador de Backend.

> Vite expone solo las variables que empiezan con `VITE_`. El archivo `.env.local` es ignorado por Git automáticamente.

### Paso 4 — Revisar el código del cliente

Abre cada archivo y léelo antes de ejecutar la app. Los puntos clave son:

**`src/lib/supabaseClient.js`**  
Crea y exporta el cliente Supabase a partir de las variables de entorno. Es un singleton reutilizado por todos los componentes.

**`src/App.jsx`**  
Contiene toda la lógica de estado:

- `useEffect` #1 → carga inicial: consulta el estado actual antes de que llegue cualquier evento realtime.
- `useEffect` #2 → suscripción realtime: escucha `UPDATE` en `match_state` e `INSERT` en `match_events`.
- Funciones de acción (`goalHome`, `goalAway`, `resetScore`) → modifican la base de datos; el cambio llega de vuelta por Realtime.

**`src/components/Scoreboard.jsx`**  
Panel visual del marcador. Recibe props y llama callbacks; no habla directamente con Supabase.

**`src/components/EventFeed.jsx`**  
Lista de eventos ordenada del más reciente al más antiguo.

**`src/components/NewEventForm.jsx`**  
Formulario que inserta directamente en `match_events`. No cambia estado local; el evento aparece en el feed a través del canal Realtime.

### Paso 5 — Ejecutar la aplicación

```bash
npm run dev
```

Abre `http://localhost:5173`. Deberías ver el panel con el marcador 0-0 y los tres eventos de ejemplo.

### Paso 6 — Demostrar el Realtime

1. Abre la app en **dos navegadores distintos** (o pídele a un compañero que abra su instancia).
2. Desde un navegador, pulsa **"+1 Local"** — el marcador debe actualizarse en ambos sin recargar.
3. Agrega un evento desde el formulario — debe aparecer en el feed de ambos clientes casi inmediatamente.
4. Abre las DevTools → Network → WS para observar el WebSocket activo de Supabase Realtime.

---

## Flujo de datos (resumen visual)

```
Cliente A (navegador)          Supabase Cloud             Cliente B (navegador)
       |                              |                              |
       |── INSERT match_events ──────>|                              |
       |                              |── WebSocket (Realtime) ─────>|
       |                              |    { event: INSERT,          |
       |                              |      table: match_events,    |
       |                              |      new: { ... } }          |
       |                              |                              |
       |── UPDATE match_state ───────>|                              |
       |                              |── WebSocket (Realtime) ─────>|
       |                              |    { event: UPDATE,          |
       |                              |      table: match_state,     |
       |                              |      new: { ... } }          |
```

---

## Prevención de duplicados

Cuando la app carga, hace una consulta inicial y guarda los eventos en estado. Casi al mismo tiempo, la suscripción Realtime puede entregar un evento que ya estaba en esa consulta. El código en `App.jsx` maneja esto:

```js
setEvents((prev) => {
  if (prev.some((e) => e.id === payload.new.id)) return prev
  return [payload.new, ...prev]
})
```

Si el `id` ya existe en la lista, el evento se descarta silenciosamente.

---

## Limpieza de la suscripción

El segundo `useEffect` devuelve una función de cleanup:

```js
return () => {
  supabase.removeChannel(channel)
}
```

React la ejecuta cuando el componente se desmonta. Sin esto, cada hot-reload o remontaje crearía un canal adicional, y el mismo evento llegaría varias veces.

---

## ENTREGABLE INDIVIDUAL — Tarea asignada por estudiante

> Esta sección es **individual**. Cada estudiante recibe una tarea distinta que extiende la app base. Todas las tareas se integran sobre el mismo proyecto Supabase del equipo, por lo que cuando todos conectan sus clientes, las contribuciones de cada uno son visibles para los demás.

### Asignación de tareas

| Tarea | Componente a construir | Feature de Realtime que aprende |
|-------|------------------------|----------------------------------|
| [Tarea A](TAREA_A.md) | Historial de cambios del marcador | Acumular eventos `UPDATE` en memoria |
| [Tarea B](TAREA_B.md) | Indicador de usuarios conectados | **Presence** |
| [Tarea C](TAREA_C.md) | Notificaciones toast de eventos remotos | Distinguir eventos propios vs ajenos |
| [Tarea D](TAREA_D.md) | Panel de estadísticas calculadas en vivo | Estado derivado del stream de `INSERT` |
| [Tarea E](TAREA_E.md) | Chat en vivo efímero | **Broadcast** |

Cada archivo de tarea incluye:
- Descripción visual de lo que se construye
- Explicación del concepto de Realtime que aplica
- Código completo del componente nuevo
- Instrucciones exactas de los cambios en `App.jsx`
- Pasos para demostrar que funciona
- Una pregunta de reflexión individual

### Lo que se evalúa individualmente

1. El componente funciona y se ve en pantalla.
2. El estudiante puede explicar **por qué** usa ese feature de Realtime y no otro.
3. El estudiante responde la pregunta de reflexión de su tarea.

---

## Criterios de aceptación

Marca cada punto una vez que puedas demostrarlo en clase:

**Base del equipo:**
- [ ] El Administrador configuró Supabase y compartió las variables públicas.
- [ ] Dos o más compañeros ejecutan la app en máquinas o navegadores distintos.
- [ ] Al agregar un evento desde un cliente, el resto lo ve sin recargar.
- [ ] Al cambiar el marcador desde un cliente, el resto lo ve sin recargar.
- [ ] No se generan duplicados evidentes.
- [ ] Un cliente que llega tarde ve el estado actual (gracias a la carga inicial).
- [ ] No se usa `service_role` key en el frontend.
- [ ] La suscripción se cancela correctamente (verificar en DevTools que el WS cierra al desmontar).

**Individual:**
- [ ] El componente de la tarea asignada está implementado y visible.
- [ ] El componente responde a eventos Realtime en vivo (se puede demostrar con dos navegadores).
- [ ] El estudiante puede explicar el concepto de Realtime que usó.

---

## Reto Extra (Opcional) — Broadcast en lugar de Postgres Changes

Supabase Realtime ofrece dos mecanismos principales:

| Mecanismo | Cómo funciona | Cuándo usarlo |
|-----------|--------------|---------------|
| **Postgres Changes** | Escucha cambios reales en la base de datos (INSERT, UPDATE, DELETE). Requiere RLS correctamente configurada. | Cuando la fuente de verdad debe ser la BD y necesitas persistencia. |
| **Broadcast** | Envía mensajes efímeros entre clientes conectados al mismo canal, sin pasar por la BD. | Cuando necesitas baja latencia, no necesitas persistencia y la escala importa. |

Supabase recomienda Broadcast como opción preferente para sincronización de clientes en tiempo real a gran escala. Para este laboratorio se usó Postgres Changes porque su propósito es que el estudiante observe directamente la conexión entre operaciones de base de datos y eventos en el cliente.

**Qué cambiaría en el código:**

En lugar de escuchar `postgres_changes`, el canal emitiría y recibiría mensajes de tipo `broadcast`:

```js
// Suscripción con Broadcast
const channel = supabase
  .channel('match-broadcast')
  .on('broadcast', { event: 'new-event' }, (payload) => {
    setEvents((prev) => [payload.payload, ...prev])
  })
  .subscribe()

// Emisión desde el formulario (en vez de insertar en BD)
await channel.send({
  type: 'broadcast',
  event: 'new-event',
  payload: { event_type: eventType, minute, description },
})
```

Con este enfoque los mensajes **no se persisten en Postgres**: un cliente que llega tarde no verá los eventos anteriores. Para tener ambas cosas (baja latencia + persistencia) se combina Broadcast con una escritura en BD por separado.

---

## Preguntas de reflexión

1. ¿Qué pasa si la red se interrumpe momentáneamente? ¿Cómo sabría el cliente que perdió la conexión?
2. ¿Por qué es importante la carga inicial aunque tengamos Realtime activo?
3. ¿Qué vulnerabilidad de seguridad tendríamos si usáramos la `service_role` key en el frontend?
4. ¿Qué diferencia hay entre un canal de Supabase con `postgres_changes` y uno con `broadcast`?
5. ¿Qué ocurriría si dos clientes pulsaran "+1 Local" exactamente al mismo tiempo?
