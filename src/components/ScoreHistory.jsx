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