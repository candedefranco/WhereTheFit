import { useState, useEffect, useRef } from "react"
import Layout from "../components/Layout"
import { apiFetch } from "../api"

interface Mutual {
  id: number
  username: string
  profile_picture: string | null
}

interface ChatMessage {
  id: number
  sender_id: number
  receiver_id: number
  text: string
  created_at: string
  sender_username: string
}

function Chat() {
  const [mutuals, setMutuals] = useState<Mutual[]>([])
  const [selectedMutual, setSelectedMutual] = useState<Mutual | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [ws, setWs] = useState<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // obtengo el user_id del usuario logueado
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}") as { id?: number }
  const currentUserId = currentUser.id

  // cargo la lista de mutuals al montar
  useEffect(() => {
    apiFetch("/chat/mutuals").then(async (res) => {
      if (res.ok) {
        const data = (await res.json()) as Mutual[]
        setMutuals(data)
      }
    })
  }, [])

  // conecto el WebSocket al montar y lo cierro al desmontar
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const socket = new WebSocket("ws://localhost:5002")

    socket.onopen = () => {
      // mando auth apenas se conecta
      socket.send(JSON.stringify({ type: "auth", token }))
    }

    socket.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data as string) as { type: string; message?: ChatMessage }

      if (data.type === "new_message" && data.message) {
        // mensaje recibido de otro usuario
        setMessages((prev) => [...prev, data.message!])
      } else if (data.type === "message_sent" && data.message) {
        // confirmacion de mi propio mensaje enviado
        setMessages((prev) => [...prev, data.message!])
      }
    }

    socket.onclose = () => {
      console.log("WebSocket desconectado")
    }

    setWs(socket)

    return () => {
      socket.close()
    }
  }, [])

  // scroll al ultimo mensaje cuando cambian los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // cargo los mensajes historicos cuando selecciono un mutual
  async function selectMutual(mutual: Mutual) {
    setSelectedMutual(mutual)
    setMessages([])

    const res = await apiFetch(`/chat/messages/${mutual.id}`)
    if (res.ok) {
      const data = (await res.json()) as ChatMessage[]
      setMessages(data)
    }
  }

  // envio un mensaje via WebSocket
  function sendMessage() {
    if (!newMessage.trim() || !selectedMutual || !ws) return

    ws.send(JSON.stringify({
      type: "message",
      to: selectedMutual.id,
      text: newMessage.trim(),
    }))

    setNewMessage("")
  }

  // enviar con Enter
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  return (
    <Layout>
      <div style={{ display: "flex", gap: "20px", height: "calc(100vh - 180px)", maxWidth: "900px", margin: "0 auto", padding: "20px" }}>

        {/* lista de mutuals */}
        <div style={{ width: "250px", borderRight: "1px solid #eee", paddingRight: "16px", overflowY: "auto" }}>
          <h3 style={{ marginBottom: "16px" }}>Chats</h3>
          {mutuals.length === 0 && <p style={{ color: "#888", fontSize: "14px" }}>No tenés mutuals todavía</p>}
          {mutuals.map((mutual) => (
            <div
              key={mutual.id}
              onClick={() => selectMutual(mutual)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: selectedMutual?.id === mutual.id ? "#f0f0f0" : "transparent",
              }}
            >
              <img
                src={mutual.profile_picture || "/favicon.svg"}
                alt={mutual.username}
                style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
              />
              <span style={{ fontWeight: 500 }}>{mutual.username}</span>
            </div>
          ))}
        </div>

        {/* area de conversacion */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {selectedMutual ? (
            <>
              {/* header del chat */}
              <div style={{ padding: "12px 0", borderBottom: "1px solid #eee", marginBottom: "12px" }}>
                <h4 style={{ margin: 0 }}>{selectedMutual.username}</h4>
              </div>

              {/* mensajes */}
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", paddingRight: "8px" }}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.sender_id === currentUserId ? "flex-end" : "flex-start",
                      backgroundColor: msg.sender_id === currentUserId ? "#007bff" : "#f0f0f0",
                      color: msg.sender_id === currentUserId ? "#fff" : "#333",
                      padding: "8px 14px",
                      borderRadius: "16px",
                      maxWidth: "70%",
                      wordBreak: "break-word",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "14px" }}>{msg.text}</p>
                    <span style={{ fontSize: "11px", opacity: 0.7 }}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* input de mensaje */}
              <div style={{ display: "flex", gap: "8px", paddingTop: "12px", borderTop: "1px solid #eee" }}>
                <input
                  type="text"
                  placeholder="Escribí un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ flex: 1, padding: "10px 16px", borderRadius: "20px", border: "1px solid #ddd", outline: "none", fontSize: "14px" }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  style={{ padding: "10px 20px", borderRadius: "20px", border: "none", backgroundColor: "#007bff", color: "#fff", cursor: "pointer", fontWeight: 500 }}
                >
                  Enviar
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>
              <p>Seleccioná un chat para empezar</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Chat
