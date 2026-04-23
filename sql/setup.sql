-- ================================================================
-- LABORATORIO: Panel de Partido en Vivo — Supabase Realtime
-- ================================================================
-- Ejecutar este script completo en el SQL Editor de Supabase Cloud
-- (Database > SQL Editor > New query)
-- ================================================================


-- ----------------------------------------------------------------
-- 1. TABLAS
-- ----------------------------------------------------------------
-- Decisión de diseño: dos tablas separadas.
--   match_state  → una fila por partido, guarda el marcador actual
--   match_events → una fila por evento, crece con cada jugada
-- Esto permite escuchar UPDATE en match_state (marcador cambia)
-- e INSERT en match_events (llega un nuevo evento) de forma
-- independiente y pedagógicamente clara para los estudiantes.
-- ----------------------------------------------------------------

create table if not exists match_state (
  id          uuid        primary key default gen_random_uuid(),
  match_name  text        not null,
  home_score  integer     not null default 0,
  away_score  integer     not null default 0,
  updated_at  timestamptz default now()
);

create table if not exists match_events (
  id          uuid        primary key default gen_random_uuid(),
  event_type  text        not null,
  minute      integer,
  description text,
  created_at  timestamptz default now()
);


-- ----------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------
-- RLS protege las tablas: sin políticas, ninguna petición anónima
-- puede leer ni escribir. La anon key del frontend asigna el rol
-- `anon`, por lo que cada política especifica `to anon`.
-- ----------------------------------------------------------------

alter table match_state  enable row level security;
alter table match_events enable row level security;

-- match_state: lectura libre + actualización del marcador
create policy "anon puede leer match_state"
  on match_state for select
  to anon
  using (true);

create policy "anon puede actualizar match_state"
  on match_state for update
  to anon
  using (true)
  with check (true);

-- match_events: lectura libre + inserción de nuevos eventos
create policy "anon puede leer match_events"
  on match_events for select
  to anon
  using (true);

create policy "anon puede insertar match_events"
  on match_events for insert
  to anon
  with check (true);


-- ----------------------------------------------------------------
-- 3. HABILITAR REALTIME
-- ----------------------------------------------------------------
-- Agrega ambas tablas a la publicación que Supabase usa para
-- transmitir cambios de Postgres a los clientes conectados.
-- Nota: si ya existe una publicación activa solo ejecutar el ALTER.
-- ----------------------------------------------------------------

alter publication supabase_realtime add table match_state;
alter publication supabase_realtime add table match_events;


-- ----------------------------------------------------------------
-- 4. DATOS INICIALES (semillas)
-- ----------------------------------------------------------------

insert into match_state (match_name, home_score, away_score)
values ('Real Madrid vs Barcelona', 0, 0);

insert into match_events (event_type, minute, description) values
  ('Inicio',           1,  'Pitido inicial — comienza el partido'),
  ('Falta',           12,  'Falta cometida por el equipo visitante en el mediocampo'),
  ('Saque de esquina', 18, 'Córner para el equipo local tras disparo al poste');
