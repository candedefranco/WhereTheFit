import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { apiFetch, API_BASE } from "../api"
import Layout from "../components/Layout"

function EditUser() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [currentPicture, setCurrentPicture] = useState("")
  const [pictureFile, setPictureFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const navigate = useNavigate()

  const { id } = useParams()
  const currentUser = JSON.parse(localStorage.getItem("user") || "null")

  async function loadUser() {
    const response = await apiFetch(`/users/${id}`)
    const data = await response.json()
    setUsername(data.username)
    setEmail(data.email)
    setCurrentPicture(data.profile_picture || "")
  }

  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
      return
    }
    loadUser()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsSaving(true)

    const token = localStorage.getItem("token")

    // si hay foto nueva, mando como FormData
    if (pictureFile) {
      const formData = new FormData()
      formData.append("username", username)
      formData.append("email", email)
      if (password) formData.append("password", password)
      formData.append("profile_picture_file", pictureFile)

      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await response.json()
      setIsSaving(false)

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data))
        navigate("/profile")
      } else {
        setError(data.error)
      }
      return
    }

    // si no hay foto nueva, mando JSON normal
    const body: Record<string, string> = { username, email }
    if (password) body.password = password

    const response = await apiFetch(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    })

    const data = await response.json()
    setIsSaving(false)

    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data))
      navigate("/profile")
    } else {
      setError(data.error)
    }
  }

  return (
    <Layout>
      <div className="container">
        <div className="card">
          <h2>Editar perfil</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Nueva contraseña (opcional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* foto de perfil */}
            <div style={{ marginBottom: "14px" }}>
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "6px" }}>Foto de perfil</p>

              {/* preview de la foto actual o la nueva */}
              {(pictureFile || currentPicture) && (
                <div style={{ marginBottom: "8px" }}>
                  <img
                    src={pictureFile ? URL.createObjectURL(pictureFile) : currentPicture}
                    alt="foto de perfil"
                    style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e0e0e0" }}
                  />
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setPictureFile(file)
                }}
              />
            </div>

            <div className="btn-row">
              <button type="submit" disabled={isSaving} className="btn">
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>
              <a href="/profile" className="btn btn-secondary">Cancelar</a>
            </div>
          </form>

          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </Layout>
  )
}

export default EditUser
