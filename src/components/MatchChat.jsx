import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Nombre aleatorio para este cliente durante la sesión
const MY_NAME = `Usuario-${Math.floor(Math.random() * 9000) + 1000}`;

export default function MatchChat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const channelRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const channel = supabase
      .channel("match-chat") // canal dedicado al chat
      .on("broadcast", { event: "comment" }, ({ payload }) => {
        // Recibir comentarios de otros clientes
        setMessages((prev) => [...prev.slice(-49), payload]);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const message = {
      author: MY_NAME,
      text: trimmed,
      at: new Date().toISOString(),
    };

    // Enviar a todos los demás por Broadcast
    await channelRef.current.send({
      type: "broadcast",
      event: "comment",
      payload: message,
    });

    // Broadcast no hace echo al remitente: agregamos el mensaje localmente
    setMessages((prev) => [...prev.slice(-49), message]);
    setText("");
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>
        Comentarios en vivo
        <span style={styles.badge}>Broadcast</span>
      </h3>

      <div style={styles.feed}>
        {messages.length === 0 && (
          <p style={styles.empty}>Sin comentarios todavía.</p>
        )}
        {messages.map((m, i) => {
          const isOwn = m.author === MY_NAME;
          return (
            <div
              key={i}
              style={{
                ...styles.row,
                flexDirection: isOwn ? "row-reverse" : "row",
              }}
            >
              <span style={styles.author}>{isOwn ? "Tú" : m.author}</span>
              <span
                style={{
                  ...styles.bubble,
                  background: isOwn ? "#6c5ce7" : "#eee",
                  color: isOwn ? "white" : "#333",
                }}
              >
                {m.text}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={styles.form}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un comentario..."
          style={styles.input}
          maxLength={120}
        />
        <button type="submit" disabled={!text.trim()} style={styles.btn}>
          Enviar
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
    marginBottom: "1rem",
  },
  header: {
    margin: 0,
    padding: "0.65rem 1rem",
    background: "#f5f5f5",
    borderBottom: "1px solid #ddd",
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontWeight: "bold",
    color: "#333",
  },
  badge: {
    fontSize: "0.62rem",
    background: "#6c5ce7",
    color: "white",
    borderRadius: "4px",
    padding: "1px 6px",
    fontWeight: "normal",
    letterSpacing: "0.03em",
  },
  feed: {
    height: "220px",
    overflowY: "auto",
    padding: "0.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    background: "white",
  },
  empty: { color: "#bbb", fontStyle: "italic", fontSize: "0.85rem", margin: 0 },
  row: {
    display: "flex",
    gap: "0.4rem",
    alignItems: "baseline",
  },
  author: {
    fontSize: "0.72rem",
    color: "#999",
    whiteSpace: "nowrap",
    fontWeight: "bold",
  },
  bubble: {
    borderRadius: "12px",
    padding: "0.3rem 0.7rem",
    fontSize: "0.88rem",
    maxWidth: "75%",
    wordBreak: "break-word",
  },
  form: {
    display: "flex",
    borderTop: "1px solid #ddd",
  },
  input: {
    flex: 1,
    padding: "0.55rem 0.75rem",
    border: "none",
    outline: "none",
    fontSize: "0.9rem",
    background: "white",
  },
  btn: {
    padding: "0.55rem 1rem",
    background: "#6c5ce7",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.85rem",
  },
};
