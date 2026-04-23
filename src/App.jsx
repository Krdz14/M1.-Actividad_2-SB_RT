import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import Scoreboard   from './components/Scoreboard'
import EventFeed    from './components/EventFeed'
import NewEventForm from './components/NewEventForm'

export default function App() {
  const [match,  setMatch]  = useState(null)
  const [events, setEvents] = useState([])
  const [error,  setError]  = useState(null)

  // ── Carga inicial ──────────────────────────────────────────────
  // Se ejecuta una sola vez al montar. Garantiza que un cliente que
  // llega tarde igual vea el estado actual antes de que lleguen
  // los eventos realtime.
  useEffect(() => {
    async function loadData() {
      const { data: matchData, error: matchErr } = await supabase
        .from('match_state')
        .select('*')
        .single()

      if (matchErr) { setError(matchErr.message); return }
      setMatch(matchData)

      const { data: eventsData, error: eventsErr } = await supabase
        .from('match_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (eventsErr) { setError(eventsErr.message); return }
      setEvents(eventsData)
    }

    loadData()
  }, [])

  // ── Suscripción Realtime ───────────────────────────────────────
  // Un canal agrupa ambas suscripciones. El cleanup cancela el canal
  // cuando el componente se desmonta, evitando listeners duplicados.
  useEffect(() => {
    const channel = supabase
      .channel('match-live')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'match_state' },
        (payload) => setMatch(payload.new),
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'match_events' },
        (payload) => {
          setEvents((prev) => {
            // Evitar duplicados si la carga inicial y el evento realtime
            // llegan en orden inesperado (condición de carrera).
            if (prev.some((e) => e.id === payload.new.id)) return prev
            return [payload.new, ...prev]
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // ── Acciones del marcador ──────────────────────────────────────
  async function goalHome() {
    if (!match) return
    await supabase
      .from('match_state')
      .update({ home_score: match.home_score + 1, updated_at: new Date().toISOString() })
      .eq('id', match.id)
  }

  async function goalAway() {
    if (!match) return
    await supabase
      .from('match_state')
      .update({ away_score: match.away_score + 1, updated_at: new Date().toISOString() })
      .eq('id', match.id)
  }

  async function resetScore() {
    if (!match) return
    await supabase
      .from('match_state')
      .update({ home_score: 0, away_score: 0, updated_at: new Date().toISOString() })
      .eq('id', match.id)
  }

  // ── Render ─────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ padding: '2rem', color: '#c0392b', fontFamily: 'sans-serif' }}>
        <strong>Error al conectar:</strong> {error}
        <p style={{ fontSize: '0.85rem', color: '#555' }}>
          Verifica que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén en tu .env.local
        </p>
      </div>
    )
  }

  if (!match) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: '#555' }}>
        Conectando con Supabase...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '760px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.1rem', color: '#888', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Panel de Partido en Vivo
      </h1>

      <Scoreboard
        match={match}
        onGoalHome={goalHome}
        onGoalAway={goalAway}
        onReset={resetScore}
      />

      <NewEventForm />

      <EventFeed events={events} />
    </div>
  )
}
