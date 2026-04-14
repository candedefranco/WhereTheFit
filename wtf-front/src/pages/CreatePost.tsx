import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"

function CreatePost() {
  // estados para guardar lo que escribe el usuario
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState("")

  // estados para tags y estilos nuevos
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState("")
  const predefinedTags = ["Vintage", "Streetwear", "Coquette", "Old Money", "Aesthetic", "Minimalist"]

  const navigate = useNavigate()

  // traigo el usuario logueado del localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "null")

  // si no hay sesion, mando al login
  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
    }
  }, [])

  // funcion para seleccionar/deseleccionar tags predefinidos
  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag))
    } else if (tags.length < 5) {
      setTags([...tags, tag])
    }
  }

  // funcion para agregar tags escritos a mano apretando Enter
  const addCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customTag.trim() !== "") {
      e.preventDefault()
      const newTag = customTag.trim().replace("#", "")
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag])
      }
      setCustomTag("")
    }
  }

async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    // uso FormData para poder mandar el archivo de imagen
    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("category", category)
    formData.append("tags", tags.join(","))
    if (imageFile) {
      // agrego la imagen al FormData si el usuario subio una
      formData.append("image", imageFile)
    }

    // mando FormData sin Content-Type, el browser lo pone solo
    const token = localStorage.getItem("token")
    const response = await fetch("http://localhost:5001/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await response.json()

    if (response.ok) {
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

            {/* seccion de estilos y tags estilo pinterest */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#444', marginLeft: '4px' }}>Estilos (Tags)</label>
              <div className="tags-selection-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {predefinedTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-pill ${tags.includes(tag) ? 'active' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    #{tag}
                  </button>
                ))}
                {tags.filter(t => !predefinedTags.includes(t)).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className="tag-pill active"
                    onClick={() => toggleTag(tag)}
                  >
                    #{tag}
                  </button>
                ))}
                <input
                  type="text"
                  placeholder="+ nuevo"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={addCustomTag}
                  className="tag-input-style"
                  style={{ border: '1px dashed #6a9ea8', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', width: '80px', outline: 'none' }}
                />
              </div>
            </div>

            {/* input para subir imagen desde la computadora */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
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