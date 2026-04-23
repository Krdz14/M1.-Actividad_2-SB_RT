import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const EVENT_TYPES = [
  'Gol',
  'Tarjeta amarilla',
  'Tarjeta roja',
  'Falta',
  'Saque de esquina',
  'Offside',
  'Sustitución',
  'Medio tiempo',
  'Fin del partido',
  'Otro',
]

export default function NewEventForm() {
  const [eventType,   setEventType]   = useState(EVENT_TYPES[0])
  const [minute,      setMinute]      = useState('')
  const [description, setDescription] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [sent,        setSent]        = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    await supabase.from('match_events').insert({
      event_type:  eventType,
      minute:      minute ? parseInt(minute, 10) : null,
      description: description.trim() || null,
    })

    setMinute('')
    setDescription('')
    setLoading(false)
    setSent(true)
    setTimeout(() => setSent(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.title}>Agregar evento</h3>

      <div style={styles.row}>
        <div>
          <label style={styles.label}>Tipo de evento</label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            style={styles.input}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={styles.label}>Minuto</label>
          <input
            type="number"
            min="0"
            max="120"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            placeholder="45"
            style={{ ...styles.input, width: '64px' }}
          />
        </div>

        <div style={{ flex: 1, minWidth: '160px' }}>
          <label style={styles.label}>Descripción (opcional)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción breve..."
            style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ ...styles.submitBtn, alignSelf: 'flex-end' }}
        >
          {loading ? '...' : sent ? 'Enviado' : 'Enviar'}
        </button>
      </div>
    </form>
  )
}

const styles = {
  form: {
    background: '#f5f5f5',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  title: { margin: '0 0 0.75rem', fontSize: '1rem', color: '#333' },
  row: {
    display: 'flex',
    gap: '0.6rem',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  label: {
    display: 'block',
    fontSize: '0.72rem',
    marginBottom: '3px',
    color: '#555',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  input: {
    padding: '0.4rem 0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '0.9rem',
    height: '34px',
    boxSizing: 'border-box',
  },
  submitBtn: {
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '0 1.2rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    height: '34px',
  },
}
