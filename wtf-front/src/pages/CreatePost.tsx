import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { apiFetch } from "../api"

function CreatePost() {
  // estados para guardar lo que escribe el usuario
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // traigo el usuario logueado del localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "null")

  // si no hay sesion, mando al login
  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    // mando el post al back con los datos del formulario
    const response = await apiFetch("/posts", {
      method: "POST",
      body: JSON.stringify({
        title,
        description,
        category,
        image_url: imageUrl,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      // si se creo bien, voy al feed
      navigate("/feed")
    } else {
      setError(data.error)
    }
  }

  return (
    <Layout>
      <div className="container">
        <div className="card">
          <h2>Nueva búsqueda</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Título (ej: Busco esta campera)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            {/* textarea para descripcion larga */}
            <textarea
              placeholder="Descripción (talle, zona, detalles de la prenda...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
            <input
              type="text"
              placeholder="Categoría (ej: Camperas, Pantalones)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            {/* url de la imagen de referencia, opcional */}
            <input
              type="text"
              placeholder="URL de imagen de referencia"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <div className="btn-row">
              <button type="submit" className="btn">Publicar</button>
              <a href="/feed" className="btn btn-secondary">Cancelar</a>
            </div>
          </form>

          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </Layout>
  )
}

export default CreatePost