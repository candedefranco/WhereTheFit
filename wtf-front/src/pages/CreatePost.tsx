import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"

function CreatePost() {
  // estados para guardar lo que escribe el usuario
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [error, setError] = useState("")

  // estados para tags y estilos nuevos
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState("")
  const predefinedTags = ["Vintage", "Streetwear", "Coquette", "Old Money", "Aesthetic", "Minimalist"]

  // estados para Gemini
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [isSuggesting, setIsSuggesting] = useState(false)

  // estados para ubicacion GPS
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [locationStatus, setLocationStatus] = useState<"loading" | "ok" | "denied" | null>(null)

  // estados para ingresar la ubicacion a mano cuando no hay GPS
  const [manualLat, setManualLat] = useState("")
  const [manualLng, setManualLng] = useState("")

  const [isPublishing, setIsPublishing] = useState(false)

  const navigate = useNavigate()

  // traigo el usuario logueado del localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "null")

  // si no hay sesion, mando al login
  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
    }
  }, [])

  // capturo la ubicacion del usuario al cargar el componente
  useEffect(() => {
    // si el browser no soporta geolocalizacion, paso directo al ingreso manual
    if (!navigator.geolocation) {
      setLocationStatus("denied")
      return
    }
    setLocationStatus("loading")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
        setLocationStatus("ok")
      },
      () => setLocationStatus("denied")
    )
  }, [])

  // actualizo la latitud cuando el usuario la escribe a mano
  function handleManualLat(value: string) {
    setManualLat(value)
    const parsed = parseFloat(value)
    setLatitude(isNaN(parsed) ? null : parsed)
  }

  // actualizo la longitud cuando el usuario la escribe a mano
  function handleManualLng(value: string) {
    setManualLng(value)
    const parsed = parseFloat(value)
    setLongitude(isNaN(parsed) ? null : parsed)
  }

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

  async function handleSuggestTags(e: React.MouseEvent) {
    e.preventDefault()
    setError("")

    if (imageFiles.length === 0) {
      setError("Subí al menos una imagen para que la IA la analice.")
      return
    }

    setIsSuggesting(true)

    const formData = new FormData()
    formData.append("image", imageFiles[0]) // mandamos la primera imagen
    formData.append("description", description)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5001/posts/suggest-tags", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.status === 401) {
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        window.location.href = "/login"
        return
      }

      if (response.ok) {
        // filtramos para que no sugiera tags que ya tenés seleccionados
        const newSuggestions = data.tags.filter((t: string) => !tags.includes(t))
        setSuggestedTags(newSuggestions)
      } else {
        setError(data.error || "Error al sugerir tags")
      }
    } catch (err) {
      setError("Error de conexión con la IA")
    } finally {
      setIsSuggesting(false)
    }
  }

  // funcion para pasar un tag de "sugerido" a "seleccionado"
  const acceptSuggestedTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag])
    }
    setSuggestedTags(suggestedTags.filter(t => t !== tag))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsPublishing(true)

    // uso FormData para poder mandar el archivo de imagen
    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("category", category)
    formData.append("tags", tags.join(","))
    imageFiles.forEach((file) => {
      formData.append("images", file)
    })

    // agrego lat/lng si el usuario dio permiso de ubicacion o la ingreso a mano
    if (latitude !== null && longitude !== null) {
      formData.append("latitude", latitude.toString())
      formData.append("longitude", longitude.toString())
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
    setIsPublishing(false)

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
              maxLength={500}
            />
            {/* dropdown de categoria */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Seleccioná una categoría</option>
              <option value="Abrigos">Abrigos</option>
              <option value="Pantalones">Pantalones</option>
              <option value="Remeras">Remeras</option>
              <option value="Vestidos">Vestidos</option>
              <option value="Faldas">Faldas</option>
              <option value="Zapatos">Zapatos</option>
              <option value="Accesorios">Accesorios</option>
              <option value="Bolsos">Bolsos</option>
              <option value="Ropa interior">Ropa interior</option>
              <option value="Deportivo">Deportivo</option>
              <option value="Otro">Otro</option>
            </select>

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

            <div>
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "6px" }}>
                {imageFiles.length > 0 ? `${imageFiles.length} imagen(es) seleccionada(s)` : "Subir imágenes (máximo 3)"}
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).slice(0, 3)
                  setImageFiles(files)
                }}
              />
            </div>

            {/* seccion gemini */}
            <div style={{ marginTop: "12px", marginBottom: "16px" }}>
              <button
                onClick={handleSuggestTags}
                disabled={imageFiles.length === 0 || isSuggesting}
                type="button"
                style={{
                  width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d8b4fe",
                  backgroundColor: "#f0e6ff", color: "#6b21a8", fontWeight: "bold", cursor: imageFiles.length === 0 ? "not-allowed" : "pointer"
                }}
              >
                {isSuggesting ? "Pensando..." : "✨ Sugerir tags con IA (requiere subir imagen)"}
              </button>
            </div>

            {suggestedTags.length > 0 ? (
              <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px", fontWeight: 600 }}>
                  Sugerencias de IA (clic para agregar):
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {suggestedTags.map((tag, i) => (
                    <span
                      key={i}
                      onClick={() => acceptSuggestedTag(tag)}
                      style={{ padding: "4px 12px", backgroundColor: "#e2e8f0", color: "#334155", borderRadius: "16px", cursor: "pointer", fontSize: "13px" }}
                    >
                      + {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* indicador de ubicacion */}
            <div style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>
              {locationStatus === "loading" && "📍 Detectando ubicación..."}
              {locationStatus === "ok" && "📍 Ubicación detectada ✓"}
              {locationStatus === "denied" && "📍 No pudimos detectar tu ubicación automáticamente. Podés ingresarla a mano:"}
            </div>

            {/* input manual de ubicacion, solo aparece si no hay GPS disponible */}
            {locationStatus === "denied" && (
              <div style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Latitud (ej: -34.6037)"
                    value={manualLat}
                    onChange={(e) => handleManualLat(e.target.value)}
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Longitud (ej: -58.3816)"
                    value={manualLng}
                    onChange={(e) => handleManualLng(e.target.value)}
                  />
                </div>
                <p style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>
                  Tip: buscá tu ubicación en Google Maps, hacé clic derecho sobre el lugar y copiá las coordenadas que aparecen.
                </p>
              </div>
            )}

            <div className="btn-row">
              <button type="submit" disabled={isPublishing} className="btn">
                {isPublishing ? "Publicando..." : "Publicar"}
              </button>
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