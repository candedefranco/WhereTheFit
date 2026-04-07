import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Layout from "../components/Layout"
import { apiFetch } from "../api"

function EditPost() {
  // estados para guardar los datos del post
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [status, setStatus] = useState("active")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // obtengo el id del post de la URL (ej: /feed/edit/3)
  const { id } = useParams()

  // traigo el usuario logueado del localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "null")

  async function loadPost() {
    // traigo los datos del post para prellenar el formulario
    const response = await apiFetch(`/posts/${id}`)
    const data = await response.json()

    setTitle(data.title)
    setDescription(data.description)
    setCategory(data.category || "")
    setImageUrl(data.image_url || "")
    setStatus(data.status)
  }

  // si no hay sesion, mando al login
  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
      return
    }
    loadPost()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    // mando los datos actualizados al back
    const response = await apiFetch(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        title,
        description,
        category,
        image_url: imageUrl,
        status,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      // si se actualizo bien, vuelvo al feed
      navigate("/feed")
    } else {
      setError(data.error)
    }
  }

  return (
    <Layout>
      <div className="container">
        <div className="card">
          <h2>Editar publicación</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
            <input
              type="text"
              placeholder="Categoría"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <input
              type="text"
              placeholder="URL de imagen de referencia"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />

            {/* selector para marcar el post como resuelto */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="select-input"
            >
              <option value="active">En búsqueda</option>
              <option value="resolved">Resuelto</option>
            </select>

            <div className="btn-row">
              <button type="submit" className="btn">Guardar cambios</button>
              <a href="/feed" className="btn btn-secondary">Cancelar</a>
            </div>
          </form>

          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </Layout>
  )
}

export default EditPost