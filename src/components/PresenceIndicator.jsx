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