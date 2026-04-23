# Panel de Partido en Vivo — Supabase Realtime

Proyecto de laboratorio para demostrar suscripciones en tiempo real con Supabase y React + Vite.

## Requisitos previos

- Node.js 18 o superior
- Un proyecto de Supabase configurado (ver `LABORATORIO.md`, Parte A)

## Instalación

```bash
npm install
```

## Configurar variables de entorno

Copia el archivo de ejemplo y rellena tus valores:

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

Obtén estos valores en el panel de Supabase:  
**Project Settings → API → Project URL** y **anon / public key**.

## Ejecutar en desarrollo

```bash
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

## Demostrar Realtime con varios clientes

1. Abre la app en dos navegadores distintos (o dos equipos diferentes).
2. Desde uno, agrega un evento o pulsa "+1 Local".
3. Observa cómo el otro cliente actualiza su pantalla automáticamente sin recargar.

## Estructura del proyecto

```
src/
  lib/supabaseClient.js      Cliente Supabase (singleton)
  components/
    Scoreboard.jsx           Panel del marcador + botones
    EventFeed.jsx            Lista cronológica de eventos
    NewEventForm.jsx         Formulario para agregar eventos
  App.jsx                    Estado global + suscripción Realtime
sql/
  setup.sql                  Tablas, RLS, Realtime y semillas
```
