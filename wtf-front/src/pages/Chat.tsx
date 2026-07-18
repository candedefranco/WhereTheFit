import { useState, useEffect, useRef } from "react"
import Layout from "../components/Layout"
import { apiFetch, WS_BASE } from "../api"

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
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // obtengo el user_id del usuario logueado
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}") as { id?: number; username?: string }
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

    const socket = new WebSocket(WS_BASE)

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "auth", token }))
    }

    socket.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data as string) as { type: string; message?: ChatMessage }

      if (data.type === "auth_ok") {
        setIsConnected(true)
      } else if (data.type === "new_message" && data.message) {
        setMessages((prev) => [...prev, data.message!])
      } else if (data.type === "message_sent" && data.message) {
        setMessages((prev) => [...prev, data.message!])
      }
    }

    socket.onclose = () => {
      setIsConnected(false)
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

  // busco el ultimo mensaje de una conversacion para el preview
  function getLastMessagePreview(mutualId: number): string {
    // solo funciona para la conversacion activa, sino mostramos un placeholder
    if (selectedMutual?.id === mutualId && messages.length > 0) {
      const last = messages[messages.length - 1]
      const prefix = last.sender_id === currentUserId ? "Vos: " : ""
      return prefix + (last.text.length > 30 ? last.text.slice(0, 30) + "..." : last.text)
    }
    return "Toca para chatear"
  }

  return (
    <Layout>
      <div style={{
        display: "flex",
        height: "calc(100vh - 140px)",
        maxWidth: "950px",
        margin: "0 auto",
        background: "#fff",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #dbdbdb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}>

        {/* sidebar de conversaciones */}
        <div style={{
          width: "320px",
          borderRight: "1px solid #efefef",
          display: "flex",
          flexDirection: "column",
          background: "#fafafa",
        }}>
          {/* header del sidebar */}
          <div style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid #efefef",
            background: "#fff",
          }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Mensajes</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: isConnected ? "#22c55e" : "#ef4444",
                display: "inline-block",
              }} />
              <span style={{ fontSize: "12px", color: "#888" }}>
                {isConnected ? "Conectado" : "Desconectado"}
              </span>
            </div>
          </div>

          {/* lista de mutuals */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {mutuals.length === 0 && (
              <div style={{ padding: "24px 16px", textAlign: "center" }}>
                <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>No tenés mutuals todavía.</p>
                <p style={{ color: "#aaa", fontSize: "12px", marginTop: "4px" }}>Seguí gente y que te sigan de vuelta para chatear.</p>
              </div>
            )}
            {mutuals.map((mutual) => (
              <div
                key={mutual.id}
                onClick={() => selectMutual(mutual)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  background: selectedMutual?.id === mutual.id ? "#efefef" : "transparent",
                  transition: "background 0.15s",
                }}
              >
                <img
                  src={mutual.profile_picture || "/favicon.svg"}
                  alt={mutual.username}
                  style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    objectFit: "cover", border: "2px solid #e0e0e0",
                  }}
                />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px", color: "#262626" }}>
                    {mutual.username}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {getLastMessagePreview(mutual.id)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* area de conversacion */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff" }}>
          {selectedMutual ? (
            <>
              {/* header de la conversacion */}
              <div style={{
                padding: "14px 20px",
                borderBottom: "1px solid #efefef",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "#fff",
              }}>
                <img
                  src={selectedMutual.profile_picture || "/favicon.svg"}
                  alt={selectedMutual.username}
                  style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "1px solid #e0e0e0" }}
                />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "15px", color: "#262626" }}>
                    {selectedMutual.username}
                  </p>
                </div>
              </div>

              {/* mensajes */}
              <div style={{
                flex: 1, overflowY: "auto", padding: "20px",
                display: "flex", flexDirection: "column", gap: "6px",
                background: "#fafafa",
              }}>
                {messages.length === 0 && (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ color: "#aaa", fontSize: "14px" }}>
                      Empezá la conversación con {selectedMutual.username} 👋
                    </p>
                  </div>
                )}
                {messages.map((msg, index) => {
                  const isMine = msg.sender_id === currentUserId
                  const msgDate = new Date(msg.created_at).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
                  const prevMsgDate = index > 0 ? new Date(messages[index - 1].created_at).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }) : null
                  const showDateSeparator = index === 0 || msgDate !== prevMsgDate

                  return (
                    <div key={msg.id}>
                      {showDateSeparator && (
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0 10px" }}>
                          <div style={{ flex: 1, height: "1px", background: "#e0e0e0" }} />
                          <span style={{ fontSize: "12px", color: "#888", whiteSpace: "nowrap", textTransform: "capitalize" }}>
                            {msgDate}
                          </span>
                          <div style={{ flex: 1, height: "1px", background: "#e0e0e0" }} />
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: isMine ? "flex-end" : "flex-start",
                          marginBottom: "2px",
                        }}
                      >
                        <div style={{
                          maxWidth: "65%",
                          padding: "10px 14px",
                          borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          background: isMine ? "#3b82f6" : "#fff",
                          color: isMine ? "#fff" : "#262626",
                          border: isMine ? "none" : "1px solid #efefef",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                          wordBreak: "break-word",
                        }}>
                          <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.4" }}>{msg.text}</p>
                          <p style={{
                            margin: "4px 0 0", fontSize: "11px",
                            color: isMine ? "rgba(255,255,255,0.7)" : "#aaa",
                            textAlign: "right",
                          }}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* input de mensaje */}
              <div style={{
                padding: "14px 20px",
                borderTop: "1px solid #efefef",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#fff",
              }}>
                <input
                  type="text"
                  placeholder="Enviar mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{
                    flex: 1, padding: "12px 18px", borderRadius: "22px",
                    border: "1px solid #dbdbdb", outline: "none", fontSize: "14px",
                    background: "#fafafa",
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    padding: "10px 20px", borderRadius: "22px", border: "none",
                    background: newMessage.trim() ? "#3b82f6" : "#bfdbfe",
                    color: "#fff", cursor: newMessage.trim() ? "pointer" : "default",
                    fontWeight: 600, fontSize: "14px",
                    transition: "background 0.15s",
                  }}
                >
                  Enviar
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "#888" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", border: "3px solid #dbdbdb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "32px" }}>💬</span>
              </div>
              <p style={{ fontSize: "16px", fontWeight: 500, color: "#262626", margin: 0 }}>Tus mensajes</p>
              <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>Seleccioná un chat para empezar a hablar</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Chat
