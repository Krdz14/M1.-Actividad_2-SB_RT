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
