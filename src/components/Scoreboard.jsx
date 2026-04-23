export default function Scoreboard({ match, onGoalHome, onGoalAway, onReset }) {
  return (
    <div style={styles.card}>
      <p style={styles.matchName}>{match.match_name}</p>

      <div style={styles.score}>
        {match.home_score} : {match.away_score}
      </div>

      <p style={styles.timestamp}>
        Última actualización: {new Date(match.updated_at).toLocaleTimeString()}
      </p>

      <div style={styles.buttons}>
        <button onClick={onGoalHome} style={btn('#27ae60')}>+1 Local</button>
        <button onClick={onGoalAway} style={btn('#2980b9')}>+1 Visitante</button>
        <button onClick={onReset}    style={btn('#c0392b')}>Reiniciar</button>
      </div>
    </div>
  )
}

function btn(background) {
  return {
    background,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '0.5rem 1.2rem',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 'bold',
  }
}

const styles = {
  card: {
    background: '#1a1a2e',
    color: 'white',
    borderRadius: '10px',
    padding: '1.5rem',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  matchName: {
    margin: '0 0 0.4rem',
    fontSize: '1rem',
    color: '#aaa',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  score: {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    margin: '0.4rem 0',
    letterSpacing: '0.1em',
  },
  timestamp: {
    fontSize: '0.78rem',
    color: '#666',
    margin: '0 0 1rem',
  },
  buttons: {
    display: 'flex',
    gap: '0.6rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
}
